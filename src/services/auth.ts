import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/domain";

const SESSION_KEY = "regis.session";

export async function login(nit: string, password: string): Promise<UserProfile> {
  const { data: usuario, error: lookupErr } = await supabase
    .from("usuarios")
    .select("email")
    .eq("nit_empresa", nit.trim())
    .limit(1)
    .single();

  if (lookupErr || !usuario) {
    throw new Error("NIT o contraseña incorrectos");
  }

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: usuario.email,
    password,
  });

  if (authErr || !authData.user) {
    throw new Error("NIT o contraseña incorrectos");
  }

  const { data: profile } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, empresa_id, nit_empresa, empresas_cliente(razon_social)")
    .eq("auth_uid", authData.user.id)
    .single();

  if (!profile) {
    throw new Error("Perfil de usuario no encontrado");
  }

  const empresaRaw = profile.empresas_cliente as unknown;
  const empresa = (Array.isArray(empresaRaw) ? empresaRaw[0] : empresaRaw) as { razon_social: string } | null;
  const userProfile: UserProfile = {
    id: profile.id,
    nit: profile.nit_empresa || nit,
    companyName: empresa?.razon_social || profile.nombre,
    contactEmail: profile.email,
    role: profile.rol as UserProfile["role"],
    empresa_id: profile.empresa_id,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
  return userProfile;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  supabase.auth.signOut();
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function requestReset(nit: string, email: string): Promise<void> {
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("email")
    .eq("nit_empresa", nit.trim())
    .eq("email", email.trim().toLowerCase())
    .limit(1)
    .single();

  if (usuario) {
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  }
}

export async function resetPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
