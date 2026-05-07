import { useEffect, useState } from "react";
import { FileCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { empresasService, cumplimientoService } from "@/services";
import type { Empresa, CumplimientoEmpresa } from "@/types/domain";

type Estandar = {
  id: string;
  ciclo: string;
  estandar: string;
  item_codigo: string;
  item_descripcion: string;
  peso_porcentual: number;
  aplica_cap1: boolean;
  aplica_cap2: boolean;
  aplica_cap3: boolean;
  tipo_documento_evidencia: string;
  activo: boolean;
};

const cicloColors: Record<string, string> = {
  PLANEAR: "text-blue-700 bg-blue-50",
  HACER: "text-emerald-700 bg-emerald-50",
  VERIFICAR: "text-amber-700 bg-amber-50",
  ACTUAR: "text-purple-700 bg-purple-50",
};

export default function Compliance() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [cumplimiento, setCumplimiento] = useState<CumplimientoEmpresa | null>(null);
  const [estandares, setEstandares] = useState<Estandar[]>([]);

  useEffect(() => {
    cumplimientoService.estandares().then(setEstandares);
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmpresa) {
      cumplimientoService.getLatest(selectedEmpresa).then(setCumplimiento);
    }
  }, [selectedEmpresa]);

  const selectedCapitulo = empresas.find((e) => e.id === selectedEmpresa)?.capitulo_0312 || "";
  const filteredEstandares = estandares.filter((e) => {
    if (!selectedCapitulo) return true;
    if (selectedCapitulo === "1" || selectedCapitulo === "capitulo_1") return e.aplica_cap1;
    if (selectedCapitulo === "2" || selectedCapitulo === "capitulo_2") return e.aplica_cap2;
    return e.aplica_cap3;
  });

  const ciclos = ["PLANEAR", "HACER", "VERIFICAR", "ACTUAR"];
  const byCiclo = ciclos.map((c) => ({
    ciclo: c,
    items: filteredEstandares.filter((e) => e.ciclo?.toUpperCase() === c),
  }));

  return (
    <div>
      <PageHeader
        title="Cumplimiento Resolución 0312"
        description="Evaluación de estándares mínimos del SG-SST según ciclo PHVA."
      />

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        {(user?.role === "admin" || user?.role === "consultor") && (
          <div className="lg:col-span-4">
            <div className="max-w-sm space-y-2">
              <Label>Empresa</Label>
              <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.razon_social} — Cap. {e.capitulo_0312}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {cumplimiento && (
          <>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{cumplimiento.puntaje_total}%</div>
                <div className="text-xs text-muted-foreground mt-1">Puntaje Total</div>
                <Progress value={cumplimiento.puntaje_total} className="h-2 mt-2" />
              </CardContent>
            </Card>
            {([
              { label: "Planear", val: cumplimiento.puntaje_planear, color: "text-blue-600" },
              { label: "Hacer", val: cumplimiento.puntaje_hacer, color: "text-emerald-600" },
              { label: "Verificar", val: cumplimiento.puntaje_verificar, color: "text-amber-600" },
            ] as const).map(({ label, val, color }) => (
              <Card key={label} className="shadow-card">
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${color}`}>{val}%</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                  <Progress value={val} className="h-2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4" /> Estándares mínimos ({filteredEstandares.length} ítems)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="PLANEAR">
            <div className="px-4 pt-2">
              <TabsList>
                {ciclos.map((c) => (
                  <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
                ))}
              </TabsList>
            </div>
            {byCiclo.map(({ ciclo, items }) => (
              <TabsContent key={ciclo} value={ciclo} className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Ítem</TableHead>
                        <TableHead>Estándar</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center w-20">Peso %</TableHead>
                        <TableHead className="w-32">Evidencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-mono text-xs">{e.item_codigo}</TableCell>
                          <TableCell className="text-sm font-medium max-w-[200px] truncate">{e.estandar}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[300px]">
                            <div className="line-clamp-2">{e.item_descripcion}</div>
                          </TableCell>
                          <TableCell className="text-center tabular-nums">{e.peso_porcentual}%</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{e.tipo_documento_evidencia || "—"}</TableCell>
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No hay estándares en este ciclo para el capítulo seleccionado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
