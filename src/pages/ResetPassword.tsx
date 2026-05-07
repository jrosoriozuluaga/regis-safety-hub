import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/services/auth";
import { toast } from "sonner";
import logo from "@/assets/regis-logo.jpeg";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Las contraseñas no coinciden", path: ["confirm"] });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as "password" | "confirm"] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    await resetPassword(parsed.data.password);
    setLoading(false);
    toast.success("Contraseña actualizada. Inicia sesión.");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Regis Colombia" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-semibold text-foreground">Regis Colombia</span>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-[var(--shadow-card)] space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Nueva contraseña</h2>
            <p className="text-sm text-muted-foreground mt-1">Define una contraseña segura para tu cuenta.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  className="pl-9"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar contraseña"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
