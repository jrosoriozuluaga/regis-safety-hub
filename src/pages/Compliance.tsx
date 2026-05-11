import { useEffect, useState, useMemo } from "react";
import { FileCheck, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { empresasService, cumplimientoService } from "@/services";
import { supabase } from "@/lib/supabase";
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

export default function Compliance() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [cumplimiento, setCumplimiento] = useState<CumplimientoEmpresa | null>(null);
  const [estandares, setEstandares] = useState<Estandar[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

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
      cumplimientoService.getLatest(selectedEmpresa).then((c) => {
        setCumplimiento(c);
        if (c) {
          supabase.from("items_cumplimiento").select("estandar_id, calificacion")
            .eq("cumplimiento_id", c.id).then(({ data }) => {
              if (data) {
                setCheckedItems(Object.fromEntries(data.map((d: any) => [d.estandar_id, d.calificacion === "cumple"])));
              }
            });
        } else {
          setCheckedItems({});
        }
      });
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

  const liveScores = useMemo(() => {
    const scores = { total: 0, planear: 0, hacer: 0, verificar: 0, actuar: 0 };
    const maxScores = { total: 0, planear: 0, hacer: 0, verificar: 0, actuar: 0 };
    filteredEstandares.forEach((e) => {
      const cicloKey = e.ciclo?.toLowerCase() as "planear" | "hacer" | "verificar" | "actuar";
      const peso = e.peso_porcentual || 0;
      maxScores.total += peso;
      if (cicloKey in maxScores) maxScores[cicloKey] += peso;
      if (checkedItems[e.id]) {
        scores.total += peso;
        if (cicloKey in scores) scores[cicloKey] += peso;
      }
    });
    return {
      total: maxScores.total > 0 ? Math.round((scores.total / maxScores.total) * 100) : 0,
      planear: maxScores.planear > 0 ? Math.round((scores.planear / maxScores.planear) * 100) : 0,
      hacer: maxScores.hacer > 0 ? Math.round((scores.hacer / maxScores.hacer) * 100) : 0,
      verificar: maxScores.verificar > 0 ? Math.round((scores.verificar / maxScores.verificar) * 100) : 0,
      actuar: maxScores.actuar > 0 ? Math.round((scores.actuar / maxScores.actuar) * 100) : 0,
    };
  }, [filteredEstandares, checkedItems]);

  const handleToggle = (estandarId: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [estandarId]: checked }));
  };

  const handleSave = async () => {
    if (!selectedEmpresa) { toast.error("Selecciona una empresa"); return; }
    setSaving(true);
    try {
      let cumplimientoId = cumplimiento?.id;

      if (!cumplimientoId) {
        const { data: newC, error: cErr } = await supabase.from("cumplimiento_empresa").insert({
          empresa_id: selectedEmpresa,
          anio: new Date().getFullYear(),
          puntaje_total: liveScores.total,
          puntaje_planear: liveScores.planear,
          puntaje_hacer: liveScores.hacer,
          puntaje_verificar: liveScores.verificar,
          puntaje_actuar: liveScores.actuar,
          fecha_evaluacion: new Date().toISOString().split("T")[0],
        }).select().single();
        if (cErr) throw cErr;
        cumplimientoId = newC.id;
        setCumplimiento(newC);
      } else {
        await supabase.from("cumplimiento_empresa").update({
          puntaje_total: liveScores.total,
          puntaje_planear: liveScores.planear,
          puntaje_hacer: liveScores.hacer,
          puntaje_verificar: liveScores.verificar,
          puntaje_actuar: liveScores.actuar,
          fecha_evaluacion: new Date().toISOString().split("T")[0],
        }).eq("id", cumplimientoId);
      }

      await supabase.from("items_cumplimiento").delete().eq("cumplimiento_id", cumplimientoId);
      const items = filteredEstandares.map((e) => ({
        cumplimiento_id: cumplimientoId,
        estandar_id: e.id,
        calificacion: checkedItems[e.id] ? "cumple" : "no_cumple",
        puntaje_obtenido: checkedItems[e.id] ? e.peso_porcentual : 0,
      }));
      if (items.length > 0) {
        await supabase.from("items_cumplimiento").insert(items);
      }

      toast.success(`Evaluación guardada — Puntaje: ${liveScores.total}%`);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div>
      <PageHeader
        title="Cumplimiento Resolución 0312"
        description="Evaluación interactiva de estándares mínimos del SG-SST según ciclo PHVA."
      />

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        {(user?.role === "admin" || user?.role === "consultor") && (
          <div className="lg:col-span-4 flex items-end gap-4">
            <div className="max-w-sm space-y-2 flex-1">
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
            {selectedEmpresa && (
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Guardando..." : "Guardar Evaluación"}
              </Button>
            )}
          </div>
        )}

        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{liveScores.total}%</div>
            <div className="text-xs text-muted-foreground mt-1">Puntaje Total</div>
            <Progress value={liveScores.total} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">{checkedCount}/{filteredEstandares.length} ítems</div>
          </CardContent>
        </Card>
        {([
          { label: "Planear", val: liveScores.planear, color: "text-blue-600" },
          { label: "Hacer", val: liveScores.hacer, color: "text-emerald-600" },
          { label: "Verificar", val: liveScores.verificar, color: "text-amber-600" },
          { label: "Actuar", val: liveScores.actuar, color: "text-purple-600" },
        ] as const).map(({ label, val, color }) => (
          <Card key={label} className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{val}%</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
              <Progress value={val} className="h-2 mt-2" />
            </CardContent>
          </Card>
        ))}
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
                        <TableHead className="w-12">Cumple</TableHead>
                        <TableHead className="w-20">Ítem</TableHead>
                        <TableHead>Estándar</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center w-20">Peso %</TableHead>
                        <TableHead className="w-32">Evidencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((e) => (
                        <TableRow key={e.id} className={checkedItems[e.id] ? "bg-green-50/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={!!checkedItems[e.id]}
                              onCheckedChange={(v) => handleToggle(e.id, !!v)}
                            />
                          </TableCell>
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
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
