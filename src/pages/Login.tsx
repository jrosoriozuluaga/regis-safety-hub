import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { Loader2, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/regis-logo.jpeg";

const schema = z.object({
  nit: z.string().trim().regex(/^\d{9,10}$/, "El NIT debe tener 9 o 10 dígitos"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [nit, setNit] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ nit?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ nit, password });
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as "nit" | "password"] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(parsed.data.nit, parsed.data.password);
      toast.success(`Bienvenido, ${user.companyName}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_50%)]" />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="Regis Colombia" className="h-12 w-12 rounded-md object-cover bg-white" />
          <div>
            <div className="text-xs uppercase tracking-widest opacity-70">Regis Colombia</div>
            <div className="text-lg font-semibold">SG-SST · Plataforma</div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            Gestiona tu Sistema de Seguridad y Salud en el Trabajo en un solo lugar.
          </h1>
          <p className="text-primary-foreground/80">
            PILA, exámenes médicos, matrices de riesgo, comités y planes de emergencia. Todo el cumplimiento de tu
            empresa, simplificado.
          </p>
        </div>
        <div className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Regis Colombia · Todos los derechos reservados
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <img src={logo} alt="Regis Colombia" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-semibold text-foreground">Regis Colombia</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa con el NIT de tu empresa y tu contraseña.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT de la empresa</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nit"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="900123456"
                  className="pl-9"
                  value={nit}
                  onChange={(e) => setNit(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  aria-invalid={!!errors.nit}
                />
              </div>
              {errors.nit && <p className="text-xs text-destructive">{errors.nit}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                Mantener sesión iniciada
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingresar"}
            </Button>
          </form>

          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cuentas de prueba</p>
            <p>Admin · NIT 900123456 · contraseña <code>regis2025</code></p>
            <p>Cliente · NIT 830111222 · contraseña <code>cliente2025</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
