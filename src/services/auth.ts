import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types/domain";

const SESSION_KEY = "regis.session";

export async function login(nit: string, password: string): Promise<UserProfile> {
  const input = nit.trim();
  let email: string;
  let nitValue = input;

  if (input.includes("@")) {
    email = input;
  } else {
    const normalizedNit = input.replace(/[-.\s]/g, "");
    const { data: empresa } = await supabase
      .from("empresas_cliente")
      .select("id, nit")
      .or(`nit.ilike.%${normalizedNit}%`)
      .limit(1)
      .single();

    if (!empresa) throw new Error("NIT no encontrado");

    nitValue = empresa.nit;

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("email")
      .eq("empresa_id", empresa.id)
      .limit(1)
      .single();

    if (!usuario) throw new Error("NIT o contraseña incorrectos");
    email = usuario.email;
  }

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authErr || !authData.user) {
    throw new Error("NIT o contraseña incorrectos");
  }

  const { data: profile } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, empresa_id, empresas_cliente(nit, razon_social)")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!profile) {
    throw new Error("Perfil de usuario no encontrado");
  }

  const empresaRaw = profile.empresas_cliente as unknown;
  const empresa = (Array.isArray(empresaRaw) ? empresaRaw[0] : empresaRaw) as { nit: string; razon_social: string } | null;
  const userProfile: UserProfile = {
    id: profile.id,
    nit: empresa?.nit || nitValue,
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

export async function requestReset(_nit: string, email: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function resetPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
