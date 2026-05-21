import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Shield } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/common/FileDropzone";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/regis-logo.jpeg";

const meses = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

type UploadState = "ready" | "uploading" | "success" | "error" | "invalid" | "expired";

/** Decode the upload token: base64(JSON({ e: empresa_id, p: periodo, n: empresa_nombre, exp: timestamp })) */
function decodeToken(token: string): { empresa_id: string; periodo: string; empresa_nombre: string; expired: boolean } | null {
  try {
    const json = atob(token);
    const data = JSON.parse(json);
    if (!data.e || !data.p) return null;
    const expired = data.exp ? Date.now() > data.exp : false;
    return {
      empresa_id: data.e,
      periodo: data.p,
      empresa_nombre: data.n || "Empresa",
      expired,
    };
  } catch {
    return null;
  }
}

/** Generate an upload token (used by the PILA page when creating WhatsApp links) */
export function generateUploadToken(empresaId: string, periodo: string, empresaNombre: string, expiryDays: number = 30): string {
  const exp = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
  return btoa(JSON.stringify({ e: empresaId, p: periodo, n: empresaNombre, exp }));
}

export default function UploadPila() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t") || "";
  const [state, setState] = useState<UploadState>("ready");
  const [tokenData, setTokenData] = useState<ReturnType<typeof decodeToken>>(null);
  const [uploadedFile, setUploadedFile] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      setState("invalid");
      return;
    }
    if (decoded.expired) {
      setState("expired");
      return;
    }
    setTokenData(decoded);
  }, [token]);

  const periodoLabel = tokenData?.periodo
    ? (() => {
        const [y, m] = tokenData.periodo.split("-");
        return `${meses[parseInt(m)] || m} ${y}`;
      })()
    : "";

  const handleFiles = async (files: File[]) => {
    if (!tokenData) return;
    const file = files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [".pdf", ".xlsx", ".xls", ".zip"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(ext)) {
      toast.error("Formato no permitido. Solo se aceptan archivos PDF, Excel o ZIP.");
      return;
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("El archivo excede el límite de 25 MB. Intente con un archivo más pequeño.");
      return;
    }

    setState("uploading");
    try {
      const filePath = `pila/${tokenData.empresa_id}/${tokenData.periodo}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(filePath, file, { upsert: true });

      let archivoUrl: string | undefined;
      if (!uploadError) {
        const { data: urlData } = await supabase.storage.from("documentos").createSignedUrl(filePath, 31536000);
        archivoUrl = urlData?.signedUrl;
      }

      const now = new Date().toISOString();
      const { data: existing } = await supabase
        .from("pila_records")
        .select("id")
        .eq("empresa_id", tokenData.empresa_id)
        .eq("periodo", tokenData.periodo)
        .maybeSingle();

      if (existing) {
        await supabase.from("pila_records").update({
          estado: "cargada",
          fecha_carga: now,
          intentos_notificacion: 0,
          archivo_url: archivoUrl,
        }).eq("id", existing.id);
      } else {
        await supabase.from("pila_records").insert({
          empresa_id: tokenData.empresa_id,
          periodo: tokenData.periodo,
          estado: "cargada",
          fecha_carga: now,
          archivo_url: archivoUrl,
        });
      }

      // Log activity
      await supabase.from("logs_actividad").insert({
        tipo: "carga_archivo",
        modulo: "pila",
        descripcion: `PILA cargada via WhatsApp link: ${file.name} — periodo ${tokenData.periodo}`,
        empresa_id: tokenData.empresa_id,
        metadata: { periodo: tokenData.periodo, filename: file.name, canal: "whatsapp_link" },
      });

      setUploadedFile(file.name);
      setState("success");
    } catch (err: any) {
      console.error("Upload error:", err);
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <img src={logo} alt="Regis Colombia" className="h-12 w-12 object-contain rounded" />
            <h1 className="text-2xl font-bold text-slate-800">Regis Colombia</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sistema de Gestion de Seguridad y Salud en el Trabajo</p>
        </div>

        {/* Invalid token */}
        {state === "invalid" && (
          <Card className="shadow-lg border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-700 mb-2">Enlace invalido</h2>
              <p className="text-sm text-muted-foreground">
                Este enlace de carga no es valido. Solicite un nuevo enlace a su consultor de Regis Colombia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Expired token */}
        {state === "expired" && (
          <Card className="shadow-lg border-amber-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-amber-700 mb-2">Enlace vencido</h2>
              <p className="text-sm text-muted-foreground">
                Este enlace ya no es valido. Solicite un nuevo enlace a su consultor de Regis Colombia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upload form */}
        {(state === "ready" || state === "uploading") && tokenData && (
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Cargar Planilla PILA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-1">
                <p className="text-sm font-medium text-slate-700">{tokenData.empresa_nombre}</p>
                <p className="text-sm text-muted-foreground">
                  Periodo: <strong>{periodoLabel}</strong>
                </p>
              </div>

              <FileDropzone
                onFiles={handleFiles}
                accept=".pdf,.xlsx,.xls,.zip"
                hint="Arrastre su planilla PILA aqui o haga clic para seleccionar — PDF, Excel o ZIP"
              />

              {state === "uploading" && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Subiendo archivo...
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Su archivo sera recibido de forma segura por el equipo de Regis Colombia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {state === "success" && (
          <Card className="shadow-lg border-green-200">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-green-700 mb-2">Planilla recibida</h2>
              <p className="text-sm text-muted-foreground mb-1">
                El archivo <strong>{uploadedFile}</strong> fue cargado exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>{tokenData?.empresa_nombre}</strong> — {periodoLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Puede cerrar esta ventana. Su consultor de Regis Colombia sera notificado automaticamente.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {state === "error" && (
          <Card className="shadow-lg border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-700 mb-2">Error al cargar</h2>
              <p className="text-sm text-muted-foreground mb-4">
                No se pudo cargar el archivo. Intente de nuevo o contacte a su consultor.
              </p>
              <Button onClick={() => setState("ready")} variant="outline">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Regis Colombia &copy; {new Date().getFullYear()} — Plataforma SG-SST
        </p>
      </div>
    </div>
  );
}
