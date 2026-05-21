import { useEffect, useState, useRef } from "react";
import { Mic, Square, Upload, Sparkles, Loader2, AlertTriangle, Shield, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { empresasService, emergenciasService, logsService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa, PlanEmergencia } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { getExportHeaderHTML, getExportFooterHTML, injectLogoIntoWindow } from "@/lib/exportHeader";
import logo from "@/assets/regis-logo.jpeg";

export default function EmergencyPlans() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [planes, setPlanes] = useState<PlanEmergencia[]>([]);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
        chunksRef.current = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          processAudio(blob);
        };
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setRecording(true);
        toast("Grabando audio...");
      } catch {
        toast.error("No se pudo acceder al micrófono");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudio(file);
  };

  const processAudio = async (audioBlob: Blob | File) => {
    if (!selectedEmpresa) { toast.error("Selecciona una empresa primero"); return; }
    setLoading(true);
    setTranscript("");
    setAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("empresa_id", selectedEmpresa);

      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: formData,
      });

      if (error) throw error;

      setTranscript(data.transcripcion);
      setAnalysis(data.analisis_json);
      toast.success("Audio transcrito y analizado con IA");

      const updated = user?.role === "cliente"
        ? await emergenciasService.listByEmpresa(selectedEmpresa)
        : await emergenciasService.listAll();
      setPlanes(updated);
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el audio");
    } finally {
      setLoading(false);
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
        analisis_json: analysis,
        estado: analysis ? "en_revision" : "borrador",
      });
      await logsService.log({
        tipo: "generar",
        modulo: "emergencias",
        descripcion: `Plan de emergencia creado${analysis ? " con análisis de vulnerabilidad IA" : ""}`,
        empresa_id: selectedEmpresa || undefined,
        usuario_id: user?.id,
        metadata: { tiene_analisis_ia: !!analysis, nivel_riesgo: analysis?.nivel_riesgo_global },
      });
      toast.success("Plan de emergencia creado");
      setTranscript("");
      setAnalysis(null);
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

  const riesgoColor: Record<string, string> = {
    alto: "text-red-700 bg-red-50",
    medio: "text-yellow-700 bg-yellow-50",
    bajo: "text-green-700 bg-green-50",
  };

  const handleExportPlan = (plan: PlanEmergencia) => {
    const emp = empresas.find((e) => e.id === plan.empresa_id);
    const a = plan.analisis_json;
    const headerHTML = getExportHeaderHTML({
      logoSrc: logo,
      module: "PLAN-EME",
      nit: emp?.nit || "",
      empresaNombre: emp?.razon_social || plan.empresa_razon_social || "Empresa",
    });

    let body = `<h2 style="margin-top:24px">Plan de Emergencia</h2>`;
    body += `<p><strong>Estado:</strong> ${plan.estado} &nbsp;|&nbsp; <strong>Fecha:</strong> ${new Date(plan.created_at).toLocaleDateString("es-CO")}</p>`;

    if (a?.resumen_ejecutivo) {
      body += `<h3>Resumen Ejecutivo</h3><p>${a.resumen_ejecutivo}</p>`;
    }
    if (a?.nivel_riesgo_global) {
      body += `<p><strong>Nivel de riesgo global:</strong> ${a.nivel_riesgo_global.toUpperCase()}</p>`;
    }
    if (a?.amenazas_identificadas?.length) {
      body += `<h3>Amenazas Identificadas</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px">`;
      body += `<tr style="background:#f1f5f9"><th>Amenaza</th><th>Tipo</th><th>Probabilidad</th></tr>`;
      for (const am of a.amenazas_identificadas) {
        body += `<tr><td>${am.amenaza}</td><td>${am.tipo}</td><td>${am.probabilidad}</td></tr>`;
      }
      body += `</table>`;
    }
    if (a?.recomendaciones?.length) {
      body += `<h3>Recomendaciones</h3><table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:12px">`;
      body += `<tr style="background:#f1f5f9"><th>Acción</th><th>Prioridad</th></tr>`;
      for (const r of a.recomendaciones) {
        body += `<tr><td>${r.accion}</td><td>${r.prioridad}</td></tr>`;
      }
      body += `</table>`;
    }
    if (plan.transcripcion) {
      body += `<h3>Transcripción de Inspección</h3><pre style="font-size:11px;white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:4px">${plan.transcripcion}</pre>`;
    }

    const footerHTML = getExportFooterHTML();
    const printW = window.open("", "_blank");
    if (!printW) return;
    printW.document.write(`<html><head><title>Plan de Emergencia — ${emp?.razon_social || ""}</title>
<style>body{font-family:system-ui,sans-serif;margin:40px;font-size:13px;color:#1e293b;line-height:1.6}
h2{color:#0f172a;border-bottom:2px solid #0369a1;padding-bottom:8px}
h3{color:#0369a1;margin-top:20px}
table{margin:8px 0}
@media print{@page{margin:15mm}body{margin:0}}</style>
</head><body>${headerHTML}${body}${footerHTML}</body></html>`);
    printW.document.close();
    injectLogoIntoWindow(printW, logo);
    setTimeout(() => printW.print(), 400);
  };

  return (
    <div>
      <PageHeader title="Planes de Emergencia" description="Graba o sube audio de inspección y genera el plan con análisis de vulnerabilidad IA." />

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
                disabled={loading}
                aria-label={recording ? "Detener" : "Grabar"}
                className={cn(
                  "h-32 w-32 rounded-full flex items-center justify-center text-primary-foreground transition-all shadow-elevated",
                  recording ? "bg-destructive animate-pulse" : "bg-primary hover:bg-primary/90",
                )}
              >
                {loading ? <Loader2 className="h-12 w-12 animate-spin" /> : recording ? <Square className="h-12 w-12" /> : <Mic className="h-14 w-14" />}
              </button>
              <p className="mt-4 text-sm text-muted-foreground">
                {loading ? "Transcribiendo con Whisper + analizando con Claude..." : recording ? "Grabando… toca para detener" : "Toca para iniciar la grabación"}
              </p>
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
              <Button variant="outline" className="mt-4 gap-2" onClick={() => fileInputRef.current?.click()} disabled={loading}>
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
              value={loading ? "Procesando con IA…" : transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="La transcripción aparecerá aquí después de grabar, o pégala manualmente."
              className="font-mono text-xs"
            />
            <Button onClick={handleCreatePlan} disabled={loading} className="w-full gap-2">
              <Sparkles className="h-4 w-4" /> {loading ? "Procesando..." : "Guardar Plan de Emergencia"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {analysis && (
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Análisis de Vulnerabilidad (IA)
              {analysis.nivel_riesgo_global && (
                <span className={`ml-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${riesgoColor[analysis.nivel_riesgo_global] || ""}`}>
                  Riesgo {analysis.nivel_riesgo_global}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.resumen_ejecutivo && (
              <p className="text-sm">{analysis.resumen_ejecutivo}</p>
            )}
            {analysis.amenazas_identificadas?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Amenazas identificadas</h4>
                <div className="space-y-1">
                  {analysis.amenazas_identificadas.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${riesgoColor[a.probabilidad] || ""}`}>{a.probabilidad}</span>
                      <span>{a.amenaza} ({a.tipo})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.recomendaciones?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recomendaciones</h4>
                <div className="space-y-1">
                  {analysis.recomendaciones.map((r: any, i: number) => (
                    <div key={i} className="text-sm flex items-start gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${riesgoColor[r.prioridad] || ""}`}>{r.prioridad}</span>
                      <span>{r.accion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                {p.analisis_json && (
                  <Button variant="ghost" size="sm" onClick={() => handleExportPlan(p)} className="gap-1.5 shrink-0">
                    <Printer className="h-3.5 w-3.5" /> Exportar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
