import { useEffect, useState, useCallback, useRef } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Search,
  X,
  Loader2,
  Save,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { empresasService, usuariosService, logsService, type Usuario } from "@/services";
import type { Empresa } from "@/types/domain";

/* ─── constants ─── */

const CAPITULOS = [
  { value: "capitulo_1", label: "Capítulo 1 — Hasta 10 trabajadores (Riesgo I-III)" },
  { value: "capitulo_2", label: "Capítulo 2 — 11-50 trabajadores (Riesgo I-III)" },
  { value: "capitulo_3", label: "Capítulo 3 — >50 trabajadores o Riesgo IV-V" },
];

const NIVELES_RIESGO = [
  { value: "1", label: "I — Riesgo mínimo" },
  { value: "2", label: "II — Riesgo bajo" },
  { value: "3", label: "III — Riesgo medio" },
  { value: "4", label: "IV — Riesgo alto" },
  { value: "5", label: "V — Riesgo máximo" },
];

const BULK_HEADERS = [
  "razon_social",
  "nit",
  "ciiu_codigo",
  "ciudad",
  "departamento",
  "direccion",
  "num_trabajadores",
  "nivel_riesgo_arl",
  "capitulo_0312",
  "nombre_contacto",
  "email_contacto",
  "telefono",
] as const;

const TEMPLATE_EXAMPLE = {
  razon_social: "Empresa Ejemplo SAS",
  nit: "900999888-1",
  ciiu_codigo: "4111",
  ciudad: "Bogotá",
  departamento: "Cundinamarca",
  direccion: "Cra 10 # 20-30",
  num_trabajadores: "25",
  nivel_riesgo_arl: "3",
  capitulo_0312: "2",
  nombre_contacto: "Ana Martínez",
  email_contacto: "ana@ejemplo.com",
  telefono: "300 123 4567",
};

/* ─── types ─── */

type EmpresaForm = {
  razon_social: string;
  nit: string;
  ciiu_codigo: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  num_trabajadores: number;
  nivel_riesgo_arl: number;
  capitulo_0312: string;
  nombre_contacto: string;
  email_contacto: string;
  telefono: string;
  consultor_id: string;
};

const emptyForm: EmpresaForm = {
  razon_social: "",
  nit: "",
  ciiu_codigo: "",
  ciudad: "",
  departamento: "",
  direccion: "",
  num_trabajadores: 1,
  nivel_riesgo_arl: 1,
  capitulo_0312: "capitulo_1",
  nombre_contacto: "",
  email_contacto: "",
  telefono: "",
  consultor_id: "",
};

type BulkRowStatus = "nueva" | "actualizar" | "error";

type BulkRow = {
  rowNum: number;
  data: Record<string, string>;
  status: BulkRowStatus;
  error?: string;
  existingId?: string;
  selected: boolean;
};

/* ─── helpers ─── */

function normalizeCapitulo(val: string): string {
  const s = String(val || "").trim().toLowerCase();
  if (s === "1" || s === "capitulo_1" || s === "cap 1" || s === "cap. 1") return "capitulo_1";
  if (s === "2" || s === "capitulo_2" || s === "cap 2" || s === "cap. 2") return "capitulo_2";
  if (s === "3" || s === "capitulo_3" || s === "cap 3" || s === "cap. 3") return "capitulo_3";
  return s;
}

function validateRow(row: Record<string, string>, allNits: string[], rowIdx: number): string | null {
  if (!row.razon_social?.trim()) return "Razón social es obligatoria";
  if (!row.nit?.trim()) return "NIT es obligatorio";
  if (!row.email_contacto?.trim()) return "Email de contacto es obligatorio";
  const num = parseInt(row.num_trabajadores);
  if (row.num_trabajadores && (isNaN(num) || num < 1)) return "Núm. trabajadores debe ser ≥ 1";
  const riesgo = parseInt(row.nivel_riesgo_arl);
  if (row.nivel_riesgo_arl && (isNaN(riesgo) || riesgo < 1 || riesgo > 5)) return "Nivel riesgo ARL debe ser 1-5";
  const cap = normalizeCapitulo(row.capitulo_0312);
  if (row.capitulo_0312 && !["capitulo_1", "capitulo_2", "capitulo_3", ""].includes(cap)) return "Capítulo debe ser 1, 2 o 3";
  const dupeIdx = allNits.indexOf(row.nit.trim());
  if (dupeIdx !== -1 && dupeIdx !== rowIdx) return `NIT duplicado en fila ${dupeIdx + 1}`;
  return null;
}

