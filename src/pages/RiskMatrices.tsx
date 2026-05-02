import { useEffect, useState } from "react";
import { Download, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matricesService } from "@/services";
import type { RiskMatrix } from "@/types/domain";

export default function RiskMatrices() {
  const [ciiu, setCiiu] = useState("");
  const [items, setItems] = useState<RiskMatrix[]>([]);
  useEffect(() => { matricesService.list().then(setItems); }, []);

  const handleGenerate = async () => {
    if (!ciiu.trim()) { toast.error("Ingresa un código CIIU"); return; }
    await matricesService.generate(ciiu);
    toast.success(`Matriz GTC 45 generada para CIIU ${ciiu}`);
    setCiiu("");
  };

  return (
    <div>
      <PageHeader
        title="Matrices de Riesgo GTC 45"
        description="Genera matrices de identificación de peligros por código CIIU."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Generar nueva matriz</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ciiu">Código CIIU</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="ciiu" value={ciiu} onChange={(e) => setCiiu(e.target.value)} placeholder="ej. 4711" className="pl-9" />
              </div>
            </div>
            <Button onClick={handleGenerate} className="w-full gap-2"><Wand2 className="h-4 w-4" /> Generar Matriz</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Matrices generadas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {items.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {m.ciiu}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.description}</div>
                  <div className="text-xs text-muted-foreground">Generada el {m.generatedAt}</div>
                </div>
                <Button variant="ghost" size="icon" aria-label="Descargar"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
