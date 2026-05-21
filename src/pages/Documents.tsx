import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Building2,
  Trash2,
  Plus,
  FolderOpen,
  Eye,
  Filter,
  Loader2,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/context/AuthContext";
import { empresasService, documentsService } from "@/services";
import type { Empresa } from "@/types/domain";
import { PageHeader } from "@/components/common/PageHeader";
import { TablePagination, usePagination } from "@/components/common/TablePagination";
import { TableSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DOCUMENT_TYPES = [
  { value: "politica_sst", label: "Política SST" },
  { value: "acta_recursos", label: "Acta de recursos" },
  { value: "plan_capacitacion", label: "Plan de capacitación" },
  { value: "cronograma", label: "Cronograma" },
  { value: "reglamento_higiene", label: "Reglamento higiene" },
  { value: "matriz_legal", label: "Matriz legal" },
  { value: "plan_trabajo_anual", label: "Plan de trabajo anual" },
  { value: "plan_emergencias", label: "Plan de emergencias" },
  { value: "acta_copasst", label: "Acta COPASST" },
  { value: "acta_convivencia", label: "Acta Convivencia" },
  { value: "otro", label: "Otro" },
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"];

const tipoLabel = (tipo: string) =>
  DOCUMENT_TYPES.find((t) => t.value === tipo)?.label ?? tipo;

type Documento = {
  id: string;
  empresa_id: string;
  tipo: string;
  nombre_archivo: string;
  periodo_mes: number | null;
  periodo_anio: number | null;
  archivo_url: string | null;
  drive_file_id: string | null;
  drive_folder_id: string | null;
  estandar_0312_id: string | null;
  estado: "pendiente" | "cargado" | "validado" | "aprobado" | "vigente";
  fecha_solicitud: string | null;
  fecha_recepcion: string | null;
  intentos_solicitud: number;
  proximo_recordatorio: string | null;
  created_at: string;
  updated_at: string;
  empresas_cliente?: { razon_social: string } | null;
};

const estadoBadge: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  cargado: { label: "Cargado", variant: "default" },
  validado: { label: "Validado", variant: "secondary", className: "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200" },
  aprobado: { label: "Aprobado", variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" },
  vigente: { label: "Vigente", variant: "outline" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Documents() {
  const { user } = useAuth();

  /* Data state */
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const { paginatedItems: pagedDocs, currentPage: dPage, totalPages: dTotal, setCurrentPage: dSetPage, totalItems: dItems, pageSize: dSize } = usePagination(documentos, 10);

  /* Filters */
  const [filterEmpresa, setFilterEmpresa] = useState("todas");
  const [filterTipo, setFilterTipo] = useState("todos");

  /* Upload dialog */
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadEmpresa, setUploadEmpresa] = useState("");
  const [uploadTipo, setUploadTipo] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* Delete confirmation */
  const [deleteTarget, setDeleteTarget] = useState<Documento | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Load empresas                                                    */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const load = async () => {
      if (user?.role === "admin" || user?.role === "consultor") {
        const data = await empresasService.list();
        setEmpresas(data);
      } else if (user?.empresa_id) {
        setFilterEmpresa(user.empresa_id);
        setUploadEmpresa(user.empresa_id);
      }
    };
    load();
  }, [user]);

  /* ---------------------------------------------------------------- */
  /*  Load documents                                                   */
  /* ---------------------------------------------------------------- */

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const empresaFilter = filterEmpresa && filterEmpresa !== "todas" ? filterEmpresa : undefined;
      const tipoFilter = filterTipo && filterTipo !== "todos" ? filterTipo : undefined;
      const data = await documentsService.list(empresaFilter, tipoFilter);
      setDocumentos(data as Documento[]);
    } catch {
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmpresa, filterTipo]);

  /* ---------------------------------------------------------------- */
  /*  KPI calculations                                                 */
  /* ---------------------------------------------------------------- */

  const totalDocs = documentos.length;
  const loadedDocs = documentos.filter((d) => d.estado === "cargado" || d.estado === "validado" || d.estado === "aprobado" || d.estado === "vigente").length;
  const pendingDocs = documentos.filter((d) => d.estado === "pendiente").length;

  const categoryBreakdown = DOCUMENT_TYPES.reduce<Record<string, number>>((acc, tipo) => {
    acc[tipo.label] = documentos.filter((d) => d.tipo === tipo.value).length;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryBreakdown)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  /* ---------------------------------------------------------------- */
  /*  Upload handler                                                   */
  /* ---------------------------------------------------------------- */

  const handleUpload = async () => {
    if (!uploadEmpresa) { toast.error("Selecciona una empresa"); return; }
    if (!uploadTipo) { toast.error("Selecciona un tipo de documento"); return; }
    if (!uploadFile) { toast.error("Selecciona un archivo"); return; }

    setUploading(true);
    try {
      const { updated } = await documentsService.upload(uploadFile, uploadEmpresa, uploadTipo, user?.id);
      await fetchDocuments();
      setUploadOpen(false);
      resetUploadForm();
      toast.success(updated ? "Documento actualizado (ya existía uno con el mismo nombre y tipo)" : "Documento cargado exitosamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al cargar el documento");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTipo("");
    if (user?.role === "admin" || user?.role === "consultor") {
      setUploadEmpresa("");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Delete handler                                                   */
  /* ---------------------------------------------------------------- */

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await documentsService.delete(
        deleteTarget.id,
        deleteTarget.archivo_url ?? undefined,
        user?.id,
        deleteTarget.empresa_id,
        deleteTarget.nombre_archivo,
        deleteTarget.tipo,
      );
      await fetchDocuments();
      toast.success("Documento eliminado");
    } catch (err: any) {
      toast.error(err.message ?? "Error al eliminar el documento");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Validar / Aprobar handlers                                       */
  /* ---------------------------------------------------------------- */

  const handleValidar = async (doc: Documento) => {
    try {
      await documentsService.validate(doc.id, user?.id, doc.empresa_id, doc.nombre_archivo, doc.tipo);
      await fetchDocuments();
      toast.success("Documento validado correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al validar el documento");
    }
  };

  const handleAprobar = async (doc: Documento) => {
    try {
      await documentsService.approve(doc.id, user?.id, doc.empresa_id, doc.nombre_archivo, doc.tipo);
      await fetchDocuments();
      toast.success("Documento aprobado correctamente");
    } catch (err: any) {
      toast.error(err.message ?? "Error al aprobar el documento");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  const empresaName = (doc: Documento) =>
    doc.empresas_cliente?.razon_social ?? "—";

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos SG-SST"
        description="Gestion documental del Sistema de Gestion de Seguridad y Salud en el Trabajo."
        actions={
        <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Cargar documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cargar documento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Company select */}
              {(user?.role === "admin" || user?.role === "consultor") && (
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={uploadEmpresa} onValueChange={setUploadEmpresa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.razon_social}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Document type */}
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <Select value={uploadTipo} onValueChange={setUploadTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File dropzone */}
              <div className="space-y-2">
                <Label>Archivo</Label>
                {uploadFile ? (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm flex-1 truncate">{uploadFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setUploadFile(null)}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <FileDropzone
                    onFiles={(files) => setUploadFile(files[0] ?? null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                    hint="PDF, Word, Excel, imagen o ZIP — máx. 25MB"
                  />
                )}
              </div>

              {/* Upload button */}
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={uploading || !uploadEmpresa || !uploadTipo || !uploadFile}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Cargar documento
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total documentos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cargados / Vigentes</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loadedDocs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Upload className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingDocs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Por categoría</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {topCategories.length > 0 ? (
              <div className="space-y-1">
                {topCategories.map(([tipo, count]) => (
                  <div key={tipo} className="flex justify-between text-sm">
                    <span className="truncate text-muted-foreground">{tipo}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin documentos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex gap-4 flex-wrap">
        {(user?.role === "admin" || user?.role === "consultor") && (
          <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
            <SelectTrigger className="w-[260px]">
              <Building2 className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Todas las empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las empresas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.razon_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-[220px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {DOCUMENT_TYPES.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : documentos.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Sin documentos"
              description="Carga tu primer documento usando el botón superior."
            />
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre archivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedDocs.map((doc) => {
                  const badge = estadoBadge[doc.estado] ?? estadoBadge.pendiente;
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{empresaName(doc)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tipoLabel(doc.tipo)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate">{doc.nombre_archivo}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className={badge.className}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(doc.fecha_recepcion ?? doc.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {(user?.role === "admin" || user?.role === "consultor") && doc.estado === "cargado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Validar documento"
                              onClick={() => handleValidar(doc)}
                              className="text-purple-700 hover:text-purple-900 hover:bg-purple-50"
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" /> Validar
                            </Button>
                          )}
                          {(user?.role === "admin" || user?.role === "consultor") && doc.estado === "validado" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Aprobar documento"
                              onClick={() => handleAprobar(doc)}
                              className="text-green-700 hover:text-green-900 hover:bg-green-50"
                            >
                              <BadgeCheck className="h-4 w-4 mr-1" /> Aprobar
                            </Button>
                          )}
                          {doc.archivo_url && (
                            <Tooltip><TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" asChild>
                                <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger><TooltipContent>Ver / Descargar</TooltipContent></Tooltip>
                          )}
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(doc)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination currentPage={dPage} totalPages={dTotal} onPageChange={dSetPage} totalItems={dItems} pageSize={dSize} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar documento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-medium">{deleteTarget?.nombre_archivo}</span>? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
