import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/common/FileDropzone";

export default function MedicalExams() {
  return (
    <div>
      <PageHeader
        title="Exámenes Médicos"
        description="Carga PDFs de conceptos médicos y revisa los datos extraídos con IA."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Cargar examen</CardTitle></CardHeader>
          <CardContent>
            <FileDropzone
              accept=".pdf"
              hint="Archivos PDF — máx. 10MB"
              onFiles={async (files) => {
                toast.success(`"${files[0].name}" recibido — procesamiento con IA pendiente`);
              }}
            />
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-success" /> Extracción asistida por IA (próximamente)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Resultados extraídos</CardTitle></CardHeader>
          <CardContent className="p-8 text-center text-muted-foreground">
            Los resultados de exámenes aparecerán aquí una vez se conecte el procesamiento con Claude API.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
