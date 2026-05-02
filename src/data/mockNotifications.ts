import type { Notification, PendingAction } from "@/types/domain";

export const mockNotifications: Notification[] = [
  { id: "n1", title: "PILA pendiente", description: "Ferrero — Mayo 2025", time: "Hace 2h", unread: true },
  { id: "n2", title: "Examen médico procesado", description: "Carlos Ramírez", time: "Ayer", unread: true },
  { id: "n3", title: "Matriz GTC 45 lista", description: "CIIU 4711", time: "Hace 3 días", unread: false },
];

export const mockPendingActions: PendingAction[] = [
  { id: "a1", title: "Cargar PILA de Mayo", due: "Vence en 3 días", priority: "high" },
  { id: "a2", title: "Actualizar matriz de riesgos", due: "Vence en 7 días", priority: "medium" },
  { id: "a3", title: "Programar reunión COPASST", due: "Este mes", priority: "medium" },
  { id: "a4", title: "Subir exámenes médicos pendientes (3)", due: "Vence en 10 días", priority: "low" },
];
