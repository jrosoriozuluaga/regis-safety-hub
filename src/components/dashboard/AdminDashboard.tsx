import { useEffect, useState } from "react";
import { Building2, TrendingUp, Users, ShieldCheck, FileText, Loader2, Send, AlertTriangle, Bell, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { empresasService, cumplimientoService, alertsService, pilaService } from "@/services";
import type { AlertItem } from "@/services";
import { OnboardingChecklist } from "@/components/common/OnboardingChecklist";
import { PageSkeleton } from "@/components/common/Skeletons";
import { supabase } from "@/lib/supabase";
import type { Empresa, PilaRecord } from "@/types/domain";

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: "primary" | "success" }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${accent === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}


function BitacoraButton() {
  const [loading, setLoading] = useState(false);
  const [lastReport, setLastReport] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-bitacora", {
        body: {},
      });
      if (error) throw error;
      if (data?.full_reports?.length) {
        const combined = data.full_reports.map((r: any) => r.report).join("\n\n" + "=".repeat(60) + "\n\n");
        setLastReport(combined);
        toast.success(`Bitácora generada para ${data.count} empresa(s)`);
      } else {
        toast.info("No hay datos para generar la bitácora");
      }
    } catch (err: any) {
      toast.error(err.message || "Error al generar bitácora");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          Generar Bitácora Mensual
        </Button>
        {lastReport && (
          <Button variant="ghost" size="sm" onClick={() => {
            const printW = window.open("", "_blank");
            if (!printW) return;
            printW.document.write(`<html><head><title>Bitácora Mensual</title>
<style>body{font-family:monospace;white-space:pre-wrap;margin:40px;font-size:12px;line-height:1.5}@media print{@page{margin:20mm}}</style>
</head><body>${lastReport.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body></html>`);
            printW.document.close();
            setTimeout(() => printW.print(), 300);
          }}>
            Imprimir
          </Button>
        )}
      </div>
      {lastReport && (
        <pre className="text-xs bg-muted/50 rounded-lg p-4 max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono">
          {lastReport}
        </pre>
      )}
    </div>
  );
}

function WeeklySummaryButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [mode, setMode] = useState<"monday" | "friday">("monday");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-summary", {
        body: { mode },
      });
      if (error) throw error;
      if (data?.summary) {
        setSummary(data.summary);
        toast.success(`Resumen semanal (${mode === "monday" ? "pendientes" : "balance"}) generado`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al generar resumen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Resumen Semanal
        </Button>
        <select
          className="text-xs border rounded px-2 py-1.5"
          value={mode}
          onChange={(e) => setMode(e.target.value as "monday" | "friday")}
        >
          <option value="monday">Lunes (pendientes)</option>
          <option value="friday">Viernes (balance)</option>
        </select>
      </div>
      {summary && (
        <pre className="text-xs bg-muted/50 rounded-lg p-4 max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono">
          {summary}
        </pre>
      )}
    </div>
  );
}

const SEVERITY_CONFIG = {
  alta: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  media: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  baja: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
} as const;

export function AdminDashboard() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [avgCompliance, setAvgCompliance] = useState(0);
  const [complianceData, setComplianceData] = useState<{ name: string; score: number }[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [pilaStats, setPilaStats] = useState<{ total: number; aprobadas: number; pendientes: number; vencidas: number; pct: number } | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      empresasService.list().then(setEmpresas),
      empresasService.compliance().then((rows) => {
        if (rows.length > 0) {
          const avg = Math.round(rows.reduce((s, r) => s + r.puntaje_total, 0) / rows.length);
          setAvgCompliance(avg);
          setComplianceData(rows.map((r) => ({
            name: r.empresa?.razon_social?.split(" ").slice(0, 2).join(" ") || "Empresa",
            score: r.puntaje_total,
          })));
        }
      }),
      alertsService.getAlerts().then((a) => setAlerts(a.slice(0, 8))),
      pilaService.listRecords().then((records) => {
        const stats = pilaService.getStats(records);
        setPilaStats(stats);
      }),
    ]).finally(() => setDashLoading(false));
  }, []);

  const totalWorkers = empresas.reduce((s, e) => s + e.num_trabajadores, 0);

  if (dashLoading) return <PageSkeleton kpis={4} columns={4} rows={5} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Building2} label="Empresas clientes" value={String(empresas.length)} />
        <Kpi icon={Users} label="Trabajadores cubiertos" value={totalWorkers.toLocaleString("es-CO")} />
        <Kpi icon={TrendingUp} label="Cumplimiento promedio" value={avgCompliance ? `${avgCompliance}%` : "—"} accent="success" />
        <Kpi icon={FileText} label="PILA aprobadas" value={pilaStats ? `${pilaStats.pct}%` : "—"} accent="success" />
      </div>

      {/* Alerts & PILA Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Alertas activas
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px]">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Sin alertas pendientes
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {alerts.map((a) => {
                  const cfg = SEVERITY_CONFIG[a.severidad];
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs ${cfg.color}`}>
                      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium">{a.titulo}</div>
                        <div className="opacity-75 truncate">{a.descripcion}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {pilaStats && pilaStats.total > 0 && (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Estado PILA — Todas las empresas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Aprobadas", value: pilaStats.aprobadas, color: "text-green-600" },
                  { label: "Pendientes", value: pilaStats.pendientes, color: "text-amber-600" },
                  { label: "Vencidas", value: pilaStats.vencidas, color: "text-red-600" },
                  { label: "Total", value: pilaStats.total, color: "text-foreground" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div className={`text-xl font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <Progress value={pilaStats.pct} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                {pilaStats.pct}% cumplimiento PILA
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {complianceData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Cumplimiento por empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6 justify-center" style={{ height: 240 }}>
              {complianceData.map((d, i) => {
                const barColors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];
                const color = barColors[i % barColors.length];
                return (
                  <div key={d.name} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                    <span className="text-sm font-bold tabular-nums">{d.score}%</span>
                    <div className="w-full bg-muted rounded-t-md relative" style={{ height: 200 }}>
                      <div
                        className="w-full rounded-t-md transition-all duration-700 absolute bottom-0 left-0"
                        style={{
                          height: `${d.score}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground text-center leading-tight">{d.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {empresas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Progreso de Onboarding</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {empresas.map((e) => (
              <OnboardingChecklist key={e.id} empresaId={e.id} empresaNombre={e.razon_social} compact />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <BitacoraButton />
            <WeeklySummaryButton />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Empresas clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CIIU</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead className="text-right">Trabajadores</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Capítulo 0312</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.razon_social}</TableCell>
                  <TableCell className="text-muted-foreground">{e.ciiu_codigo}</TableCell>
                  <TableCell className="text-muted-foreground">{e.ciudad}</TableCell>
                  <TableCell className="text-right tabular-nums">{e.num_trabajadores}</TableCell>
                  <TableCell>{e.nivel_riesgo_arl}</TableCell>
                  <TableCell>{e.capitulo_0312}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
