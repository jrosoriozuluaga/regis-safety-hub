import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDropzone } from "@/components/common/FileDropzone";
import { medicalExamsService } from "@/services";
import type { MedicalExam } from "@/types/domain";

export default function MedicalExams() {
  const [rows, setRows] = useState<MedicalExam[]>([]);
  useEffect(() => { medicalExamsService.list().then(setRows); }, []);

  return (
    <div>
      <PageHeader
        title="Exámenes Médicos"
        description="Carga PDFs de conceptos médicos y revisa los datos extraídos."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Cargar examen</CardTitle></CardHeader>
          <CardContent>
            <FileDropzone
              accept=".pdf"
              hint="Archivos PDF — máx. 10MB"
              onFiles={async (files) => {
                await medicalExamsService.upload(files[0]);
                toast.success(`"${files[0].name}" en procesamiento`);
              }}
            />
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-success" /> Extracción asistida por IA (mock)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Resultados extraídos</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Recomendaciones</TableHead>
                  <TableHead>Restricciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.workerName}</div>
                      <div className="text-xs text-muted-foreground">{r.document}</div>
                    </TableCell>
                    <TableCell className="text-sm">{r.recommendations}</TableCell>
                    <TableCell className="text-sm">{r.restrictions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
