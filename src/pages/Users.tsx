import { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Pencil,
  Power,
  PowerOff,
  Search,
  Loader2,
  Save,
  Shield,
  ShieldCheck,
  UserCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { TablePagination, usePagination } from "@/components/common/TablePagination";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { empresasService, usuariosService, logsService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa } from "@/types/domain";
import type { Usuario } from "@/services";

/* ─── constants ─── */

const ROLES = [
  { value: "admin", label: "Administrador", desc: "Acceso total al sistema", icon: Shield, color: "text-red-600" },
  { value: "consultor", label: "Consultor", desc: "Gestiona todas las empresas", icon: ShieldCheck, color: "text-blue-600" },
  { value: "cliente", label: "Cliente", desc: "Ve solo su empresa", icon: UserCheck, color: "text-emerald-600" },
] as const;

type UserForm = {
  nombre: string;
  email: string;
  rol: "admin" | "consultor" | "cliente";
  empresa_id: string;
};

const emptyForm: UserForm = {
  nombre: "",
  email: "",
  rol: "cliente",
  empresa_id: "",
};

/* ─── component ─── */

export default function Users() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);

  // single user dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUser, setResetUser] = useState<Usuario | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const isAdmin = user?.role === "admin";
  const isAdminOrConsultor = user?.role === "admin" || user?.role === "consultor";

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, e] = await Promise.all([
        usuariosService.list(),
        empresasService.listAll(),
      ]);
      setUsuarios(u);
      setEmpresas(e);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrConsultor) loadData();
  }, [isAdminOrConsultor]);

  const filtered = usuarios.filter((u) => {
    if (!showInactive && !u.activo) return false;
    if (roleFilter !== "all" && u.rol !== roleFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.razon_social || "").toLowerCase().includes(q)
    );
  });
  const { paginatedItems: pagedUsers, currentPage: uPage, totalPages: uTotal, setCurrentPage: uSetPage, totalItems: uItems, pageSize: uSize } = usePagination(filtered, 10);

  /* ─── single user handlers ─── */

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPassword("");
    setDialogOpen(true);
  };

  const openEdit = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setForm({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      rol: usuario.rol,
      empresa_id: usuario.empresa_id || "",
    });
    setPassword("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.email) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    if (form.rol === "cliente" && !form.empresa_id) {
      toast.error("Los usuarios tipo cliente deben tener una empresa asignada");
      return;
    }
    if (!editingId && !password) {
      toast.error("La contraseña es obligatoria para nuevos usuarios");
      return;
    }
    if (!editingId && password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update profile in usuarios table
        await usuariosService.update(editingId, {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          empresa_id: form.rol === "cliente" ? form.empresa_id : null,
        });
        logsService.log({ tipo: "actualizar", modulo: "usuarios", descripcion: `Usuario actualizado: ${form.nombre} (${form.rol})`, usuario_id: user?.id });
        toast.success("Usuario actualizado");
      } else {
        // 1. Create auth user via Supabase admin
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email: form.email,
          password,
          email_confirm: true,
        });

        if (authErr) {
          // Fallback: try signUp if admin API not available
          if (authErr.message?.includes("not authorized") || authErr.status === 403) {
            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: form.email,
              password,
            });
            if (signUpErr) throw signUpErr;

            await usuariosService.create({
              auth_user_id: signUpData.user?.id || null,
              email: form.email,
              nombre: form.nombre,
              rol: form.rol,
              empresa_id: form.rol === "cliente" ? form.empresa_id : null,
              activo: true,
            });
          } else {
            throw authErr;
          }
        } else {
          await usuariosService.create({
            auth_user_id: authData.user?.id || null,
            email: form.email,
            nombre: form.nombre,
            rol: form.rol,
            empresa_id: form.rol === "cliente" ? form.empresa_id : null,
            activo: true,
          });
        }
        logsService.log({ tipo: "crear", modulo: "usuarios", descripcion: `Usuario creado: ${form.nombre} (${form.email}, ${form.rol})`, usuario_id: user?.id });
        toast.success("Usuario creado exitosamente");
      }
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (usuario: Usuario) => {
    // Don't allow deactivating yourself
    if (usuario.id === user?.id) {
      toast.error("No puedes desactivar tu propia cuenta");
      return;
    }
    try {
      if (usuario.activo) {
        await usuariosService.deactivate(usuario.id);
        logsService.log({ tipo: "desactivar", modulo: "usuarios", descripcion: `Usuario desactivado: ${usuario.nombre}`, usuario_id: user?.id });
        toast.success(`${usuario.nombre} desactivado`);
      } else {
        await usuariosService.activate(usuario.id);
        logsService.log({ tipo: "activar", modulo: "usuarios", descripcion: `Usuario reactivado: ${usuario.nombre}`, usuario_id: user?.id });
        toast.success(`${usuario.nombre} reactivado`);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar estado");
    }
  };

  const openResetPassword = (usuario: Usuario) => {
    setResetUser(usuario);
    setNewPassword("");
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetUser?.auth_user_id) {
      toast.error("Este usuario no tiene cuenta de autenticación vinculada");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setResetting(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(resetUser.auth_user_id, {
        password: newPassword,
      });
      if (error) {
        // Fallback: send reset email instead
        if (error.message?.includes("not authorized") || error.status === 403) {
          await supabase.auth.resetPasswordForEmail(resetUser.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          toast.success(`Email de recuperación enviado a ${resetUser.email}`);
        } else {
          throw error;
        }
      } else {
        toast.success("Contraseña actualizada exitosamente");
      }
      setResetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar contraseña");
    } finally {
      setResetting(false);
    }
  };

  const updateField = (field: keyof UserForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ─── guard ─── */

  if (!isAdminOrConsultor) {
    return (
      <div>
        <PageHeader title="Usuarios" description="No tienes permisos para gestionar usuarios." />
      </div>
    );
  }

  const adminCount = usuarios.filter((u) => u.rol === "admin" && u.activo).length;
  const consultorCount = usuarios.filter((u) => u.rol === "consultor" && u.activo).length;
  const clienteCount = usuarios.filter((u) => u.rol === "cliente" && u.activo).length;

  const getRoleBadge = (rol: string) => {
    const r = ROLES.find((r) => r.value === rol);
    if (!r) return <Badge variant="secondary">{rol}</Badge>;
    const Icon = r.icon;
    return (
      <Badge
        variant={rol === "admin" ? "destructive" : rol === "consultor" ? "default" : "secondary"}
        className="gap-1"
      >
        <Icon className="h-3 w-3" /> {r.label}
      </Badge>
    );
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra los usuarios del sistema, asigna roles y permisos por empresa."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{usuarios.filter((u) => u.activo).length}</div>
            <div className="text-xs text-muted-foreground mt-1">Usuarios Activos</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-600">{adminCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Administradores</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{consultorCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Consultores</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{clienteCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Clientes</div>
          </CardContent>
        </Card>
      </div>

      {/* User table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCog className="h-4 w-4" /> Usuarios del Sistema
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-56"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showInactive ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? "Ocultar inactivos" : "Mostrar inactivos"}
              </Button>
              {isAdmin && (
                <Button size="sm" onClick={openNew} className="gap-1">
                  <Plus className="h-4 w-4" /> Nuevo Usuario
                </Button>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Auth</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
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
                      {search || roleFilter !== "all" ? "Sin resultados." : "No hay usuarios registrados."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedUsers.map((u) => (
                    <TableRow key={u.id} className={!u.activo ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{u.nombre}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell>{getRoleBadge(u.rol)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.razon_social || (u.rol !== "cliente" ? <span className="italic">N/A</span> : <span className="text-amber-600">Sin asignar</span>)}
                      </TableCell>
                      <TableCell>
                        {u.auth_user_id ? (
                          <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-200">
                            <KeyRound className="h-3 w-3" /> Vinculado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground">
                            Sin auth
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.activo ? "default" : "secondary"}>
                          {u.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Editar">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {u.auth_user_id && (
                                <Button variant="ghost" size="icon" onClick={() => openResetPassword(u)} title="Cambiar contraseña">
                                  <KeyRound className="h-4 w-4 text-amber-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleActive(u)}
                                title={u.activo ? "Desactivar" : "Reactivar"}
                              >
                                {u.activo ? (
                                  <PowerOff className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Power className="h-4 w-4 text-emerald-600" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination currentPage={uPage} totalPages={uTotal} onPageChange={uSetPage} totalItems={uItems} pageSize={uSize} />
          </div>
        </CardContent>
      </Card>

      {/* Permissions reference */}
      <Card className="shadow-card mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Matriz de Permisos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1"><Shield className="h-3 w-3 text-red-600" /> Admin</div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1"><ShieldCheck className="h-3 w-3 text-blue-600" /> Consultor</div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1"><UserCheck className="h-3 w-3 text-emerald-600" /> Cliente</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { mod: "Dashboard", admin: "Todas las empresas", consultor: "Todas las empresas", cliente: "Solo su empresa" },
                  { mod: "PILA", admin: "CRUD + envío", consultor: "CRUD + envío", cliente: "Solo lectura" },
                  { mod: "Exámenes Médicos", admin: "CRUD + IA", consultor: "CRUD + IA", cliente: "Solo lectura" },
                  { mod: "Matrices de Riesgo", admin: "Generar + exportar", consultor: "Generar + exportar", cliente: "Solo lectura" },
                  { mod: "Comités", admin: "Generar actas", consultor: "Generar actas", cliente: "Solo lectura" },
                  { mod: "Planes de Emergencia", admin: "Transcribir + analizar", consultor: "Transcribir + analizar", cliente: "Solo lectura" },
                  { mod: "Cumplimiento 0312", admin: "Evaluar + guardar", consultor: "Evaluar + guardar", cliente: "Solo lectura" },
                  { mod: "Gestión Empresas", admin: "CRUD completo", consultor: "CRUD completo", cliente: "Sin acceso" },
                  { mod: "Gestión Usuarios", admin: "CRUD completo", consultor: "Solo lectura", cliente: "Sin acceso" },
                ].map((row) => (
                  <TableRow key={row.mod}>
                    <TableCell className="font-medium text-sm">{row.mod}</TableCell>
                    <TableCell className="text-center text-xs">{row.admin}</TableCell>
                    <TableCell className="text-center text-xs">{row.consultor}</TableCell>
                    <TableCell className="text-center text-xs">
                      <span className={row.cliente === "Sin acceso" ? "text-red-500" : ""}>{row.cliente}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Create/Edit user dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifica los datos y permisos del usuario." : "Crea un nuevo usuario con acceso al sistema."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="juan@empresa.com"
                disabled={!!editingId}
              />
              {editingId && <p className="text-[11px] text-muted-foreground">El email no se puede cambiar después de creado.</p>}
            </div>

            {!editingId && (
              <div className="space-y-2">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select value={form.rol} onValueChange={(v) => updateField("rol", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    return (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${r.color}`} />
                          <span>{r.label}</span>
                          <span className="text-muted-foreground text-[11px]">— {r.desc}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {form.rol === "cliente" && (
              <div className="space-y-2">
                <Label>Empresa *</Label>
                <Select value={form.empresa_id} onValueChange={(v) => updateField("empresa_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.filter((e) => e.activo).map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.razon_social} — {e.nit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">El usuario solo podrá ver datos de esta empresa.</p>
              </div>
            )}

            {(form.rol === "admin" || form.rol === "consultor") && (
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                {form.rol === "admin"
                  ? "Los administradores tienen acceso total: pueden gestionar usuarios, empresas y todos los módulos."
                  : "Los consultores pueden gestionar todas las empresas y sus módulos, pero no pueden crear ni eliminar usuarios."}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Reset password dialog ─── */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Cambiar Contraseña
            </DialogTitle>
            <DialogDescription>
              {resetUser?.nombre} ({resetUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={resetting} className="gap-2">
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {resetting ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
