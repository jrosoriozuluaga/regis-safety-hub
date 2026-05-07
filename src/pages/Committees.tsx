import { useEffect, useState } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { empresasService, comitesService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa, Comite, IntegranteComite } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";

export default function Committees() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [comites, setComites] = useState<Comite[]>([]);
  const [selectedComite, setSelectedComite] = useState("");
  const [tipoComite, setTipoComite] = useState<"vigia" | "copasst" | "convivencia">("copasst");
  const [members, setMembers] = useState<IntegranteComite[]>([]);
  const [points, setPoints] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedActa, setGeneratedActa] = useState("");

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
    const match = comites.find(c => c.tipo === tipoComite && c.activo);
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
    if (!points.trim()) { toast.error("Ingresa los puntos a tratar"); return; }

    setGenerating(true);
    setGeneratedActa("");
    try {
      const asistentesIds = Object.entries(attendance).filter(([, v]) => v).map(([k]) => k);
      const puntosArray = points.split("\n").filter(l => l.trim()).map((l, i) => ({
        titulo: l.trim(),
        desarrollo: "",
        compromisos: [],
      }));

      const { data, error } = await supabase.functions.invoke("generate-acta", {
        body: {
          comite_id: selectedComite,
          tipo_reunion: "ordinaria",
          lugar: "Oficinas de la empresa",
          hora_inicio: new Date().toTimeString().slice(0, 5),
          hora_fin: new Date(Date.now() + 3600000).toTimeString().slice(0, 5),
          puntos_json: puntosArray,
          asistentes_ids: asistentesIds,
        },
      });

      if (error) throw error;

      setGeneratedActa(data.contenido);
      toast.success("Acta generada con IA exitosamente");
      setPoints("");
    } catch (err: any) {
      toast.error(err.message || "Error al generar el acta con IA");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader title="Actas de Comité" description="Genera actas COPASST y Convivencia Laboral con IA, listas para firma." />
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
              <Select value={tipoComite} onValueChange={(v) => setTipoComite(v as "vigia" | "copasst" | "convivencia")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vigia">Vigía SST</SelectItem>
                  <SelectItem value="copasst">COPASST</SelectItem>
                  <SelectItem value="convivencia">Convivencia Laboral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Puntos a tratar (uno por línea)</Label>
              <Textarea id="points" rows={6} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Revisión de inspecciones de seguridad&#10;Seguimiento a incidentes reportados&#10;Estado de capacitaciones SST&#10;Revisión de EPP" />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating ? "Generando con IA..." : "Generar Acta con IA"}
            </Button>
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
                  <div className="text-xs text-muted-foreground">{m.rol_comite}{m.es_principal ? " (Principal)" : " (Suplente)"}</div>
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

      {generatedActa && (
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" /> Acta generada por IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-xs bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              {generatedActa}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
