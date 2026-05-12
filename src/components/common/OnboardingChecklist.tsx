import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Loader2,
  FileText,
  Stethoscope,
  ShieldAlert,
  Users,
  Siren,
  ClipboardCheck,
  HardHat,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CheckItem = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  done: boolean;
  count?: number;
};

type Props = {
  empresaId: string;
  empresaNombre?: string;
  compact?: boolean;
};

export function OnboardingChecklist({ empresaId, empresaNombre, compact }: Props) {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empresaId) return;
    let mounted = true;

    async function check() {
      setLoading(true);

      const [
        { count: trabajadoresCount },
        { count: pilaCount },
        { count: examenesCount },
        { count: matricesCount },
        { count: comitesCount },
        { count: planesCount },
        { count: cumplimientoCount },
      ] = await Promise.all([
        supabase.from("trabajadores").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId).eq("activo", true),
        supabase.from("pila_records").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
        supabase.from("examenes_medicos").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
        supabase.from("matrices_riesgo").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
        supabase.from("comites").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
        supabase.from("planes_emergencia").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
        supabase.from("cumplimiento_empresa").select("*", { count: "exact", head: true }).eq("empresa_id", empresaId),
      ]);

      if (!mounted) return;

      setItems([
        {
          id: "trabajadores",
          label: "Registrar trabajadores",
          description: "Cargar la nómina de trabajadores de la empresa",
          icon: HardHat,
          done: (trabajadoresCount ?? 0) > 0,
          count: trabajadoresCount ?? 0,
        },
        {
          id: "pila",
          label: "Cargar primera PILA",
          description: "Subir al menos una planilla PILA",
          icon: FileText,
          done: (pilaCount ?? 0) > 0,
          count: pilaCount ?? 0,
        },
        {
          id: "examenes",
          label: "Procesar exámenes médicos",
          description: "Cargar y procesar al menos un examen médico",
          icon: Stethoscope,
          done: (examenesCount ?? 0) > 0,
          count: examenesCount ?? 0,
        },
        {
          id: "matrices",
          label: "Generar matriz de riesgo",
          description: "Crear la matriz GTC 45 según código CIIU",
          icon: ShieldAlert,
          done: (matricesCount ?? 0) > 0,
          count: matricesCount ?? 0,
        },
        {
          id: "comites",
          label: "Configurar comités",
          description: "Crear al menos un comité (COPASST o Convivencia)",
          icon: Users,
          done: (comitesCount ?? 0) > 0,
          count: comitesCount ?? 0,
        },
        {
          id: "emergencias",
          label: "Crear plan de emergencias",
          description: "Generar el análisis de vulnerabilidad",
          icon: Siren,
          done: (planesCount ?? 0) > 0,
          count: planesCount ?? 0,
        },
        {
          id: "cumplimiento",
          label: "Evaluar cumplimiento 0312",
          description: "Completar la evaluación de estándares mínimos",
          icon: ClipboardCheck,
          done: (cumplimientoCount ?? 0) > 0,
          count: cumplimientoCount ?? 0,
        },
      ]);

      setLoading(false);
    }

    check();
    return () => { mounted = false; };
  }, [empresaId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              {compact && empresaNombre ? empresaNombre : `Onboarding${empresaNombre ? ` — ${empresaNombre}` : ""}`}
            </CardTitle>
            {!compact && (
              <CardDescription className="mt-1">
                Progreso de configuración inicial del SG-SST
              </CardDescription>
            )}
          </div>
          <Badge variant={pct === 100 ? "default" : "secondary"} className="text-xs">
            {doneCount}/{totalCount} ({pct}%)
          </Badge>
        </div>
        <Progress value={pct} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className={compact ? "pt-0" : undefined}>
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  item.done ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted/30"
                )}
              >
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", item.done ? "text-emerald-600" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-sm font-medium", item.done && "line-through text-muted-foreground")}>
                    {item.label}
                  </span>
                  {!compact && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {item.count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
