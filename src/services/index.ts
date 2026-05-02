/**
 * Service layer — swap mock data for real backend (Supabase, REST, etc.) here.
 * Pages and components must NEVER import from `@/data/*` directly.
 *
 * To wire to a backend later:
 *   1. Replace each function body with a real call (keep the signature).
 *   2. Delete `src/data/*` once nothing imports from it.
 */
import { mockCompanies } from "@/data/mockCompanies";
import { mockPila } from "@/data/mockPila";
import { mockMedicalExams } from "@/data/mockMedicalExams";
import { mockMatrices } from "@/data/mockMatrices";
import { mockCommitteeMembers } from "@/data/mockCommittee";
import { mockNotifications, mockPendingActions } from "@/data/mockNotifications";

const wait = <T>(value: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(value), ms));

export const companiesService = {
  list: () => wait(mockCompanies),
  averageCompliance: async () => {
    const items = await wait(mockCompanies);
    return Math.round(items.reduce((s, c) => s + c.compliance, 0) / items.length);
  },
};

export const pilaService = {
  list: () => wait(mockPila),
  upload: async (_file: File) => wait({ ok: true }),
};

export const medicalExamsService = {
  list: () => wait(mockMedicalExams),
  upload: async (_file: File) => wait({ ok: true }),
};

export const matricesService = {
  list: () => wait(mockMatrices),
  generate: async (_ciiu: string) => wait({ ok: true }),
};

export const committeeService = {
  members: () => wait(mockCommitteeMembers),
  create: async (_payload: unknown) => wait({ ok: true }),
};

export const emergencyService = {
  transcribe: async (_blob?: Blob) =>
    wait(
      "PLAN DE EMERGENCIA TRANSCRITO\n\n" +
        "1. Identificación de amenazas: incendio en zona de almacenamiento, sismo, fuga de gas.\n" +
        "2. Brigadas conformadas: primeros auxilios, evacuación y contraincendios.\n" +
        "3. Rutas de evacuación señalizadas hacia punto de encuentro en parqueadero norte.\n" +
        "4. Capacitación trimestral del personal y simulacros semestrales.\n" +
        "5. Equipos: 12 extintores ABC, 4 camillas, botiquines en cada piso.\n\n" +
        "Clasificación AI: Plan Operativo de Emergencias (POE) — cumplimiento parcial Resolución 0312/2019."
    ),
};

export const notificationsService = {
  list: () => wait(mockNotifications),
  pendingActions: () => wait(mockPendingActions),
};
