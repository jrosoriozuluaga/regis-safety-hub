import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  AlertTriangle,
  DollarSign,
  Clock,
  Building2,
  TrendingDown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { supabase } from "@/lib/supabase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ModuleCount = { modulo: string; count: number };
type EstadoCount = { estado: string; count: number };
type CumplimientoRow = {
  empresa_id: string;
  puntaje_total: number;
  fecha_evaluacion: string;
  empresa_nombre?: string;
};
type RecentLog = {
  id: string;
  tipo: string;
  modulo: string;
  descripcion: string;
  created_at: string;
  usuario_nombre?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  cargada: "bg-blue-100 text-blue-800",
  cargado: "bg-blue-100 text-blue-800",
  validado: "bg-purple-100 text-purple-800",
  validada: "bg-purple-100 text-purple-800",
  aprobado: "bg-green-100 text-green-800",
  aprobada: "bg-green-100 text-green-800",
  vencida: "bg-red-100 text-red-800",
  vigente: "bg-teal-100 text-teal-800",
};

/* Cost estimates per invocation */
const COST_PER_CALL: Record<string, number> = {
  examenes: 0.02, // Claude Vision
  emergencias: 0.01, // Whisper + Claude
  comites: 0.01, // Claude text
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Observability() {
  const [loading, setLoading] = useState(true);

  /* Activity stats */
  const [activity24h, setActivity24h] = useState(0);
  const [activity30d, setActivity30d] = useState(0);
  const [moduleBreakdown, setModuleBreakdown] = useState<ModuleCount[]>([]);

  /* Document / PILA / exam status */
  const [pilaStats, setPilaStats] = useState<EstadoCount[]>([]);
  const [docStats, setDocStats] = useState<EstadoCount[]>([]);
  const [examTotal, setExamTotal] = useState(0);
  const [examPending, setExamPending] = useState(0);

  /* Compliance */
  const [lowCompliance, setLowCompliance] = useState<CumplimientoRow[]>([]);

  /* Costs */
  const [aiCalls, setAiCalls] = useState<Record<string, number>>({});
  const [estimatedCost, setEstimatedCost] = useState(0);

  /* Recent logs */
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchActivity(),
        fetchPilaStats(),
        fetchDocStats(),
        fetchExamStats(),
        fetchCompliance(),
        fetchCosts(),
        fetchRecentLogs(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* --- Fetch functions --- */

  const fetchActivity = async () => {
    const now = new Date();
    const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [res24, res30, resMod] = await Promise.all([
      supabase.from("logs_actividad").select("id", { count: "exact", head: true }).gte("created_at", h24),
      supabase.from("logs_actividad").select("id", { count: "exact", head: true }).gte("created_at", d30),
      supabase.from("logs_actividad").select("modulo").gte("created_at", d30),
    ]);

    setActivity24h(res24.count ?? 0);
    setActivity30d(res30.count ?? 0);

    if (resMod.data) {
      const counts: Record<string, number> = {};
      for (const row of resMod.data) {
        const m = (row as any).modulo || "otro";
        counts[m] = (counts[m] || 0) + 1;
      }
      const sorted = Object.entries(counts)
        .map(([modulo, count]) => ({ modulo, count }))
        .sort((a, b) => b.count - a.count);
      setModuleBreakdown(sorted);
    }
  };

  const fetchPilaStats = async () => {
    const { data } = await supabase.from("pila_records").select("estado");
    if (data) {
      const counts: Record<string, number> = {};
      for (const r of data) {
        const e = (r as any).estado || "pendiente";
        counts[e] = (counts[e] || 0) + 1;
      }
      setPilaStats(
        Object.entries(counts)
          .map(([estado, count]) => ({ estado, count }))
          .sort((a, b) => b.count - a.count)
      );
    }
  };

  const fetchDocStats = async () => {
    const { data } = await supabase.from("documentos").select("estado");
    if (data) {
      const counts: Record<string, number> = {};
      for (const r of data) {
        const e = (r as any).estado || "pendiente";
        counts[e] = (counts[e] || 0) + 1;
      }
      setDocStats(
        Object.entries(counts)
          .map(([estado, count]) => ({ estado, count }))
          .sort((a, b) => b.count - a.count)
      );
    }
  };

  const fetchExamStats = async () => {
    const [total, pending] = await Promise.all([
      supabase.from("examenes_medicos").select("id", { count: "exact", head: true }),
      supabase.from("examenes_medicos").select("id", { count: "exact", head: true }).is("concepto", null),
    ]);
    setExamTotal(total.count ?? 0);
    setExamPending(pending.count ?? 0);
  };

  const fetchCompliance = async () => {
    const { data } = await supabase
      .from("cumplimiento_empresa")
      .select("empresa_id, puntaje_total, fecha_evaluacion, empresas_cliente(razon_social)")
      .order("puntaje_total", { ascending: true })
      .limit(5);
    if (data) {
      // Deduplicate: keep latest per empresa
      const seen = new Map<string, CumplimientoRow>();
      for (const row of data as any[]) {
        const existing = seen.get(row.empresa_id);
        if (!existing || row.fecha_evaluacion > existing.fecha_evaluacion) {
          seen.set(row.empresa_id, {
            empresa_id: row.empresa_id,
            puntaje_total: row.puntaje_total,
            fecha_evaluacion: row.fecha_evaluacion,
            empresa_nombre: row.empresas_cliente?.razon_social || "—",
          });
        }
      }
      setLowCompliance(
        Array.from(seen.values())
          .sort((a, b) => a.puntaje_total - b.puntaje_total)
          .slice(0, 3)
      );
    }
  };

  const fetchCosts = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("logs_actividad")
      .select("modulo")
      .in("modulo", ["examenes", "emergencias", "comites"])
      .gte("created_at", startOfMonth.toISOString())
      .in("tipo", ["generar", "carga_archivo", "api_call"]);

    const counts: Record<string, number> = {};
    let total = 0;
    if (data) {
      for (const row of data as any[]) {
        const m = row.modulo;
        counts[m] = (counts[m] || 0) + 1;
        total += COST_PER_CALL[m] ?? 0;
      }
    }
    setAiCalls(counts);
    setEstimatedCost(total);
  };

  const fetchRecentLogs = async () => {
    const { data } = await supabase
      .from("logs_actividad")
      .select("id, tipo, modulo, descripcion, created_at, usuarios(nombre)")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) {
      setRecentLogs(
        (data as any[]).map((r) => ({
          ...r,
          usuario_nombre: r.usuarios?.nombre ?? "Sistema",
        }))
      );
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* --- Module breakdown bar max --- */
  const maxModuleCount = Math.max(1, ...moduleBreakdown.map((m) => m.count));

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Cargando panel de observabilidad...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Observabilidad"
        description="Estado operativo de la plataforma Regis SG-SST en tiempo real."
        actions={
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
        }
      />

      {/* Row 1: Activity + Costs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Activity 24h */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Acciones (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activity24h}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activity30d} en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        {/* Exams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exámenes médicos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examTotal}</div>
            {examPending > 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {examPending} pendientes de revisión
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Cost estimate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costo IA (mes)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estimatedCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.values(aiCalls).reduce((a, b) => a + b, 0)} invocaciones estimadas
            </p>
          </CardContent>
        </Card>

        {/* Low compliance alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menor cumplimiento</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {lowCompliance.length > 0 ? (
              <div className="text-2xl font-bold text-red-600">
                {lowCompliance[0].puntaje_total.toFixed(0)}%
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">—</div>
            )}
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {lowCompliance[0]?.empresa_nombre || "Sin datos"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Module breakdown + PILA + Documents */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Module breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Actividad por módulo (30d)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {moduleBreakdown.slice(0, 8).map((m) => (
              <div key={m.modulo} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="capitalize">{m.modulo}</span>
                  <span className="font-medium">{m.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(m.count / maxModuleCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {moduleBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
            )}
          </CardContent>
        </Card>

        {/* PILA status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Estado PILA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pilaStats.map((s) => (
                <Badge key={s.estado} variant="outline" className={`${estadoColor[s.estado] || ""} text-xs`}>
                  {s.estado}: {s.count}
                </Badge>
              ))}
            </div>
            {pilaStats.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin registros PILA</p>
            )}
            <div className="mt-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2 mb-2">
                <FolderIcon /> Estado Documentos
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {docStats.map((s) => (
                  <Badge key={s.estado} variant="outline" className={`${estadoColor[s.estado] || ""} text-xs`}>
                    {s.estado}: {s.count}
                  </Badge>
                ))}
              </div>
              {docStats.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin documentos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Empresas — menor cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowCompliance.map((c, i) => (
              <div key={c.empresa_id} className="flex items-center gap-3">
                <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.empresa_nombre}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.fecha_evaluacion)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    c.puntaje_total < 30
                      ? "bg-red-100 text-red-800"
                      : c.puntaje_total < 60
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }
                >
                  {c.puntaje_total.toFixed(0)}%
                </Badge>
              </div>
            ))}
            {lowCompliance.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin evaluaciones de cumplimiento</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: AI cost breakdown + Recent logs */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cost breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Desglose de costos IA (mes actual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead className="text-right">Invocaciones</TableHead>
                  <TableHead className="text-right">Costo unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(COST_PER_CALL).map(([mod, cost]) => {
                  const calls = aiCalls[mod] ?? 0;
                  return (
                    <TableRow key={mod}>
                      <TableCell className="capitalize">{mod}</TableCell>
                      <TableCell className="text-right">{calls}</TableCell>
                      <TableCell className="text-right">${cost.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${(calls * cost).toFixed(3)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {Object.values(aiCalls).reduce((a, b) => a + b, 0)}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right">${estimatedCost.toFixed(3)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Últimas 10 acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-lg border p-2.5 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {log.modulo}
                      </Badge>
                      <span className="text-muted-foreground">{log.usuario_nombre}</span>
                    </div>
                    <p className="text-xs truncate">{log.descripcion}</p>
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* Small inline icon to avoid extra import */
function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
