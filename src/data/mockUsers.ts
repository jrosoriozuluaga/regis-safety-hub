import { UserProfile } from "@/types/domain";

// Mock credentials store. Replace with real backend (Supabase) by editing src/services/auth.ts only.
export type MockUser = UserProfile & { password: string };

export const mockUsers: MockUser[] = [
  {
    nit: "900123456",
    password: "regis2025",
    companyName: "Regis Colombia",
    contactEmail: "admin@regiscolombia.com",
    role: "admin",
  },
  {
    nit: "830111222",
    password: "cliente2025",
    companyName: "Constructora Andina S.A.S.",
    contactEmail: "gerencia@andina.co",
    role: "client",
  },
  {
    nit: "901555888",
    password: "demo2025",
    companyName: "Logística del Valle Ltda.",
    contactEmail: "rrhh@logvalle.co",
    role: "client",
  },
];
