import type { PilaRecord } from "@/types/domain";

export const mockPila: PilaRecord[] = [
  { id: "p1", companyId: "c1", companyName: "Nike Colombia", month: "Mayo 2025", status: "uploaded", uploadedAt: "2025-05-08" },
  { id: "p2", companyId: "c2", companyName: "Ferrero", month: "Mayo 2025", status: "pending" },
  { id: "p3", companyId: "c3", companyName: "Danone", month: "Mayo 2025", status: "overdue" },
  { id: "p4", companyId: "c4", companyName: "Bavaria", month: "Mayo 2025", status: "uploaded", uploadedAt: "2025-05-04" },
  { id: "p5", companyId: "c5", companyName: "Postobón", month: "Abril 2025", status: "uploaded", uploadedAt: "2025-04-09" },
  { id: "p6", companyId: "c6", companyName: "Alpina", month: "Mayo 2025", status: "pending" },
  { id: "p7", companyId: "c7", companyName: "Crepes & Waffles", month: "Abril 2025", status: "overdue" },
  { id: "p8", companyId: "c8", companyName: "Grupo Éxito", month: "Mayo 2025", status: "uploaded", uploadedAt: "2025-05-06" },
];
