import { useEffect, useState, useMemo } from "react";
import { templatesService, type PlantillaCorreo } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Save,
  Eye,
  Pencil,
  Plus,
  FileText,
  Variable,
  Loader2,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Sample data for template preview
const SAMPLE_DATA: Record<string, string> = {
  empresa_razon_social: "Construandes Ltda.",
  empresa_nit: "900.123.456-7",
  nombre_contacto_pila: "María González",
  mes_nombre: "abril",
  anio: "2026",
  mes_anio: "abril 2026",
  nombre_consultor: "Carlos Rodríguez",
  email_remitente: "sgsst@regiscolombia.com",
  telefono_consultor: "+57 310 555 1234",
  fecha_solicitud_original: "16 de abril de 2026",
  numero_recordatorio: "2",
  max_recordatorios: "3",
};

const TIPO_LABELS: Record<string, string> = {
  solicitud_pila: "Solicitud PILA",
  recordatorio_pila: "Recordatorio PILA",
  escalamiento_pila: "Escalamiento PILA",
  solicitud_general: "Solicitud General",
  recordatorio_general: "Recordatorio General",
};

const TIPO_COLORS: Record<string, string> = {
  solicitud_pila: "bg-blue-100 text-blue-800",
  recordatorio_pila: "bg-amber-100 text-amber-800",
  escalamiento_pila: "bg-red-100 text-red-800",
  solicitud_general: "bg-emerald-100 text-emerald-800",
  recordatorio_general: "bg-purple-100 text-purple-800",
};

