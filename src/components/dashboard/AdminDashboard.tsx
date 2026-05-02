import { useEffect, useState } from "react";
import { Building2, TrendingUp, Users, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { companiesService } from "@/services";
import type { Company } from "@/types/domain";

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    companiesService.list().then(setCompanies);
    companiesService.averageCompliance().then(setAvg);
  }, []);

  const totalWorkers = companies.reduce((s, c) => s + c.workers, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Building2} label="Empresas clientes" value={String(companies.length)} />
        <Kpi icon={Users} label="Trabajadores cubiertos" value={totalWorkers.toLocaleString("es-CO")} />
        <Kpi icon={TrendingUp} label="Cumplimiento promedio" value={`${avg}%`} accent="success" />
        <Kpi icon={ShieldCheck} label="Auditorías al día" value="6 / 8" />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Cumplimiento por empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Trabajadores</TableHead>
                <TableHead className="w-[260px]">Cumplimiento</TableHead>
                <TableHead className="text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.workers.toLocaleString("es-CO")}</TableCell>
                  <TableCell><Progress value={c.compliance} className="h-2" /></TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{c.compliance}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
