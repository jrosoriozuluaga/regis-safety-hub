import type { MedicalExam } from "@/types/domain";

export const mockMedicalExams: MedicalExam[] = [
  { id: "m1", workerName: "Carlos Ramírez", document: "CC 1.020.345.678", recommendations: "Uso obligatorio de protección auditiva", restrictions: "Evitar exposición a ruido > 85 dB", date: "2025-04-22" },
  { id: "m2", workerName: "María Fernández", document: "CC 52.345.111", recommendations: "Pausas activas cada 2 horas", restrictions: "Restricción de carga > 15 kg", date: "2025-04-18" },
  { id: "m3", workerName: "Juan Pablo Ortiz", document: "CC 80.112.998", recommendations: "Control oftalmológico anual", restrictions: "Sin restricciones", date: "2025-04-15" },
  { id: "m4", workerName: "Lina Martínez", document: "CC 1.045.778.221", recommendations: "Ergonomía en puesto de trabajo", restrictions: "Evitar bipedestación prolongada", date: "2025-04-10" },
  { id: "m5", workerName: "Andrés Gómez", document: "CC 79.554.220", recommendations: "Vacunación tétanos", restrictions: "Sin restricciones", date: "2025-04-02" },
];