function parseFileRows(raw: Record<string, string>[]): Record<string, string>[] {
  return raw
    .filter((r) => Object.values(r).some((v) => v && String(v).trim()))
    .map((r) => {
      const normalized: Record<string, string> = {};
      for (const key of Object.keys(r)) {
        const k = key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
        normalized[k] = String(r[key] ?? "").trim();
      }
      return normalized;
    });
}

async function downloadTemplate(format: "csv" | "xlsx") {
  if (format === "csv") {
    const csv = Papa.unparse({ fields: [...BULK_HEADERS], data: [BULK_HEADERS.map((h) => TEMPLATE_EXAMPLE[h])] });
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, "plantilla_empresas.csv");
  } else {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet([[...BULK_HEADERS], BULK_HEADERS.map((h) => TEMPLATE_EXAMPLE[h])]);
    ws["!cols"] = BULK_HEADERS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empresas");
    XLSX.writeFile(wb, "plantilla_empresas.xlsx");
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── component ─── */

export default function Companies() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [consultores, setConsultores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmpresaForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // bulk state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkStep, setBulkStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [bulkResult, setBulkResult] = useState({ created: 0, updated: 0, errors: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin" || user?.role === "consultor";

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const [data, users] = await Promise.all([
        empresasService.listAll(),
        usuariosService.list(),
      ]);
      setEmpresas(data);
      setConsultores(users.filter((u) => u.rol === "admin" || u.rol === "consultor"));
    } catch (err: any) {
      toast.error(err.message || "Error al cargar empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadEmpresas();
  }, [isAdmin]);

  const filtered = empresas.filter((e) => {
    if (!showInactive && !e.activo) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.razon_social.toLowerCase().includes(q) ||
      e.nit.includes(q) ||
      e.email_contacto?.toLowerCase().includes(q) ||
      e.ciiu_codigo?.includes(q)
    );
  });

  /* ─── single CRUD handlers ─── */

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (empresa: Empresa) => {
    setEditingId(empresa.id);
    setForm({
      razon_social: empresa.razon_social || "",
      nit: empresa.nit || "",
      ciiu_codigo: empresa.ciiu_codigo || "",
      ciudad: empresa.ciudad || "",
      departamento: empresa.departamento || "",
      direccion: empresa.direccion || "",
      num_trabajadores: empresa.num_trabajadores || 1,
      nivel_riesgo_arl: empresa.nivel_riesgo_arl || 1,
      capitulo_0312: empresa.capitulo_0312 || "capitulo_1",
      nombre_contacto: empresa.nombre_contacto || "",
      email_contacto: empresa.email_contacto || "",
      telefono: empresa.telefono || "",
      consultor_id: (empresa as any).consultor_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.razon_social || !form.nit || !form.email_contacto) {
      toast.error("Razón social, NIT y email de contacto son obligatorios");
      return;
    }
    setSaving(true);
    try {
      // capitulo_0312 is GENERATED ALWAYS in Postgres — never send it
      const { capitulo_0312: _cap, ...rest } = form;
      const payload = { ...rest, consultor_id: form.consultor_id || null };
      if (editingId) {
        await empresasService.update(editingId, payload);
        await logsService.log({
          tipo: "actualizar",
          modulo: "empresas",
          descripcion: `Empresa actualizada: ${form.razon_social}`,
          empresa_id: editingId,
          usuario_id: user?.id,
          metadata: { nit: form.nit },
        });
        toast.success("Empresa actualizada");
      } else {
        await empresasService.create({ ...payload, activo: true });
        await logsService.log({
          tipo: "crear",
          modulo: "empresas",
          descripcion: `Nueva empresa creada: ${form.razon_social}`,
          empresa_id: undefined,
          usuario_id: user?.id,
          metadata: { nit: form.nit, razon_social: form.razon_social },
        });
        toast.success("Empresa creada exitosamente");
      }
      setDialogOpen(false);
      loadEmpresas();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (empresa: Empresa) => {
    try {
      if (empresa.activo) {
        await empresasService.deactivate(empresa.id);
        await logsService.log({
          tipo: "actualizar",
          modulo: "empresas",
          descripcion: `Empresa desactivada: ${empresa.razon_social}`,
          empresa_id: empresa.id,
          usuario_id: user?.id,
          metadata: { nit: empresa.nit },
        });
        toast.success(`${empresa.razon_social} desactivada`);
      } else {
        await empresasService.activate(empresa.id);
        await logsService.log({
          tipo: "actualizar",
          modulo: "empresas",
          descripcion: `Empresa reactivada: ${empresa.razon_social}`,
          empresa_id: empresa.id,
          usuario_id: user?.id,
          metadata: { nit: empresa.nit },
        });
        toast.success(`${empresa.razon_social} reactivada`);
      }
      loadEmpresas();
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar estado");
    }
  };

  const updateField = (field: keyof EmpresaForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ─── bulk upload handlers ─── */

  const openBulk = () => {
    setBulkRows([]);
    setBulkStep("upload");
    setBulkResult({ created: 0, updated: 0, errors: 0 });
    setBulkOpen(true);
  };

  const processFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "csv" || ext === "txt") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rows = parseFileRows(result.data as Record<string, string>[]);
            classifyRows(rows);
          },
          error: () => toast.error("Error al leer el archivo CSV"),
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const XLSX = await import("xlsx");
            const wb = XLSX.read(ev.target?.result, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
            const rows = parseFileRows(raw);
            classifyRows(rows);
          } catch {
            toast.error("Error al leer el archivo Excel");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error("Formato no soportado. Usa .csv, .xlsx o .xls");
      }
    },
    [empresas],
  );

  const classifyRows = (rows: Record<string, string>[]) => {
    if (rows.length === 0) {
      toast.error("El archivo no contiene datos");
      return;
    }
    const allNits = rows.map((r) => (r.nit || "").trim());
    const classified: BulkRow[] = rows.map((data, idx) => {
      const error = validateRow(data, allNits, idx);
      if (error) return { rowNum: idx + 1, data, status: "error" as const, error, selected: false };

      const existing = empresas.find((e) => e.nit === data.nit.trim());
      if (existing) {
        return { rowNum: idx + 1, data, status: "actualizar" as const, existingId: existing.id, selected: true };
      }
      return { rowNum: idx + 1, data, status: "nueva" as const, selected: true };
    });
    setBulkRows(classified);
    setBulkStep("preview");
  };

  const toggleRow = (idx: number) => {
    setBulkRows((prev) =>
      prev.map((r, i) => (i === idx && r.status !== "error" ? { ...r, selected: !r.selected } : r)),
    );
  };

  const toggleAll = (checked: boolean) => {
    setBulkRows((prev) => prev.map((r) => (r.status !== "error" ? { ...r, selected: checked } : r)));
  };

  const handleBulkImport = async () => {
    const selected = bulkRows.filter((r) => r.selected && r.status !== "error");
    if (selected.length === 0) {
      toast.error("No hay filas seleccionadas para importar");
      return;
    }
    setBulkStep("importing");
    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const row of selected) {
      const d = row.data;
      const payload: Partial<Empresa> = {
        razon_social: d.razon_social.trim(),
        nit: d.nit.trim(),
        ciiu_codigo: d.ciiu_codigo?.trim() || "",
        ciudad: d.ciudad?.trim() || "",
        departamento: d.departamento?.trim() || "",
        direccion: d.direccion?.trim() || "",
        num_trabajadores: parseInt(d.num_trabajadores) || 1,
        nivel_riesgo_arl: parseInt(d.nivel_riesgo_arl) || 1,
        // capitulo_0312 is GENERATED ALWAYS — do not send
        nombre_contacto: d.nombre_contacto?.trim() || "",
        email_contacto: d.email_contacto.trim(),
        telefono: d.telefono?.trim() || "",
        activo: true,
      };

      try {
        if (row.status === "actualizar" && row.existingId) {
          await empresasService.update(row.existingId, payload);
          updated++;
        } else {
          await empresasService.create(payload);
          created++;
        }
      } catch {
        errors++;
      }
    }

    setBulkResult({ created, updated, errors });
    setBulkStep("done");
    await logsService.log({
      tipo: "crear",
      modulo: "empresas",
      descripcion: `Carga masiva de empresas: ${created} creadas, ${updated} actualizadas, ${errors} errores`,
      empresa_id: undefined,
      usuario_id: user?.id,
      metadata: { created, updated, errors },
    });
    loadEmpresas();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  /* ─── guards ─── */

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Empresas" description="No tienes permisos para gestionar empresas." />
      </div>
    );
  }

  const activeCount = empresas.filter((e) => e.activo).length;
  const inactiveCount = empresas.filter((e) => !e.activo).length;

  // bulk counts
  const bulkNewCount = bulkRows.filter((r) => r.status === "nueva").length;
  const bulkUpdateCount = bulkRows.filter((r) => r.status === "actualizar").length;
  const bulkErrorCount = bulkRows.filter((r) => r.status === "error").length;
  const bulkSelectedCount = bulkRows.filter((r) => r.selected && r.status !== "error").length;

  return (
    <div>
      <PageHeader
        title="Gestión de Empresas"
        description="Administra las empresas cliente del SG-SST. Agrega, edita o desactiva empresas."
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{empresas.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Empresas</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Activas</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-500">{inactiveCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Inactivas</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Empresas Cliente
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, NIT, CIIU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button
                variant={showInactive ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? "Ocultar inactivas" : "Mostrar inactivas"}
              </Button>
              <Button variant="outline" size="sm" onClick={openBulk} className="gap-1">
                <Upload className="h-4 w-4" /> Carga Masiva
              </Button>
              <Button size="sm" onClick={openNew} className="gap-1">
                <Plus className="h-4 w-4" /> Nueva Empresa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razón Social</TableHead>
                  <TableHead>NIT</TableHead>
                  <TableHead>CIIU</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead className="text-center">Trabajadores</TableHead>
                  <TableHead>Capítulo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Consultor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {search ? "Sin resultados para la búsqueda." : "No hay empresas registradas."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id} className={!e.activo ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{e.razon_social}</TableCell>
                      <TableCell className="font-mono text-xs">{e.nit}</TableCell>
                      <TableCell className="font-mono text-xs">{e.ciiu_codigo}</TableCell>
                      <TableCell className="text-sm">{e.ciudad}</TableCell>
                      <TableCell className="text-center">{e.num_trabajadores}</TableCell>
                      <TableCell className="text-xs">
                        {String(e.capitulo_0312 || "").replace("capitulo_", "Cap. ")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{e.nombre_contacto}</div>
                        <div className="text-xs text-muted-foreground">{e.email_contacto}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {(e as any).consultor_id
                          ? consultores.find((c) => c.id === (e as any).consultor_id)?.nombre || "—"
                          : <span className="text-muted-foreground">Sin asignar</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.activo ? "default" : "secondary"}>
                          {e.activo ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(e)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(e)}
                            title={e.activo ? "Desactivar" : "Reactivar"}
                          >
                            {e.activo ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-emerald-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Single company dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Empresa" : "Nueva Empresa"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razón Social *</Label>
                <Input value={form.razon_social} onChange={(e) => updateField("razon_social", e.target.value)} placeholder="Nombre de la empresa" />
              </div>
              <div className="space-y-2">
                <Label>NIT *</Label>
                <Input value={form.nit} onChange={(e) => updateField("nit", e.target.value)} placeholder="900123456-7" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código CIIU</Label>
                <Input value={form.ciiu_codigo} onChange={(e) => updateField("ciiu_codigo", e.target.value)} placeholder="5611" />
              </div>
              <div className="space-y-2">
                <Label>Nivel de Riesgo ARL</Label>
                <Select value={String(form.nivel_riesgo_arl)} onValueChange={(v) => updateField("nivel_riesgo_arl", parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NIVELES_RIESGO.map((n) => (
                      <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Capítulo Resolución 0312</Label>
              <Select value={form.capitulo_0312} onValueChange={(v) => updateField("capitulo_0312", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAPITULOS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input value={form.ciudad} onChange={(e) => updateField("ciudad", e.target.value)} placeholder="Bogotá" />
              </div>
              <div className="space-y-2">
                <Label>Departamento</Label>
                <Input value={form.departamento} onChange={(e) => updateField("departamento", e.target.value)} placeholder="Cundinamarca" />
              </div>
              <div className="space-y-2">
                <Label>N. Trabajadores</Label>
                <Input type="number" min={1} value={form.num_trabajadores} onChange={(e) => updateField("num_trabajadores", parseInt(e.target.value) || 1)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={form.direccion} onChange={(e) => updateField("direccion", e.target.value)} placeholder="Cra 10 # 20-30" />
              </div>
              <div className="space-y-2">
                <Label>Consultor Asignado</Label>
                <Select value={form.consultor_id || "__none__"} onValueChange={(v) => updateField("consultor_id", v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin asignar</SelectItem>
                    {consultores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre} ({c.rol})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Datos de contacto PILA</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Nombre contacto *</Label>
                  <Input value={form.nombre_contacto} onChange={(e) => updateField("nombre_contacto", e.target.value)} placeholder="María López" />
                </div>
                <div className="space-y-2">
                  <Label>Email contacto *</Label>
                  <Input type="email" value={form.email_contacto} onChange={(e) => updateField("email_contacto", e.target.value)} placeholder="contacto@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} placeholder="300 123 4567" />
                </div>
              </div>

              {/* Logo upload */}
              <div className="space-y-2 pt-2">
                <Label>Logo de la empresa</Label>
                <div className="flex items-center gap-4">
                  {editingId && (() => {
                    const emp = empresas.find(e => e.id === editingId);
                    return (emp as any)?.logo_url ? (
                      <img src={(emp as any).logo_url} alt="Logo" className="h-12 w-auto rounded border object-contain" />
                    ) : null;
                  })()}
                  <Input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="max-w-xs"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error("El logo no debe superar 2 MB"); return; }
                      if (!editingId) { toast.info("Guarde la empresa primero, luego suba el logo"); return; }
                      try {
                        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
                        const path = `logos/${editingId}/logo.${ext}`;
                        const { error: upErr } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
                        if (upErr) throw upErr;
                        const { data: urlData } = await supabase.storage.from("documentos").createSignedUrl(path, 31536000);
                        if (urlData?.signedUrl) {
                          await supabase.from("empresas_cliente").update({ logo_url: urlData.signedUrl }).eq("id", editingId);
                          toast.success("Logo actualizado");
                          loadEmpresas();
                        }
                      } catch (err: any) { toast.error(err.message || "Error al subir logo"); }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">PNG o JPG, máximo 2 MB. {!editingId && "Disponible después de crear la empresa."}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear Empresa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Bulk upload dialog ─── */}
      <Dialog open={bulkOpen} onOpenChange={(open) => { if (!open && bulkStep !== "importing") setBulkOpen(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Carga Masiva de Empresas
            </DialogTitle>
          </DialogHeader>

          {/* Step 1: Upload */}
          {bulkStep === "upload" && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate("csv")} className="gap-1">
                  <Download className="h-4 w-4" /> Plantilla CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate("xlsx")} className="gap-1">
                  <Download className="h-4 w-4" /> Plantilla Excel
                </Button>
                <span className="text-xs text-muted-foreground">Descarga la plantilla, llénala y súbela aquí.</span>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Arrastra un archivo aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground mt-1">Soporta .csv, .xlsx, .xls</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-1">
                <p className="font-medium text-sm mb-2">Columnas requeridas:</p>
                <div className="grid grid-cols-3 gap-1">
                  {BULK_HEADERS.map((h) => (
                    <code key={h} className="bg-background px-1.5 py-0.5 rounded text-[11px]">{h}</code>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">
                  Si el NIT ya existe en la base de datos, la fila se marcará como actualización.
                  Campos obligatorios: <strong>razon_social</strong>, <strong>nit</strong>, <strong>email_contacto</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {bulkStep === "preview" && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {bulkNewCount} nuevas
                </Badge>
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <RefreshCw className="h-3 w-3" /> {bulkUpdateCount} actualizar
                </Badge>
                {bulkErrorCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> {bulkErrorCount} errores
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {bulkSelectedCount} de {bulkRows.length} filas seleccionadas
                </span>
              </div>

              <div className="overflow-x-auto border rounded-lg max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={bulkRows.filter((r) => r.status !== "error").every((r) => r.selected)}
                          onCheckedChange={(v) => toggleAll(!!v)}
                        />
                      </TableHead>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead className="w-20">Estado</TableHead>
                      <TableHead>Razón Social</TableHead>
                      <TableHead>NIT</TableHead>
                      <TableHead>CIIU</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkRows.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className={
                          row.status === "error"
                            ? "bg-red-50/50"
                            : row.status === "actualizar"
                            ? "bg-amber-50/50"
                            : ""
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={row.selected}
                            disabled={row.status === "error"}
                            onCheckedChange={() => toggleRow(idx)}
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.rowNum}</TableCell>
                        <TableCell>
                          {row.status === "nueva" && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Nueva</Badge>
                          )}
                          {row.status === "actualizar" && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 hover:bg-amber-100">Actualizar</Badge>
                          )}
                          {row.status === "error" && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm max-w-[160px] truncate">{row.data.razon_social || <span className="text-red-400 italic">vacío</span>}</TableCell>
                        <TableCell className="font-mono text-xs">{row.data.nit || <span className="text-red-400 italic">vacío</span>}</TableCell>
                        <TableCell className="font-mono text-xs">{row.data.ciiu_codigo}</TableCell>
                        <TableCell className="text-xs">{row.data.ciudad}</TableCell>
                        <TableCell className="text-xs">{row.data.nombre_contacto}</TableCell>
                        <TableCell className="text-xs">{row.data.email_contacto || <span className="text-red-400 italic">vacío</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {bulkErrorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-red-800">Errores encontrados:</p>
                  {bulkRows
                    .filter((r) => r.status === "error")
                    .map((r, i) => (
                      <p key={i} className="text-xs text-red-700">
                        Fila {r.rowNum}: {r.error}
                      </p>
                    ))}
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setBulkStep("upload")} className="gap-1">
                  <Upload className="h-4 w-4" /> Subir otro archivo
                </Button>
                <Button onClick={handleBulkImport} disabled={bulkSelectedCount === 0} className="gap-1">
                  <Save className="h-4 w-4" /> Importar {bulkSelectedCount} empresa{bulkSelectedCount !== 1 ? "s" : ""}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 3: Importing */}
          {bulkStep === "importing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <p className="text-sm font-medium">Importando empresas...</p>
              <p className="text-xs text-muted-foreground">No cierres esta ventana.</p>
            </div>
          )}

          {/* Step 4: Done */}
          {bulkStep === "done" && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
              <p className="text-lg font-medium">Importación completada</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                {bulkResult.created > 0 && (
                  <span className="text-emerald-600 font-medium">{bulkResult.created} creadas</span>
                )}
                {bulkResult.updated > 0 && (
                  <span className="text-amber-600 font-medium">{bulkResult.updated} actualizadas</span>
                )}
                {bulkResult.errors > 0 && (
                  <span className="text-red-600 font-medium">{bulkResult.errors} errores</span>
                )}
              </div>
              <DialogFooter className="justify-center pt-4">
                <Button onClick={() => setBulkOpen(false)}>Cerrar</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