// Extract variables from template content
function extractVariables(content: string): string[] {
  const matches = content.match(/\{[a-z_]+\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

// Replace variables in content with sample data
function renderPreview(content: string, data: Record<string, string>): string {
  return content.replace(/\{([a-z_]+)\}/g, (match, key) => {
    return data[key] ?? match;
  });
}

// Highlight variables in content for display
function highlightVariables(content: string): React.ReactNode[] {
  const parts = content.split(/(\{[a-z_]+\})/g);
  return parts.map((part, i) => {
    if (/^\{[a-z_]+\}$/.test(part)) {
      return (
        <span key={i} className="bg-primary/10 text-primary font-mono text-xs px-1 py-0.5 rounded border border-primary/20">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<PlantillaCorreo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Edit form state
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editAsunto, setEditAsunto] = useState("");
  const [editCuerpo, setEditCuerpo] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await templatesService.list();
      setTemplates(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  }

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  );

  // Parse template content: first line = asunto, rest = cuerpo
  const parseContent = (contenido: string) => {
    const lines = contenido.split("\n");
    const asuntoLine = lines.find((l) => l.startsWith("ASUNTO:"));
    const asunto = asuntoLine ? asuntoLine.replace("ASUNTO:", "").trim() : "";
    const cuerpoStart = lines.findIndex((l) => l.startsWith("---"));
    const cuerpo = cuerpoStart >= 0 ? lines.slice(cuerpoStart + 1).join("\n").trim() : lines.filter((l) => !l.startsWith("ASUNTO:")).join("\n").trim();
    return { asunto, cuerpo };
  };

  const formatContent = (asunto: string, cuerpo: string) => {
    return `ASUNTO: ${asunto}\n---\n${cuerpo}`;
  };

  function startEdit() {
    if (!selected) return;
    const { asunto, cuerpo } = parseContent(selected.contenido);
    setEditNombre(selected.nombre);
    setEditTipo(selected.tipo);
    setEditAsunto(asunto);
    setEditCuerpo(cuerpo);
    setEditMode(true);
    setCreating(false);
  }

  function startCreate() {
    setEditNombre("");
    setEditTipo("solicitud_pila");
    setEditAsunto("");
    setEditCuerpo("");
    setEditMode(true);
    setCreating(true);
    setSelectedId(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const contenido = formatContent(editAsunto, editCuerpo);
      if (creating) {
        const newTemplate = await templatesService.create({
          tipo: editTipo,
          nombre: editNombre,
          contenido,
          version: 1,
          activo: true,
        });
        setSelectedId(newTemplate.id);
        toast({ title: "Plantilla creada", description: `"${editNombre}" guardada correctamente.` });
      } else if (selected) {
        await templatesService.update(selected.id, {
          nombre: editNombre,
          tipo: editTipo,
          contenido,
          version: (selected.version || 1) + 1,
        });
        toast({ title: "Plantilla actualizada", description: `"${editNombre}" v${(selected.version || 1) + 1} guardada.` });
      }
      setEditMode(false);
      setCreating(false);
      await loadTemplates();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const variables = selected ? extractVariables(selected.contenido) : editMode ? extractVariables(formatContent(editAsunto, editCuerpo)) : [];

  const previewContent = selected ? renderPreview(selected.contenido, SAMPLE_DATA) : "";
  const { asunto: previewAsunto, cuerpo: previewCuerpo } = parseContent(previewContent);

  function copyVariable(v: string) {
    navigator.clipboard.writeText(`{${v}}`);
    toast({ title: "Copiado", description: `{${v}} copiado al portapapeles` });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Plantillas de Correo
          </h1>
          <p className="text-muted-foreground mt-1">
            Personaliza las plantillas de correo electrónico para solicitudes y recordatorios.
          </p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 && !editMode ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin plantillas</h3>
            <p className="text-muted-foreground mb-4">
              No hay plantillas de correo configuradas. Crea la primera para empezar.
            </p>
            <Button onClick={startCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Plantilla
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Template list sidebar */}
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Plantillas ({templates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedId(t.id);
                      setEditMode(false);
                      setCreating(false);
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      selectedId === t.id && !creating
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{t.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px]", TIPO_COLORS[t.tipo])}>
                        {TIPO_LABELS[t.tipo] ?? t.tipo}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">v{t.version}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main content area */}
          <div className="space-y-4">
            {editMode ? (
              /* ── Edit / Create Mode ── */
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Pencil className="h-5 w-5" />
                      {creating ? "Nueva Plantilla" : `Editar: ${selected?.nombre}`}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          setCreating(false);
                          if (templates.length > 0 && !selectedId) setSelectedId(templates[0].id);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} disabled={saving || !editNombre.trim()} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nombre de la plantilla</Label>
                      <Input
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Ej: Solicitud mensual PILA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={editTipo} onValueChange={setEditTipo}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIPO_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Asunto del correo</Label>
                    <Input
                      value={editAsunto}
                      onChange={(e) => setEditAsunto(e.target.value)}
                      placeholder="Solicitud Planilla PILA — {empresa_razon_social} — {mes_nombre} {anio}"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Usa variables con llaves: {"{variable}"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Cuerpo del correo</Label>
                    <Textarea
                      value={editCuerpo}
                      onChange={(e) => setEditCuerpo(e.target.value)}
                      placeholder="Cordial saludo, {nombre_contacto_pila}.&#10;&#10;Le escribimos desde Regis Colombia..."
                      className="font-mono text-sm min-h-[320px]"
                    />
                  </div>

                  {/* Variable reference */}
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <Variable className="h-4 w-4" />
                      Variables disponibles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(SAMPLE_DATA).map((v) => (
                        <button
                          key={v}
                          onClick={() => copyVariable(v)}
                          className="inline-flex items-center gap-1 bg-background border rounded px-2 py-1 text-xs font-mono hover:bg-primary/5 transition-colors group"
                          title={`Click para copiar {${v}}`}
                        >
                          <span className="text-primary">{`{${v}}`}</span>
                          <Copy className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Haz clic en una variable para copiarla al portapapeles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : selected ? (
              /* ── View Mode with Tabs ── */
              <Tabs defaultValue="preview">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.nombre}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={cn(TIPO_COLORS[selected.tipo])}>
                        {TIPO_LABELS[selected.tipo] ?? selected.tipo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Versión {selected.version} — Actualizada {new Date(selected.updated_at).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TabsList>
                      <TabsTrigger value="preview" className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Vista previa
                      </TabsTrigger>
                      <TabsTrigger value="source" className="gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Código fuente
                      </TabsTrigger>
                      <TabsTrigger value="variables" className="gap-1.5">
                        <Variable className="h-3.5 w-3.5" />
                        Variables
                      </TabsTrigger>
                    </TabsList>
                    <Button onClick={startEdit} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>

                {/* Preview tab */}
                <TabsContent value="preview">
                  <Card>
                    <CardContent className="p-6">
                      <div className="max-w-2xl mx-auto">
                        {/* Email header simulation */}
                        <div className="border rounded-t-lg bg-muted/30 p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-16">De:</span>
                            <span>{SAMPLE_DATA.email_remitente}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-16">Para:</span>
                            <span>contacto@construandes.com</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground w-16">Asunto:</span>
                            <span className="font-semibold">{previewAsunto || "(Sin asunto)"}</span>
                          </div>
                        </div>
                        {/* Email body */}
                        <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {previewCuerpo.split("\n").map((line, i) => {
                              // Handle bold markers
                              const parts = line.split(/(\*\*[^*]+\*\*)/g);
                              return (
                                <div key={i} className={line === "" ? "h-4" : ""}>
                                  {parts.map((part, j) =>
                                    /^\*\*[^*]+\*\*$/.test(part) ? (
                                      <strong key={j}>{part.slice(2, -2)}</strong>
                                    ) : (
                                      <span key={j}>{part}</span>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Vista previa con datos de ejemplo. Las variables se reemplazan al enviar.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Source tab */}
                <TabsContent value="source">
                  <Card>
                    <CardContent className="p-6">
                      <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                        {highlightVariables(selected.contenido)}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Variables tab */}
                <TabsContent value="variables">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Esta plantilla usa {variables.length} variable{variables.length !== 1 ? "s" : ""}. Al enviar el correo, cada variable se reemplaza con el valor real de la empresa y el periodo.
                        </p>
                        <div className="divide-y rounded-lg border">
                          {variables.map((v) => (
                            <div key={v} className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-3">
                                <code className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono border border-primary/20">
                                  {`{${v}}`}
                                </code>
                                <span className="text-sm text-muted-foreground">
                                  {getVariableDescription(v)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {SAMPLE_DATA[v] ?? "—"}
                                </span>
                                {SAMPLE_DATA[v] && (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : !creating ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Selecciona una plantilla del panel izquierdo.
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function getVariableDescription(v: string): string {
  const descriptions: Record<string, string> = {
    empresa_razon_social: "Razón social de la empresa cliente",
    empresa_nit: "NIT de la empresa",
    nombre_contacto_pila: "Nombre del contacto PILA de la empresa",
    mes_nombre: "Nombre del mes solicitado",
    anio: "Año del periodo",
    mes_anio: "Periodo en formato 'mes año'",
    nombre_consultor: "Nombre del consultor SG-SST asignado",
    email_remitente: "Email de Regis Colombia",
    telefono_consultor: "Teléfono del consultor",
    fecha_solicitud_original: "Fecha de la solicitud inicial",
    numero_recordatorio: "Número del recordatorio actual",
    max_recordatorios: "Máximo de recordatorios antes de escalar",
  };
  return descriptions[v] ?? "Variable personalizada";
}
