import { useEffect, useState } from "react";
import { Mic, Square, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { empresasService, emergenciasService } from "@/services";
import type { Empresa, PlanEmergencia } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function EmergencyPlans() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [planes, setPlanes] = useState<PlanEmergencia[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
      emergenciasService.listAll().then(setPlanes);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
      emergenciasService.listByEmpresa(user.empresa_id).then(setPlanes);
    }
  }, [user]);

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      toast.success("Grabación detenida. Envía a procesar cuando estés listo.");
    } else {
      setRecording(true);
      toast("Grabando audio…");
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedEmpresa) { toast.error("Selecciona una empresa"); return; }
    if (!transcript.trim()) { toast.error("Ingresa o graba una transcripción"); return; }
    setLoading(true);
    try {
      await emergenciasService.create({
        empresa_id: selectedEmpresa,
        transcripcion: transcript,
        estado: "borrador",
      });
      toast.success("Plan de emergencia creado en borrador");
      setTranscript("");
      const updated = user?.role === "cliente"
        ? await emergenciasService.listByEmpresa(selectedEmpresa)
        : await emergenciasService.listAll();
      setPlanes(updated);
    } catch (err: any) {
      toast.error(err.message || "Error al crear el plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Planes de Emergencia" description="Graba o sube audio de inspección y genera el plan con análisis de vulnerabilidad." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Captura de audio</CardTitle></CardHeader>
          <CardContent className="space-y-6">
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

            <div className="flex flex-col items-center py-6">
              <button
                onClick={toggleRecord}
                aria-label={recording ? "Detener" : "Grabar"}
                className={cn(
                  "h-32 w-32 rounded-full flex items-center justify-center text-primary-foreground transition-all shadow-elevated",
                  recording ? "bg-destructive animate-pulse" : "bg-primary hover:bg-primary/90",
                )}
              >
                {recording ? <Square className="h-12 w-12" /> : <Mic className="h-14 w-14" />}
              </button>
              <p className="mt-4 text-sm text-muted-foreground">
                {recording ? "Grabando…" : "Toca para iniciar la grabación"}
              </p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => toast("Subida de archivo — próximamente")}>
                <Upload className="h-4 w-4" /> O subir archivo de audio
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Transcripción
              <Sparkles className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={14}
              value={loading ? "Procesando…" : transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="La transcripción aparecerá aquí después de grabar, o pégala manualmente."
              className="font-mono text-xs"
            />
            <Button onClick={handleCreatePlan} disabled={loading} className="w-full gap-2">
              <Sparkles className="h-4 w-4" /> {loading ? "Creando plan..." : "Crear Plan de Emergencia"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {planes.length > 0 && (
        <Card className="shadow-card mt-6">
          <CardHeader><CardTitle className="text-base">Planes existentes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {planes.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{p.empresa_razon_social || "Empresa"}</div>
                  <div className="text-xs text-muted-foreground">Estado: {p.estado} — {new Date(p.created_at).toLocaleDateString("es-CO")}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
