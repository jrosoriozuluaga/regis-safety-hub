import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/context/AuthContext";
import { empresasService, examenesService } from "@/services";
import type { Empresa, ExamenMedico } from "@/types/domain";

const conceptoColor: Record<string, string> = {
  "apto": "text-green-700 bg-green-50",
  "apto_con_restricciones": "text-yellow-700 bg-yellow-50",
  "no_apto": "text-red-700 bg-red-50",
  "aplazado": "text-gray-700 bg-gray-50",
};

export default function MedicalExams() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [examenes, setExamenes] = useState<ExamenMedico[]>([]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmpresa) {
      examenesService.listByEmpresa(selectedEmpresa).then(setExamenes);
    }
  }, [selectedEmpresa]);

  return (
    <div>
      <PageHeader
        title="Exámenes Médicos Ocupacionales"
        description="Carga PDFs de conceptos médicos y revisa los datos extraídos con IA."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Cargar examen</CardTitle></CardHeader>
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
            <FileDropzone
              accept=".pdf"
              hint="Archivos PDF — máx. 10MB"
              onFiles={async (files) => {
                toast.success(`"${files[0].name}" recibido — procesamiento con IA pendiente`);
              }}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-success" /> Extracción asistida por IA (próximamente)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Exámenes registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {examenes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trabajador</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examenes.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-medium">{ex.trabajador_nombre || "—"}</TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{ex.trabajador_documento || "—"}</TableCell>
                        <TableCell className="text-sm">{ex.tipo_examen.replace(/_/g, " ")}</TableCell>
                        <TableCell className="tabular-nums">{new Date(ex.fecha_examen).toLocaleDateString("es-CO")}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${conceptoColor[ex.concepto_aptitud] || ""}`}>
                            {ex.concepto_aptitud.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {selectedEmpresa ? "No hay exámenes médicos registrados para esta empresa." : "Selecciona una empresa para ver los exámenes."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
