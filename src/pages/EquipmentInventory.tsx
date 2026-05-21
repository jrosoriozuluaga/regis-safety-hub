import { useEffect, useState } from "react";
import {
  Flame,
  Heart,
  BedDouble,
  AlertTriangle,
  HardHat,
  Package,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Filter,
  Loader2,
  ShieldAlert,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Empresa } from "@/types/domain";
import { empresasService, logsService, configuracionService } from "@/services";
import { PageHeader } from "@/components/common/PageHeader";
import { TablePagination, usePagination } from "@/components/common/TablePagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

// ── Types ──────────────────────────────────────────

type TipoEquipo = "extintor" | "botiquin" | "camilla" | "señalizacion" | "epp" | "otro";
type EstadoEquipo = "vigente" | "por_vencer" | "vencido" | "fuera_servicio";

type Equipo = {
  id: string;
  empresa_id: string;
  tipo: TipoEquipo;
  nombre: string;
  ubicacion: string | null;
  marca: string | null;
  serial: string | null;
  fecha_adquisicion: string | null;
  fecha_vencimiento: string | null;
  fecha_ultima_inspeccion: string | null;
  fecha_proxima_inspeccion: string | null;
  estado: EstadoEquipo;
  notas: string | null;
  created_at: string;
  updated_at: string;
  empresa_razon_social?: string;
};

type EquipoForm = {
  empresa_id: string;
  tipo: TipoEquipo;
  nombre: string;
  ubicacion: string;
  marca: string;
  serial: string;
  fecha_adquisicion: string;
  fecha_vencimiento: string;
  fecha_ultima_inspeccion: string;
  fecha_proxima_inspeccion: string;
  estado: EstadoEquipo;
  notas: string;
};

// ── Constants ──────────────────────────────────────

const TIPO_CONFIG: Record<TipoEquipo, { label: string; icon: typeof Flame }> = {
  extintor: { label: "Extintor", icon: Flame },
  botiquin: { label: "Botiquin", icon: Heart },
  camilla: { label: "Camilla", icon: BedDouble },
  señalizacion: { label: "Senalizacion", icon: AlertTriangle },
  epp: { label: "EPP", icon: HardHat },
  otro: { label: "Otro", icon: Package },
};

