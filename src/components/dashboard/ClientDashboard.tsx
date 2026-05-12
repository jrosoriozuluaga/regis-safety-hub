import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp, FileCheck, Shield, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "./CircularProgress";
import { cumplimientoService } from "@/services";
import type { CumplimientoEmpresa } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";

const cycleConfig = [
  { key: "puntaje_planear", label: "Planear", icon: FileCheck, color: "text-blue-600 bg-blue-50" },
  { key: "puntaje_hacer", label: "Hacer", icon: Activity, color: "text-emerald-600 bg-emerald-50" },
  { key: "puntaje_verificar", label: "Verificar", icon: Shield, color: "text-amber-600 bg-amber-50" },
  { key: "puntaje_actuar", label: "Actuar", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
] as const;

export function ClientDashboard() {
  const { user } = useAuth();
  const [cumplimiento, setCumplimiento] = useState<CumplimientoEmpresa | null>(null);

  useEffect(() => {
    if (user?.empresa_id) {
      cumplimientoService.getLatest(user.empresa_id).then(setCumplimiento);
    }
  }, [user]);

  const score = cumplimiento?.puntaje_total ?? 0;
  const statusText = score >= 86 ? "Excelente desempeño" : score >= 60 ? "Moderadamente aceptable" : score > 0 ? "Nivel crítico" : "Sin evaluación";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Tu cumplimiento SG-SST</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <CircularProgress value={score} size={220} />
            <div className="mt-6 text-center">
              <div className={`flex items-center justify-center gap-1.5 text-sm font-medium ${score >= 86 ? "text-green-600" : score >= 60 ? "text-amber-600" : score > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                <CheckCircle2 className="h-4 w-4" /> {statusText}
              </div>
              {cumplimiento && (
                <p className="text-xs text-muted-foreground mt-1">
                  Evaluación: {new Date(cumplimiento.fecha_evaluacion).toLocaleDateString("es-CO")} — Año {cumplimiento.anio}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Ciclo PHVA — Resolución 0312</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {cycleConfig.map(({ key, label, icon: Icon, color }) => {
              const val = cumplimiento ? (cumplimiento as any)[key] ?? 0 : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{val}%</span>
                  </div>
                  <Progress value={val} className="h-2" />
                </div>
              );
            })}
            {!cumplimiento && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Aún no hay evaluación de cumplimiento registrada para tu empresa.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
