import { useEffect, useState, useCallback, useRef } from "react";
import {
  HardHat,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Search,
  Loader2,
  Save,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { empresasService, trabajadoresService } from "@/services";
import type { Empresa, Trabajador } from "@/types/domain";

/* ─── bulk constants ─── */

const BULK_HEADERS = [
  "nombre", "cedula", "cargo", "area", "fecha_ingreso",
] as const;

const TEMPLATE_EXAMPLE = {
  nombre: "María López",
  cedula: "1023456789",
  cargo: "Operaria",
  area: "Producción",
  fecha_ingreso: "2024-01-15",
};

/* ─── types ─── */

type WorkerForm = {
  nombre: string;
  cedula: string;
  cargo: string;
  area: string;
  fecha_ingreso: string;
};

const emptyForm: WorkerForm = {
  nombre: "",
  cedula: "",
  cargo: "",
  area: "",
  fecha_ingreso: "",
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

function validateRow(row: Record<string, string>, allCedulas: string[], rowIdx: number): string | null {
  if (!row.nombre?.trim()) return "Nombre es obligatorio";
  if (!row.cedula?.trim()) return "Cédula es obligatoria";
  const dupeIdx = allCedulas.indexOf(row.cedula.trim());
  if (dupeIdx !== -1 && dupeIdx !== rowIdx) return `Cédula duplicada en fila ${dupeIdx + 1}`;
  return null;
}

function downloadTemplate(format: "csv" | "xlsx") {
  if (format === "csv") {
    const csv = Papa.unparse({ fields: [...BULK_HEADERS], data: [BULK_HEADERS.map((h) => TEMPLATE_EXAMPLE[h])] });
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla_trabajadores.csv"; a.click();
    URL.revokeObjectURL(url);
  } else {
    const ws = XLSX.utils.aoa_to_sheet([[...BULK_HEADERS], BULK_HEADERS.map((h) => TEMPLATE_EXAMPLE[h])]);
    ws["!cols"] = BULK_HEADERS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trabajadores");
    XLSX.writeFile(wb, "plantilla_trabajadores.xlsx");
  }
}

/* ─── component ─── */

export default function Workers() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [workers, setWorkers] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  // single form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // bulk
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkStep, setBulkStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [bulkResult, setBulkResult] = useState({ created: 0, updated: 0, errors: 0 });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin" || user?.role === "consultor";

  useEffect(() => {
    if (isAdmin) {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user, isAdmin]);

  const loadWorkers = async (empresaId: string) => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const data = await trabajadoresService.listAllByEmpresa(empresaId);
      setWorkers(data);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar trabajadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmpresa) loadWorkers(selectedEmpresa);
    else setWorkers([]);
  }, [selectedEmpresa]);

  const filtered = workers.filter((w) => {
    if (!showInactive && !w.activo) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.nombre.toLowerCase().includes(q) ||
      w.cedula.includes(q) ||
      (w.cargo || "").toLowerCase().includes(q) ||
      (w.area || "").toLowerCase().includes(q)
    );
  });

  /* ─── single CRUD ─── */

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (w: Trabajador) => {
    setEditingId(w.id);
    setForm({
      nombre: w.nombre || "",
      cedula: w.cedula || "",
      cargo: w.cargo || "",
      area: w.area || "",
      fecha_ingreso: w.fecha_ingreso || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.cedula) {
      toast.error("Nombre y cédula son obligatorios");
      return;
    }
    if (!selectedEmpresa) {
      toast.error("Selecciona una empresa primero");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await trabajadoresService.update(editingId, {
          nombre: form.nombre,
          cedula: form.cedula,
          cargo: form.cargo || undefined,
          area: form.area || undefined,
          fecha_ingreso: form.fecha_ingreso || undefined,
        });
        toast.success("Trabajador actualizado");
      } else {
        await trabajadoresService.create({
          empresa_id: selectedEmpresa,
          nombre: form.nombre,
          cedula: form.cedula,
          cargo: form.cargo || undefined,
          area: form.area || undefined,
          fecha_ingreso: form.fecha_ingreso || undefined,
          activo: true,
        });
        toast.success("Trabajador creado");
      }
      setDialogOpen(false);
      loadWorkers(selectedEmpresa);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (w: Trabajador) => {
    try {
      if (w.activo) {
        await trabajadoresService.deactivate(w.id);
        toast.success(`${w.nombre} retirado`);
      } else {
        await trabajadoresService.activate(w.id);
        toast.success(`${w.nombre} reactivado`);
      }
      loadWorkers(selectedEmpresa);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar estado");
    }
  };

  const updateField = (field: keyof WorkerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ─── bulk upload ─── */

  const openBulk = () => {
    setBulkRows([]);
    setBulkStep("upload");
    setBulkResult({ created: 0, updated: 0, errors: 0 });
    setBulkOpen(true);
  };

  const processFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "txt") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => classifyRows(parseFileRows(result.data as Record<string, string>[])),
        error: () => toast.error("Error al leer CSV"),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target?.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
          classifyRows(parseFileRows(raw));
        } catch { toast.error("Error al leer Excel"); }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error("Formato no soportado. Usa .csv, .xlsx o .xls");
    }
  }, [workers]);

  const classifyRows = (rows: Record<string, string>[]) => {
    if (rows.length === 0) { toast.error("El archivo no contiene datos"); return; }
    const allCedulas = rows.map((r) => (r.cedula || "").trim());
    const classified: BulkRow[] = rows.map((data, idx) => {
      const error = validateRow(data, allCedulas, idx);
      if (error) return { rowNum: idx + 1, data, status: "error" as const, error, selected: false };
      const existing = workers.find((w) => w.cedula === data.cedula.trim());
      if (existing) return { rowNum: idx + 1, data, status: "actualizar" as const, existingId: existing.id, selected: true };
      return { rowNum: idx + 1, data, status: "nueva" as const, selected: true };
    });
    setBulkRows(classified);
    setBulkStep("preview");
  };

  const toggleRow = (idx: number) => {
    setBulkRows((prev) => prev.map((r, i) => (i === idx && r.status !== "error" ? { ...r, selected: !r.selected } : r)));
  };

  const toggleAll = (checked: boolean) => {
    setBulkRows((prev) => prev.map((r) => (r.status !== "error" ? { ...r, selected: checked } : r)));
  };

  const handleBulkImport = async () => {
    const selected = bulkRows.filter((r) => r.selected && r.status !== "error");
    if (selected.length === 0) { toast.error("No hay filas seleccionadas"); return; }
    setBulkStep("importing");
    let created = 0, updated = 0, errors = 0;
    for (const row of selected) {
      const d = row.data;
      const payload: Partial<Trabajador> = {
        empresa_id: selectedEmpresa,
        nombre: d.nombre.trim(),
        cedula: d.cedula.trim(),
        cargo: d.cargo?.trim() || undefined,
        area: d.area?.trim() || undefined,
        fecha_ingreso: d.fecha_ingreso?.trim() || undefined,
        activo: true,
      };
      try {
        if (row.status === "actualizar" && row.existingId) {
          await trabajadoresService.update(row.existingId, payload);
          updated++;
        } else {
          await trabajadoresService.create(payload);
          created++;
        }
      } catch { errors++; }
    }
    setBulkResult({ created, updated, errors });
    setBulkStep("done");
    loadWorkers(selectedEmpresa);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }, [processFile]);

  /* ─── render ─── */

  const activeCount = workers.filter((w) => w.activo).length;
  const inactiveCount = workers.filter((w) => !w.activo).length;
  const selectedEmpresaName = empresas.find((e) => e.id === selectedEmpresa)?.razon_social || "";

  const bulkNewCount = bulkRows.filter((r) => r.status === "nueva").length;
  const bulkUpdateCount = bulkRows.filter((r) => r.status === "actualizar").length;
  const bulkErrorCount = bulkRows.filter((r) => r.status === "error").length;
  const bulkSelectedCount = bulkRows.filter((r) => r.selected && r.status !== "error").length;

  return (
    <div>
      <PageHeader
        title="Gestión de Trabajadores"
        description="Administra el personal de cada empresa cliente. Agrega, edita o retira trabajadores."
      />

      {/* Company selector */}
      {isAdmin && (
        <div className="mb-6 max-w-sm">
          <Label className="mb-2 block">Empresa</Label>
          <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
            <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.razon_social} — {e.nit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedEmpresa && (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{workers.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Trabajadores</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{activeCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Activos</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-red-500">{inactiveCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Retirados</div>
              </CardContent>
            </Card>
          </div>

          {/* Worker table */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <HardHat className="h-4 w-4" /> Trabajadores — {selectedEmpresaName}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar nombre, cédula, cargo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-56"
                    />
                  </div>
                  <Button
                    variant={showInactive ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                  >
                    {showInactive ? "Ocultar retirados" : "Mostrar retirados"}
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="sm" onClick={openBulk} className="gap-1">
                        <Upload className="h-4 w-4" /> Carga Masiva
                      </Button>
                      <Button size="sm" onClick={openNew} className="gap-1">
                        <Plus className="h-4 w-4" /> Nuevo Trabajador
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Fecha Ingreso</TableHead>
                      <TableHead>Estado</TableHead>
                      {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {search ? "Sin resultados." : "No hay trabajadores registrados."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((w) => (
                        <TableRow key={w.id} className={!w.activo ? "opacity-50" : ""}>
                          <TableCell className="font-medium">{w.nombre}</TableCell>
                          <TableCell className="font-mono text-xs">{w.cedula}</TableCell>
                          <TableCell className="text-sm">{w.cargo || "—"}</TableCell>
                          <TableCell className="text-sm">{w.area || "—"}</TableCell>
                          <TableCell className="text-sm">{w.fecha_ingreso || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={w.activo ? "default" : "secondary"}>
                              {w.activo ? "Activo" : "Retirado"}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(w)} title="Editar">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleActive(w)}
                                  title={w.activo ? "Retirar" : "Reactivar"}
                                >
                                  {w.activo ? (
                                    <UserMinus className="h-4 w-4 text-red-500" />
                                  ) : (
                                    <Power className="h-4 w-4 text-emerald-600" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedEmpresa && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <HardHat className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Selecciona una empresa para ver y gestionar sus trabajadores.</p>
          </CardContent>
        </Card>
      )}

      {/* ─── Single worker dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Trabajador" : "Nuevo Trabajador"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input value={form.nombre} onChange={(e) => updateField("nombre", e.target.value)} placeholder="Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label>Cédula *</Label>
                <Input value={form.cedula} onChange={(e) => updateField("cedula", e.target.value)} placeholder="1023456789" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input value={form.cargo} onChange={(e) => updateField("cargo", e.target.value)} placeholder="Operario" />
              </div>
              <div className="space-y-2">
                <Label>Área</Label>
                <Input value={form.area} onChange={(e) => updateField("area", e.target.value)} placeholder="Producción" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha de ingreso</Label>
              <Input type="date" value={form.fecha_ingreso} onChange={(e) => updateField("fecha_ingreso", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Bulk upload dialog ─── */}
      <Dialog open={bulkOpen} onOpenChange={(open) => { if (!open && bulkStep !== "importing") setBulkOpen(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Carga Masiva — {selectedEmpresaName}
            </DialogTitle>
          </DialogHeader>

          {bulkStep === "upload" && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate("csv")} className="gap-1">
                  <Download className="h-4 w-4" /> Plantilla CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate("xlsx")} className="gap-1">
                  <Download className="h-4 w-4" /> Plantilla Excel
                </Button>
                <span className="text-xs text-muted-foreground">Descarga, llena y sube.</span>
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
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileInput} />
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-xs space-y-1">
                <p className="font-medium text-sm mb-2">Columnas:</p>
                <div className="grid grid-cols-3 gap-1">
                  {BULK_HEADERS.map((h) => (
                    <code key={h} className="bg-background px-1.5 py-0.5 rounded text-[11px]">{h}</code>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">
                  Si la cédula ya existe para esta empresa, la fila se marca como actualización.
                  Obligatorios: <strong>nombre</strong>, <strong>cedula</strong>.
                </p>
              </div>
            </div>
          )}

          {bulkStep === "preview" && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> {bulkNewCount} nuevos</Badge>
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"><RefreshCw className="h-3 w-3" /> {bulkUpdateCount} actualizar</Badge>
                {bulkErrorCount > 0 && <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> {bulkErrorCount} errores</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">{bulkSelectedCount} seleccionados</span>
              </div>
              <div className="overflow-x-auto border rounded-lg max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={bulkRows.filter((r) => r.status !== "error").every((r) => r.selected)} onCheckedChange={(v) => toggleAll(!!v)} />
                      </TableHead>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead className="w-20">Estado</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cédula</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Ingreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bulkRows.map((row, idx) => (
                      <TableRow key={idx} className={row.status === "error" ? "bg-red-50/50" : row.status === "actualizar" ? "bg-amber-50/50" : ""}>
                        <TableCell><Checkbox checked={row.selected} disabled={row.status === "error"} onCheckedChange={() => toggleRow(idx)} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.rowNum}</TableCell>
                        <TableCell>
                          {row.status === "nueva" && <Badge variant="default" className="text-[10px] px-1.5 py-0">Nuevo</Badge>}
                          {row.status === "actualizar" && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 hover:bg-amber-100">Actualizar</Badge>}
                          {row.status === "error" && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Error</Badge>}
                        </TableCell>
                        <TableCell className="text-sm">{row.data.nombre || <span className="text-red-400 italic">vacío</span>}</TableCell>
                        <TableCell className="font-mono text-xs">{row.data.cedula || <span className="text-red-400 italic">vacío</span>}</TableCell>
                        <TableCell className="text-xs">{row.data.cargo}</TableCell>
                        <TableCell className="text-xs">{row.data.area}</TableCell>
                        <TableCell className="text-xs">{row.data.fecha_ingreso}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {bulkErrorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium text-red-800">Errores:</p>
                  {bulkRows.filter((r) => r.status === "error").map((r, i) => (
                    <p key={i} className="text-xs text-red-700">Fila {r.rowNum}: {r.error}</p>
                  ))}
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setBulkStep("upload")} className="gap-1"><Upload className="h-4 w-4" /> Subir otro</Button>
                <Button onClick={handleBulkImport} disabled={bulkSelectedCount === 0} className="gap-1">
                  <Save className="h-4 w-4" /> Importar {bulkSelectedCount} trabajador{bulkSelectedCount !== 1 ? "es" : ""}
                </Button>
              </DialogFooter>
            </div>
          )}

          {bulkStep === "importing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <p className="text-sm font-medium">Importando trabajadores...</p>
            </div>
          )}

          {bulkStep === "done" && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
              <p className="text-lg font-medium">Importación completada</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                {bulkResult.created > 0 && <span className="text-emerald-600 font-medium">{bulkResult.created} creados</span>}
                {bulkResult.updated > 0 && <span className="text-amber-600 font-medium">{bulkResult.updated} actualizados</span>}
                {bulkResult.errors > 0 && <span className="text-red-600 font-medium">{bulkResult.errors} errores</span>}
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
