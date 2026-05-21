import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Stethoscope, Loader2, AlertTriangle, Search, FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/context/AuthContext";
import { empresasService, examenesService, logsService } from "@/services";
import { supabase } from "@/lib/supabase";
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
  const [processing, setProcessing] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<ExamenMedico | null>(null);
  const [search, setSearch] = useState("");

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

  // Check for duplicate exam by worker cedula + date range
  const checkDuplicate = (extracted: any): ExamenMedico | null => {
    if (!extracted?.trabajador?.cedula) return null;
    const cedula = extracted.trabajador.cedula;
    const fechaExamen = extracted.examen?.fecha_examen;

    return examenes.find((ex) => {
      // Match by cedula
      if (ex.trabajador_documento !== cedula) return false;
      // If we have dates, check if within 30 days (same period)
      if (fechaExamen && ex.fecha_examen) {
        const newDate = new Date(fechaExamen);
        const existDate = new Date(ex.fecha_examen);
        const diffDays = Math.abs(newDate.getTime() - existDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays < 30; // Same month = likely duplicate
      }
      // Same type within this empresa = potential duplicate
      return ex.tipo_examen === extracted.examen?.tipo_examen;
    }) ?? null;
  };

  const handlePdfUpload = async (files: File[]) => {
    if (!selectedEmpresa) { toast.error("Selecciona una empresa primero"); return; }
    const file = files[0];
    if (!file || !file.name.endsWith(".pdf")) { toast.error("Solo se aceptan archivos PDF"); return; }

    setProcessing(true);
    setLastExtracted(null);
    setDuplicateWarning(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("empresa_id", selectedEmpresa);

      const { data, error } = await supabase.functions.invoke("process-exam-pdf", {
        body: formData,
      });

      if (error) throw error;

      await logsService.log({
        tipo: "cargar",
        modulo: "examenes",
        descripcion: `PDF de examen médico procesado con IA: ${file.name}`,
        empresa_id: selectedEmpresa || undefined,
        usuario_id: user?.id,
        metadata: { archivo: file.name },
      });

      const extracted = data.extracted;
      setLastExtracted(extracted);

      // Warn if extraction looks incomplete (concepto defaults to "apto" when AI can't extract)
      const looksIncomplete = !extracted?.trabajador?.nombre && !extracted?.trabajador?.cedula;
      if (looksIncomplete) {
        toast.warning("La extracción no pudo identificar datos del trabajador. Verifique el concepto manualmente — puede haberse asignado 'Apto' por defecto.", { duration: 8000 });
      }

      // Check for duplicates after extraction
      const dup = checkDuplicate(extracted);
      if (dup) {
        setDuplicateWarning(dup);
        toast.warning("Posible duplicado detectado. Este trabajador ya tiene un examen reciente registrado.", { duration: 6000 });
      } else if (!looksIncomplete) {
        toast.success(data.message || "PDF procesado con IA exitosamente");
      }

      examenesService.listByEmpresa(selectedEmpresa).then(setExamenes);
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el PDF");
    } finally {
      setProcessing(false);
    }
  };

  const filteredExamenes = search.trim()
    ? examenes.filter((ex) =>
        (ex.trabajador_nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (ex.trabajador_documento ?? "").includes(search)
      )
    : examenes;

  return (
    <div>
      <PageHeader
        title="Exámenes Médicos Ocupacionales"
        description="Carga PDFs de conceptos médicos y los datos se extraen automáticamente con IA."
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
              onFiles={handlePdfUpload}
            />
            {processing ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Extrayendo datos con Claude Vision...
              </p>
            ) : (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-success" /> Extracción automática con IA
              </p>
            )}

            {/* Duplicate warning */}
            {duplicateWarning && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Posible examen duplicado
                </p>
                <p className="text-xs text-amber-700">
                  Ya existe un examen para <strong>{duplicateWarning.trabajador_nombre}</strong> (CC {duplicateWarning.trabajador_documento}) del{" "}
                  {new Date(duplicateWarning.fecha_examen).toLocaleDateString("es-CO")} — tipo: {duplicateWarning.tipo_examen}.
                </p>
                <p className="text-xs text-amber-600">
                  Si es el mismo documento recibido por otro canal (correo/WhatsApp), ya fue procesado.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 mt-1"
                  onClick={() => setDuplicateWarning(null)}
                >
                  Descartar aviso
                </Button>
              </div>
            )}

            {lastExtracted?.trabajador && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-semibold text-success flex items-center gap-1"><Sparkles className="h-3 w-3" /> Datos extraidos por IA:</p>
                <p className="text-xs"><strong>Nombre:</strong> {lastExtracted.trabajador.nombre || "—"}</p>
                <p className="text-xs"><strong>Cedula:</strong> {lastExtracted.trabajador.cedula || "—"}</p>
                <p className="text-xs"><strong>Cargo:</strong> {lastExtracted.trabajador.cargo || "—"}</p>
                <p className="text-xs"><strong>Tipo:</strong> {lastExtracted.examen?.tipo_examen || "—"}</p>
                <p className="text-xs"><strong>Concepto:</strong> {lastExtracted.examen?.concepto_aptitud || "—"}</p>
                {lastExtracted.recomendaciones?.length > 0 && (
                  <div className="pt-1">
                    <p className="text-xs font-semibold">Recomendaciones:</p>
                    {lastExtracted.recomendaciones.map((r: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">• {r.descripcion}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" /> Exámenes registrados
                {examenes.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{examenes.length}</Badge>
                )}
              </CardTitle>
              {examenes.length > 0 && (
                <div className="flex items-center gap-2">
                  {/* KPI badges */}
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 text-[10px]">
                    {examenes.filter(e => e.concepto_aptitud === "apto").length} aptos
                  </Badge>
                  <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 text-[10px]">
                    {examenes.filter(e => e.concepto_aptitud === "apto_con_restricciones").length} con restricciones
                  </Badge>
                  <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 text-[10px]">
                    {examenes.filter(e => e.concepto_aptitud === "no_apto").length} no aptos
                  </Badge>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o cédula..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 h-8 w-48 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredExamenes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trabajador</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>IA</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExamenes.map((ex) => (
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
                        <TableCell>
                          {ex.procesado_por_ia && <Sparkles className="h-3.5 w-3.5 text-success" />}
                        </TableCell>
                        <TableCell>
                          {ex.archivo_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={() => window.open(ex.archivo_url, "_blank")}
                            >
                              <FileText className="h-3.5 w-3.5" /> Ver PDF
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {search.trim()
                  ? "No se encontraron exámenes con esa búsqueda."
                  : selectedEmpresa
                    ? "No hay examenes medicos registrados para esta empresa."
                    : "Selecciona una empresa para ver los examenes."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
