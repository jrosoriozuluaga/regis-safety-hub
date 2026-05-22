import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Building2, Shield, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  consultor: "Consultor SST",
  cliente: "Cliente",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800",
  consultor: "bg-purple-100 text-purple-800",
  cliente: "bg-green-100 text-green-800",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada exitosamente");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Informacion de tu cuenta y configuracion personal."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Informacion de Cuenta
            </CardTitle>
            <CardDescription>Datos de tu usuario en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nombre</Label>
              <p className="text-sm font-medium">{user.nombre || "—"}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
              <p className="text-sm font-medium">{user.contactEmail || "—"}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Rol</Label>
              <Badge className={ROLE_COLORS[user.role] || ""}>{ROLE_LABELS[user.role] || user.role}</Badge>
            </div>
            {user.companyName && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Empresa</Label>
                <p className="text-sm font-medium">{user.companyName}</p>
              </div>
            )}
            {user.nit && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">NIT</Label>
                <p className="text-sm font-medium tabular-nums">{user.nit}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5 text-primary" />
              Seguridad
            </CardTitle>
            <CardDescription>Cambia tu contraseña de acceso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {changingPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimo 8 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword} disabled={saving} className="gap-2">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => { setChangingPassword(false); setNewPassword(""); setConfirmPassword(""); }}>
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="outline" onClick={() => setChangingPassword(true)} className="gap-2">
                <KeyRound className="h-4 w-4" />
                Cambiar contraseña
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
