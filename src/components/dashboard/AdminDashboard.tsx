import { useEffect, useState } from "react";
import { Building2, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { empresasService, cumplimientoService } from "@/services";
import { OnboardingChecklist } from "@/components/common/OnboardingChecklist";
import type { Empresa } from "@/types/domain";

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


export function AdminDashboard() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [avgCompliance, setAvgCompliance] = useState(0);
  const [complianceData, setComplianceData] = useState<{ name: string; score: number }[]>([]);

  useEffect(() => {
    empresasService.list().then(setEmpresas);
    empresasService.compliance().then((rows) => {
      if (rows.length > 0) {
        const avg = Math.round(rows.reduce((s, r) => s + r.puntaje_total, 0) / rows.length);
        setAvgCompliance(avg);
        setComplianceData(rows.map((r) => ({
          name: r.empresa?.razon_social?.split(" ").slice(0, 2).join(" ") || "Empresa",
          score: r.puntaje_total,
        })));
      }
    });
  }, []);

  const totalWorkers = empresas.reduce((s, e) => s + e.num_trabajadores, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Building2} label="Empresas clientes" value={String(empresas.length)} />
        <Kpi icon={Users} label="Trabajadores cubiertos" value={totalWorkers.toLocaleString("es-CO")} />
        <Kpi icon={TrendingUp} label="Cumplimiento promedio" value={avgCompliance ? `${avgCompliance}%` : "—"} accent="success" />
        <Kpi icon={ShieldCheck} label="Nivel de riesgo" value={empresas.length ? empresas.map(e => `${e.nivel_riesgo_arl}`).join(", ") : "—"} />
      </div>

      {complianceData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Cumplimiento por empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-6 justify-center" style={{ height: 240 }}>
              {complianceData.map((d) => (
                <div key={d.name} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                  <span className="text-sm font-bold tabular-nums">{d.score}%</span>
                  <div className="w-full bg-muted rounded-t-md" style={{ height: 200 }}>
                    <div
                      className="w-full rounded-t-md transition-all duration-700"
                      style={{
                        height: `${d.score}%`,
                        marginTop: `${100 - d.score}%`,
                        backgroundColor: d.score >= 80 ? "#16a34a" : d.score >= 60 ? "#ca8a04" : "#dc2626",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center leading-tight">{d.name}</span>
                </div>
              ))}
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
