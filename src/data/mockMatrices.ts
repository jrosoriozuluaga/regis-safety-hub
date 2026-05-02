import type { RiskMatrix } from "@/types/domain";

export const mockMatrices: RiskMatrix[] = [
  { id: "r1", ciiu: "4711", description: "Comercio al por menor en establecimientos no especializados", generatedAt: "2025-04-28" },
  { id: "r2", ciiu: "1081", description: "Elaboración de productos de panadería", generatedAt: "2025-04-15" },
  { id: "r3", ciiu: "4321", description: "Instalaciones eléctricas", generatedAt: "2025-03-30" },
  { id: "r4", ciiu: "5611", description: "Expendio a la mesa de comidas preparadas", generatedAt: "2025-03-12" },
];
