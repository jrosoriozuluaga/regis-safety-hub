import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PilaStatus } from "@/types/domain";

const map: Record<PilaStatus, { label: string; cls: string }> = {
  uploaded: { label: "Cargado", cls: "bg-success/15 text-success border-success/30 hover:bg-success/20" },
  pending: { label: "Pendiente", cls: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20" },
  overdue: { label: "Vencido", cls: "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20" },
};

export function StatusBadge({ status }: { status: PilaStatus }) {
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("font-medium", m.cls)}>
      {m.label}
    </Badge>
  );
}
