import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { committeeService, companiesService } from "@/services";
import type { CommitteeMember, Company } from "@/types/domain";

export default function Committees() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [company, setCompany] = useState<string>("");
  const [points, setPoints] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    companiesService.list().then(setCompanies);
    committeeService.members().then((m) => {
      setMembers(m);
      setAttendance(Object.fromEntries(m.map((x) => [x.id, true])));
    });
  }, []);

  const handleGenerate = async () => {
    if (!company) { toast.error("Selecciona una empresa"); return; }
    await committeeService.create({ company, points, attendance });
    toast.success("Acta generada correctamente");
    setPoints("");
  };

  return (
    <div>
      <PageHeader title="Actas de Comité" description="Crea actas COPASST listas para firma y archivo." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Nueva acta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Puntos discutidos</Label>
              <Textarea id="points" rows={6} value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Resumen de los temas tratados…" />
            </div>
            <Button onClick={handleGenerate} className="gap-2"><FileText className="h-4 w-4" /> Generar Documento</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-base">Asistencia</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/40 cursor-pointer">
                <Checkbox
                  checked={!!attendance[m.id]}
                  onCheckedChange={(v) => setAttendance((a) => ({ ...a, [m.id]: !!v }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
