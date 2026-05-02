// Single seam for authentication. Swap localStorage logic with Supabase calls
// (supabase.auth.signInWithPassword, resetPasswordForEmail, updateUser) without
// touching pages or components.
import { mockUsers } from "@/data/mockUsers";
import { UserProfile } from "@/types/domain";

const SESSION_KEY = "regis.session";

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function login(nit: string, password: string): Promise<UserProfile> {
  const match = mockUsers.find((u) => u.nit === nit.trim() && u.password === password);
  if (!match) {
    await delay(null, 300);
    throw new Error("NIT o contraseña incorrectos");
  }
  const { password: _pw, ...profile } = match;
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  return delay(profile);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
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
  // Mock: always succeed (do not reveal whether NIT/email match — security best practice).
  await delay(null, 600);
  const match = mockUsers.find(
    (u) => u.nit === nit.trim() && u.contactEmail.toLowerCase() === email.trim().toLowerCase(),
  );
  if (match) {
    // Would trigger a real email here.
    console.info("[mock] reset link would be sent to", email);
  }
}

export async function resetPassword(_token: string, _newPassword: string): Promise<void> {
  await delay(null, 500);
  // No-op in mock.
}
