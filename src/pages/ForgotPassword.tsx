import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestReset } from "@/services/auth";
import logo from "@/assets/regis-logo.jpeg";

const schema = z.object({
  nit: z.string().trim().regex(/^\d{9,10}$/, "El NIT debe tener 9 o 10 dígitos"),
  email: z.string().trim().email("Correo inválido").max(255),
});

export default function ForgotPassword() {
  const [nit, setNit] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ nit?: string; email?: string }>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ nit, email });
    if (!parsed.success) {
      const fe: typeof errors = {};
      parsed.error.issues.forEach((i) => (fe[i.path[0] as "nit" | "email"] = i.message));
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    await requestReset(parsed.data.nit, parsed.data.email);
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Regis Colombia" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-semibold text-foreground">Regis Colombia</span>
        </div>

        {sent ? (
          <div className="rounded-lg border bg-card p-8 shadow-[var(--shadow-card)] space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Revisa tu correo</h2>
            <p className="text-sm text-muted-foreground">
              Si el NIT y el correo coinciden con una cuenta registrada, te enviaremos un enlace para restablecer tu
              contraseña en los próximos minutos.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login"><ArrowLeft className="h-4 w-4 mr-2" />Volver al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 shadow-[var(--shadow-card)] space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recuperar contraseña</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ingresa el NIT de tu empresa y el correo asociado a la cuenta. Te enviaremos un enlace para
                restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="nit">NIT de la empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nit"
                    inputMode="numeric"
                    placeholder="900123456"
                    className="pl-9"
                    value={nit}
                    onChange={(e) => setNit(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                  />
                </div>
                {errors.nit && <p className="text-xs text-destructive">{errors.nit}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar enlace de recuperación"}
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" /> Volver al inicio de sesión
              </Link>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
