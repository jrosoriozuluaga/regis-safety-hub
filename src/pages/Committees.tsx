import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { empresasService, comitesService } from "@/services";
import type { Empresa, Comite, IntegranteComite } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";

export default function Committees() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [comites, setComites] = useState<Comite[]>([]);
  const [selectedComite, setSelectedComite] = useState("");
  const [tipoComite, setTipoComite] = useState<"copasst" | "convivencia">("copasst");
  const [members, setMembers] = useState<IntegranteComite[]>([]);
  const [points, setPoints] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedEmpresa) return;
    comitesService.listByEmpresa(selectedEmpresa).then(setComites);
  }, [selectedEmpresa]);

  useEffect(() => {
    const match = comites.find(c => c.tipo_comite === tipoComite && c.estado === "activo");
    if (match) {
      setSelectedComite(match.id);
      comitesService.integrantes(match.id).then((m) => {
        setMembers(m);
        setAttendance(Object.fromEntries(m.map((x) => [x.id, true])));
      });
    } else {
      setSelectedComite("");
      setMembers([]);
      setAttendance({});
    }
  }, [comites, tipoComite]);

  const handleGenerate = async () => {
    if (!selectedComite) { toast.error("No hay comité activo para esta empresa"); return; }
    try {
      await comitesService.createActa({
        comite_id: selectedComite,
        numero_acta: 1,
        fecha_reunion: new Date().toISOString().split("T")[0],
        hora_inicio: new Date().toTimeString().slice(0, 5),
        tipo_reunion: "ordinaria",
        lugar: "Oficinas de la empresa",
        hay_quorum: Object.values(attendance).filter(Boolean).length > members.length / 2,
        estado: "borrador",
      });
      toast.success("Acta generada correctamente");
      setPoints("");
    } catch (err: any) {
      toast.error(err.message || "Error al crear el acta");
    }
  };

  return (
    <div>
      <PageHeader title="Actas de Comité" description="Genera actas COPASST y Convivencia Laboral listas para firma." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Nueva acta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(user?.role === "admin" || user?.role === "consultor") && (
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Tipo de comité</Label>
              <Select value={tipoComite} onValueChange={(v) => setTipoComite(v as "copasst" | "convivencia")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="copasst">COPASST</SelectItem>
                  <SelectItem value="convivencia">Convivencia Laboral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Puntos a tratar</Label>
              <Textarea id="points" rows={6} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Resumen de los temas a discutir…" />
            </div>
            <Button onClick={handleGenerate} className="gap-2"><FileText className="h-4 w-4" /> Generar Acta</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Asistencia</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members.length > 0 ? members.map((m) => (
              <label key={m.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/40 cursor-pointer">
                <Checkbox
                  checked={!!attendance[m.id]}
                  onCheckedChange={(v) => setAttendance((a) => ({ ...a, [m.id]: !!v }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{m.nombre}</div>
                  <div className="text-xs text-muted-foreground">{m.rol_comite} — {m.tipo_representacion}</div>
                </div>
              </label>
            )) : (
              <p className="text-sm text-muted-foreground">
                {selectedEmpresa ? "No hay integrantes registrados para este comité." : "Selecciona una empresa."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