const ESTADO_CONFIG: Record<EstadoEquipo, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  vigente: { label: "Vigente", variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  por_vencer: { label: "Por vencer", variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  vencido: { label: "Vencido", variant: "destructive" },
  fuera_servicio: { label: "Fuera de servicio", variant: "outline" },
};

const EMPTY_FORM: EquipoForm = {
  empresa_id: "",
  tipo: "extintor",
  nombre: "",
  ubicacion: "",
  marca: "",
  serial: "",
  fecha_adquisicion: "",
  fecha_vencimiento: "",
  fecha_ultima_inspeccion: "",
  fecha_proxima_inspeccion: "",
  estado: "vigente",
  notas: "",
};

// ── Helpers ────────────────────────────────────────

function computeEstado(equipo: { fecha_vencimiento: string | null; estado: EstadoEquipo }, diasAviso = 30): EstadoEquipo {
  if (equipo.estado === "fuera_servicio") return "fuera_servicio";
  if (!equipo.fecha_vencimiento) return equipo.estado;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const venc = new Date(equipo.fecha_vencimiento + "T00:00:00");
  if (venc < now) return "vencido";
  const diffMs = venc.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= diasAviso) return "por_vencer";
  return "vigente";
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  try {
    return new Date(date + "T00:00:00").toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

// ── Component ──────────────────────────────────────

export default function EquipmentInventory() {
  const { user } = useAuth();

  // Data
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diasAviso, setDiasAviso] = useState(30);

  const { paginatedItems: pagedEquipos, currentPage: eqPage, totalPages: eqTotal, setCurrentPage: eqSetPage, totalItems: eqItems, pageSize: eqSize } = usePagination(equipos, 10);

  // Filters
  const [filterEmpresa, setFilterEmpresa] = useState<string>("all");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipoForm>({ ...EMPTY_FORM });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Equipo | null>(null);

  // ── Load data ──

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setFilterEmpresa(user.empresa_id);
    }
    // Load configurable threshold
    configuracionService.list().then((configs) => {
      const cfg = configs.find((c) => c.clave === "equipos_dias_aviso_vencimiento");
      if (cfg?.valor) setDiasAviso(parseInt(cfg.valor) || 30);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    loadEquipos();
  }, [filterEmpresa, user]);

  async function loadEquipos() {
    setLoading(true);
    try {
      let query = supabase
        .from("inventario_equipos")
        .select("*, empresas_cliente(razon_social)")
        .order("created_at", { ascending: false });

      if (filterEmpresa && filterEmpresa !== "all") {
        query = query.eq("empresa_id", filterEmpresa);
      } else if (user?.role === "cliente" && user?.empresa_id) {
        query = query.eq("empresa_id", user.empresa_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows: Equipo[] = (data ?? []).map((row: any) => {
        const equipo: Equipo = {
          ...row,
          empresa_razon_social: row.empresas_cliente?.razon_social,
        };
        equipo.estado = computeEstado(equipo, diasAviso);
        return equipo;
      });

      setEquipos(rows);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar equipos");
    } finally {
      setLoading(false);
    }
  }

  // ── KPI stats ──

  const total = equipos.length;
  const vigentes = equipos.filter((e) => e.estado === "vigente").length;
  const porVencer = equipos.filter((e) => e.estado === "por_vencer").length;
  const vencidos = equipos.filter((e) => e.estado === "vencido").length;
  const needsAttention = porVencer + vencidos;

  // ── Dialog helpers ──

  function openAdd() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      empresa_id:
        user?.role === "cliente" && user?.empresa_id
          ? user.empresa_id
          : filterEmpresa !== "all"
          ? filterEmpresa
          : "",
    });
    setDialogOpen(true);
  }

  function openEdit(equipo: Equipo) {
    setEditingId(equipo.id);
    setForm({
      empresa_id: equipo.empresa_id,
      tipo: equipo.tipo,
      nombre: equipo.nombre,
      ubicacion: equipo.ubicacion ?? "",
      marca: equipo.marca ?? "",
      serial: equipo.serial ?? "",
      fecha_adquisicion: equipo.fecha_adquisicion ?? "",
      fecha_vencimiento: equipo.fecha_vencimiento ?? "",
      fecha_ultima_inspeccion: equipo.fecha_ultima_inspeccion ?? "",
      fecha_proxima_inspeccion: equipo.fecha_proxima_inspeccion ?? "",
      estado: equipo.estado,
      notas: equipo.notas ?? "",
    });
    setDialogOpen(true);
  }

  function updateForm(field: keyof EquipoForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ── CRUD ──

  async function handleSave() {
    if (!form.empresa_id) {
      toast.error("Selecciona una empresa");
      return;
    }
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        empresa_id: form.empresa_id,
        tipo: form.tipo,
        nombre: form.nombre.trim(),
        ubicacion: form.ubicacion.trim() || null,
        marca: form.marca.trim() || null,
        serial: form.serial.trim() || null,
        fecha_adquisicion: form.fecha_adquisicion || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        fecha_ultima_inspeccion: form.fecha_ultima_inspeccion || null,
        fecha_proxima_inspeccion: form.fecha_proxima_inspeccion || null,
        estado: form.estado,
        notas: form.notas.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Auto-detect status based on expiry date
      const autoEstado = computeEstado({
        fecha_vencimiento: payload.fecha_vencimiento,
        estado: payload.estado,
      }, diasAviso);
      if (payload.estado !== "fuera_servicio") {
        payload.estado = autoEstado;
      }

      if (editingId) {
        const { error } = await supabase
          .from("inventario_equipos")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;

        await logsService.log({
          tipo: "actualizacion",
          modulo: "equipos",
          descripcion: `Equipo actualizado: ${form.nombre}`,
          empresa_id: form.empresa_id,
          usuario_id: user?.id ?? null,
          metadata: { equipo_id: editingId, tipo: form.tipo },
        });

        toast.success("Equipo actualizado");
      } else {
        const { error } = await supabase
          .from("inventario_equipos")
          .insert(payload);
        if (error) throw error;

        await logsService.log({
          tipo: "creacion",
          modulo: "equipos",
          descripcion: `Equipo creado: ${form.nombre}`,
          empresa_id: form.empresa_id,
          usuario_id: user?.id ?? null,
          metadata: { tipo: form.tipo },
        });

        toast.success("Equipo agregado");
      }

      setDialogOpen(false);
      loadEquipos();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar equipo");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase
        .from("inventario_equipos")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;

      await logsService.log({
        tipo: "eliminacion",
        modulo: "equipos",
        descripcion: `Equipo eliminado: ${deleteTarget.nombre}`,
        empresa_id: deleteTarget.empresa_id,
        usuario_id: user?.id ?? null,
        metadata: { equipo_id: deleteTarget.id, tipo: deleteTarget.tipo },
      });

      toast.success("Equipo eliminado");
      setDeleteTarget(null);
      loadEquipos();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar equipo");
    }
  }

  // ── Render helpers ──

  function TipoBadge({ tipo }: { tipo: TipoEquipo }) {
    const cfg = TIPO_CONFIG[tipo] ?? TIPO_CONFIG.otro;
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className="h-3 w-3" />
        {cfg.label}
      </Badge>
    );
  }

  function EstadoBadge({ estado }: { estado: EstadoEquipo }) {
    const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.vigente;
    return (
      <Badge variant={cfg.variant} className={cfg.className}>
        {estado === "por_vencer" && <CalendarClock className="h-3 w-3 mr-1" />}
        {cfg.label}
      </Badge>
    );
  }

  // ── Render ──

  return (
    <div>
      <PageHeader
        title="Inventario de Equipos de Seguridad"
        description="Gestiona extintores, botiquines, camillas, EPP y otros equipos de seguridad."
        actions={
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Agregar equipo
          </Button>
        }
      />

      {/* Alert banner */}
      {needsAttention > 0 && (
        <Alert className="mb-6 border-yellow-300 bg-yellow-50">
          <ShieldAlert className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            {needsAttention} equipo{needsAttention !== 1 ? "s" : ""} requiere
            {needsAttention !== 1 ? "n" : ""} atencion
            {vencidos > 0 && porVencer > 0
              ? `: ${vencidos} vencido${vencidos !== 1 ? "s" : ""}, ${porVencer} por vencer`
              : vencidos > 0
              ? `: ${vencidos} vencido${vencidos !== 1 ? "s" : ""}`
              : `: ${porVencer} por vencer`}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total equipos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vigentes</CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{vigentes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Por vencer</CardTitle>
            <CalendarClock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{porVencer}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{vencidos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Company filter */}
      {(user?.role === "admin" || user?.role === "consultor") && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las empresas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.razon_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando equipos...</span>
            </div>
          ) : equipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No hay equipos registrados</p>
              <Button variant="link" onClick={openAdd} className="mt-1 text-sm">
                Agregar el primer equipo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {(user?.role === "admin" || user?.role === "consultor") && (
                      <TableHead>Empresa</TableHead>
                    )}
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Ubicacion</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Prox. Inspeccion</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedEquipos.map((eq) => (
                    <TableRow key={eq.id}>
                      {(user?.role === "admin" || user?.role === "consultor") && (
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {eq.empresa_razon_social ?? "—"}
                          </span>
                        </TableCell>
                      )}
                      <TableCell>
                        <TipoBadge tipo={eq.tipo} />
                      </TableCell>
                      <TableCell className="font-medium">{eq.nombre}</TableCell>
                      <TableCell>{eq.ubicacion ?? "—"}</TableCell>
                      <TableCell>{formatDate(eq.fecha_vencimiento)}</TableCell>
                      <TableCell>{formatDate(eq.fecha_proxima_inspeccion)}</TableCell>
                      <TableCell>
                        <EstadoBadge estado={eq.estado} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(eq)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger><TooltipContent>Editar</TooltipContent></Tooltip>
                          <Tooltip><TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(eq)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination currentPage={eqPage} totalPages={eqTotal} onPageChange={eqSetPage} totalItems={eqItems} pageSize={eqSize} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar equipo" : "Agregar equipo"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Empresa */}
            {(user?.role === "admin" || user?.role === "consultor") && (
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select
                  value={form.empresa_id}
                  onValueChange={(v) => updateForm("empresa_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona empresa" />
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

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => updateForm("tipo", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_CONFIG) as TipoEquipo[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_CONFIG[t].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => updateForm("nombre", e.target.value)}
                  placeholder="Ej: Extintor ABC 10lb"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Ubicacion */}
              <div className="space-y-2">
                <Label>Ubicacion</Label>
                <Input
                  value={form.ubicacion}
                  onChange={(e) => updateForm("ubicacion", e.target.value)}
                  placeholder="Ej: Piso 2, pasillo norte"
                />
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  value={form.marca}
                  onChange={(e) => updateForm("marca", e.target.value)}
                  placeholder="Ej: Kidde"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Serial */}
              <div className="space-y-2">
                <Label>Serial</Label>
                <Input
                  value={form.serial}
                  onChange={(e) => updateForm("serial", e.target.value)}
                  placeholder="Ej: SN-12345"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={form.estado}
                  onValueChange={(v) => updateForm("estado", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ESTADO_CONFIG) as EstadoEquipo[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {ESTADO_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Fecha adquisicion */}
              <div className="space-y-2">
                <Label>Fecha de adquisicion</Label>
                <Input
                  type="date"
                  value={form.fecha_adquisicion}
                  onChange={(e) => updateForm("fecha_adquisicion", e.target.value)}
                />
              </div>

              {/* Fecha vencimiento */}
              <div className="space-y-2">
                <Label>Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={(e) => updateForm("fecha_vencimiento", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Ultima inspeccion */}
              <div className="space-y-2">
                <Label>Ultima inspeccion</Label>
                <Input
                  type="date"
                  value={form.fecha_ultima_inspeccion}
                  onChange={(e) => updateForm("fecha_ultima_inspeccion", e.target.value)}
                />
              </div>

              {/* Proxima inspeccion */}
              <div className="space-y-2">
                <Label>Proxima inspeccion</Label>
                <Input
                  type="date"
                  value={form.fecha_proxima_inspeccion}
                  onChange={(e) => updateForm("fecha_proxima_inspeccion", e.target.value)}
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={form.notas}
                onChange={(e) => updateForm("notas", e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {editingId ? "Guardar cambios" : "Agregar equipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar equipo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el equipo{" "}
              <strong>{deleteTarget?.nombre}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
