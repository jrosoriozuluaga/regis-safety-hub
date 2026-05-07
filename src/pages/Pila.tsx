import { useEffect, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/context/AuthContext";
import { empresasService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa, PilaRecord } from "@/types/domain";

const statusIcon: Record<string, typeof CheckCircle2> = {
  cargada: CheckCircle2,
  pendiente: Clock,
  vencida: AlertCircle,
};

const statusColor: Record<string, string> = {
  cargada: "text-green-700 bg-green-50",
  pendiente: "text-yellow-700 bg-yellow-50",
  vencida: "text-red-700 bg-red-50",
};

export default function Pila() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [records, setRecords] = useState<PilaRecord[]>([]);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  useEffect(() => {
    loadRecords();
  }, [selectedEmpresa, user]);

  const loadRecords = async () => {
    let query = supabase.from("pila_records").select("*, empresas_cliente(razon_social)").order("periodo", { ascending: false });
    if (selectedEmpresa) query = query.eq("empresa_id", selectedEmpresa);
    const { data } = await query;
    setRecords(
      (data ?? []).map((r: any) => ({
        ...r,
        empresa_razon_social: r.empresas_cliente?.razon_social,
      }))
    );
  };

  const handleFiles = async (files: File[]) => {
    if (!selectedEmpresa && user?.role !== "cliente") {
      toast.error("Selecciona una empresa primero");
      return;
    }
    const empresaId = selectedEmpresa || user?.empresa_id;
    if (!empresaId) return;

    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const { error } = await supabase.from("pila_records").insert({
      empresa_id: empresaId,
      periodo,
      estado: "cargada",
      fecha_carga: now.toISOString(),
    });

    if (error) {
      toast.error("Error al registrar PILA: " + error.message);
    } else {
      toast.success(`Archivo "${files[0].name}" registrado — periodo ${periodo}`);
      setOpen(false);
      loadRecords();
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestión PILA"
        description="Planilla Integrada de Liquidación de Aportes — control mensual por empresa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Upload className="h-4 w-4" /> Cargar PILA</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cargar planilla PILA</DialogTitle>
                <DialogDescription>Arrastra el archivo de la planilla mensual.</DialogDescription>
              </DialogHeader>
              {(user?.role === "admin" || user?.role === "consultor") && (
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                    <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <FileDropzone onFiles={handleFiles} accept=".pdf,.xlsx,.xls,.zip" />
            </DialogContent>
          </Dialog>
        }
      />

      {(user?.role === "admin" || user?.role === "consultor") && (
        <div className="mb-4 max-w-xs">
          <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
            <SelectTrigger><SelectValue placeholder="Filtrar por empresa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las empresas</SelectItem>
              {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Registros PILA</CardTitle></CardHeader>
        <CardContent className="p-0">
          {records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {(user?.role === "admin" || user?.role === "consultor") && <TableHead>Empresa</TableHead>}
                  <TableHead>Periodo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha carga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const Icon = statusIcon[r.estado] || Clock;
                  return (
                    <TableRow key={r.id}>
                      {(user?.role === "admin" || user?.role === "consultor") && (
                        <TableCell className="font-medium">{r.empresa_razon_social}</TableCell>
                      )}
                      <TableCell className="tabular-nums">{r.periodo}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[r.estado] || ""}`}>
                          <Icon className="h-3 w-3" /> {r.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.fecha_carga ? new Date(r.fecha_carga).toLocaleDateString("es-CO") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No hay registros PILA. Usa el botón "Cargar PILA" para empezar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
