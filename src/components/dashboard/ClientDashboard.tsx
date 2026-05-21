import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp, FileCheck, Shield, Activity, FileText, AlertTriangle, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "./CircularProgress";
import { cumplimientoService, pilaService, empresasService } from "@/services";
import type { CumplimientoEmpresa, PilaRecord, Empresa } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";

const cycleConfig = [
  { key: "puntaje_planear", label: "Planear", icon: FileCheck, color: "text-blue-600 bg-blue-50" },
  { key: "puntaje_hacer", label: "Hacer", icon: Activity, color: "text-emerald-600 bg-emerald-50" },
  { key: "puntaje_verificar", label: "Verificar", icon: Shield, color: "text-amber-600 bg-amber-50" },
  { key: "puntaje_actuar", label: "Actuar", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
] as const;

export function ClientDashboard({ isPreview = false }: { isPreview?: boolean }) {
  const { user } = useAuth();
  const [cumplimiento, setCumplimiento] = useState<CumplimientoEmpresa | null>(null);
  const [pilaStats, setPilaStats] = useState<{ total: number; aprobadas: number; pendientes: number; vencidas: number; pct: number } | null>(null);

  // Preview mode: admin selects a company to preview
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");

  useEffect(() => {
    if (isPreview) {
      empresasService.list().then((list) => {
        setEmpresas(list.filter((e) => e.activo));
        if (list.length > 0 && !selectedEmpresaId) setSelectedEmpresaId(list[0].id);
      });
    }
  }, [isPreview]);

  const empresaId = isPreview ? selectedEmpresaId : user?.empresa_id;
  const empresaName = isPreview ? empresas.find((e) => e.id === selectedEmpresaId)?.razon_social : undefined;

  useEffect(() => {
    setCumplimiento(null);
    setPilaStats(null);
    if (empresaId) {
      cumplimientoService.getLatest(empresaId).then(setCumplimiento);
      pilaService.listRecords(empresaId).then((records) => {
        const stats = pilaService.getStats(records);
        setPilaStats(stats);
      });
    }
  }, [empresaId]);

  const score = cumplimiento?.puntaje_total ?? 0;
  const statusText = score >= 86 ? "Excelente desempeño" : score >= 60 ? "Moderadamente aceptable" : score > 0 ? "Nivel crítico" : "Sin evaluación";

  if (isPreview && !selectedEmpresaId) {
    return (
      <EmptyState
        icon={Building2}
        title="Vista previa de cliente"
        description="Cargando empresas..."
      />
    );
  }

  return (
    <div className="space-y-6">
      {isPreview && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-3 flex items-center gap-4">
            <Building2 className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Vista previa: así ve el cliente su panel</p>
              <p className="text-xs text-amber-600">Selecciona una empresa para simular su vista</p>
            </div>
            <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
              <SelectTrigger className="w-64 bg-white">
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

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

      {/* PILA Status for client */}
      {pilaStats && pilaStats.total > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Estado de Planillas PILA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <Progress value={pilaStats.pct} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{pilaStats.pct}% de planillas aprobadas</p>
              </div>
              <div className="flex gap-3">
                {pilaStats.aprobadas > 0 && (
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {pilaStats.aprobadas} aprobadas
                  </Badge>
                )}
                {pilaStats.pendientes > 0 && (
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 gap-1">
                    <Clock className="h-3 w-3" /> {pilaStats.pendientes} pendientes
                  </Badge>
                )}
                {pilaStats.vencidas > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" /> {pilaStats.vencidas} vencidas
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
