import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "./CircularProgress";
import { notificationsService } from "@/services";
import type { PendingAction } from "@/types/domain";
import { cn } from "@/lib/utils";

const priorityStyle: Record<PendingAction["priority"], string> = {
  high: "text-destructive bg-destructive/10",
  medium: "text-warning bg-warning/10",
  low: "text-success bg-success/10",
};

export function ClientDashboard() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  useEffect(() => { notificationsService.pendingActions().then(setActions); }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="shadow-card lg:col-span-1">
        <CardHeader><CardTitle className="text-lg">Tu cumplimiento SG-SST</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <CircularProgress value={92} size={220} />
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-1.5 text-success text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Excelente desempeño
            </div>
            <p className="text-xs text-muted-foreground mt-1">Última auditoría: 28 abr 2025</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Acciones pendientes</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">Ver todas <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((a) => (
            <div key={a.id} className="flex items-center gap-4 rounded-lg border bg-card p-4 hover:bg-muted/40 transition-colors">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", priorityStyle[a.priority])}>
                {a.priority === "high" ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.due}</div>
              </div>
              <Button size="sm" variant="outline">Resolver</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
