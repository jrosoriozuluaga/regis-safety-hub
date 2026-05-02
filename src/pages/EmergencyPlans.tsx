import { useState } from "react";
import { Mic, Square, Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { emergencyService } from "@/services";
import { cn } from "@/lib/utils";

export default function EmergencyPlans() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      setLoading(true);
      const text = await emergencyService.transcribe();
      setTranscript(text);
      setLoading(false);
      toast.success("Audio transcrito y clasificado");
    } else {
      setRecording(true);
      toast("Grabando audio…");
    }
  };

  return (
    <div>
      <PageHeader title="Planes de Emergencia" description="Graba o sube audio y obtén un plan transcrito y clasificado." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Captura de audio</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center py-10">
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
            <p className="mt-6 text-sm text-muted-foreground">
              {recording ? "Grabando…" : "Toca para iniciar la grabación"}
            </p>
            <Button
              variant="outline"
              className="mt-6 gap-2"
              onClick={() => toast("Selector de archivo — backend pendiente")}
            >
              <Upload className="h-4 w-4" /> O subir archivo de audio
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Plan transcrito y clasificado
              <Sparkles className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={14}
              value={loading ? "Procesando audio…" : transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="La transcripción aparecerá aquí después de grabar."
              className="font-mono text-xs"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
