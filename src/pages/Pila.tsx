import { useEffect, useState, useMemo } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, Send, RefreshCw, Bell } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

function getPastPeriods(count: number): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

function isOverdue(periodo: string): boolean {
  const [y, m] = periodo.split("-").map(Number);
  const deadline = new Date(y, m, 15);
  return new Date() > deadline;
}

export default function Pila() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [uploadEmpresa, setUploadEmpresa] = useState("");
  const [records, setRecords] = useState<PilaRecord[]>([]);
  const [syncing, setSyncing] = useState(false);

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
    if (selectedEmpresa && selectedEmpresa !== "all") query = query.eq("empresa_id", selectedEmpresa);
    const { data } = await query;
    setRecords(
      (data ?? []).map((r: any) => ({
        ...r,
        empresa_razon_social: r.empresas_cliente?.razon_social,
      }))
    );
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const targetEmpresas = selectedEmpresa && selectedEmpresa !== "all"
        ? empresas.filter(e => e.id === selectedEmpresa)
        : empresas;

      const periods = getPastPeriods(6);
      let created = 0;
      let markedOverdue = 0;

      for (const emp of targetEmpresas) {
        for (const periodo of periods) {
          const { data: existing } = await supabase.from("pila_records")
            .select("id, estado")
            .eq("empresa_id", emp.id)
            .eq("periodo", periodo)
            .maybeSingle();

          if (!existing) {
            const estado = isOverdue(periodo) ? "vencida" : "pendiente";
            await supabase.from("pila_records").insert({
              empresa_id: emp.id,
              periodo,
              estado,
              fecha_solicitud: new Date().toISOString(),
            });
            created++;
            if (estado === "vencida") markedOverdue++;
          } else if (existing.estado === "pendiente" && isOverdue(periodo)) {
            await supabase.from("pila_records").update({ estado: "vencida" }).eq("id", existing.id);
            markedOverdue++;
          }
        }
      }

      await loadRecords();
      toast.success(`Sincronización completada: ${created} periodos creados, ${markedOverdue} marcados como vencidos`);
    } catch (err: any) {
      toast.error(err.message || "Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const handleSendReminder = async (record: PilaRecord) => {
    try {
      const empresa = empresas.find(e => e.id === record.empresa_id);
      if (!empresa) { toast.error("Empresa no encontrada"); return; }

      // Try n8n webhook first, fall back to Edge Function
      const { data: config } = await supabase
        .from("configuracion_sistema")
        .select("valor")
        .eq("clave", "n8n_webhook_base_url")
        .maybeSingle();

      const webhookUrl = config?.valor;

      if (webhookUrl) {
        const response = await fetch(`${webhookUrl}/pila-reminder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa_id: empresa.id,
            empresa_nombre: empresa.razon_social,
            empresa_nit: empresa.nit,
            email: empresa.email_contacto,
            nombre_contacto: empresa.nombre_contacto,
            periodo: record.periodo,
            estado: record.estado,
            intento: (record.intentos_solicitud || 0) + 1,
          }),
        });
        if (!response.ok) throw new Error("Error en webhook n8n");
      } else {
        const { error } = await supabase.functions.invoke("send-pila-reminder", {
          body: {
            empresa_id: empresa.id,
            empresa_nombre: empresa.razon_social,
            email: empresa.email_contacto,
            periodo: record.periodo,
            estado: record.estado,
          },
        });
        if (error) throw error;
      }

      // Track reminder attempt in DB
      await supabase.from("pila_records").update({
        intentos_solicitud: (record.intentos_solicitud || 0) + 1,
        proximo_recordatorio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }).eq("id", record.id);

      toast.success(`Recordatorio enviado a ${empresa.email_contacto}`);
      loadRecords();
    } catch {
      toast.info(`Recordatorio programado para ${record.empresa_razon_social} — periodo ${record.periodo}`);
    }
  };

  const handleFiles = async (files: File[]) => {
    const empresaId = uploadEmpresa || selectedEmpresa || user?.empresa_id;
    if (!empresaId || empresaId === "all") {
      toast.error("Selecciona una empresa primero");
      return;
    }

    const file = files[0];
    if (!file) return;

    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    try {
      const filePath = `pila/${empresaId}/${periodo}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documentos").upload(filePath, file, { upsert: true });

      let archivoUrl: string | undefined;
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("documentos").getPublicUrl(filePath);
        archivoUrl = urlData.publicUrl;
      }

      const { data: existing } = await supabase.from("pila_records")
        .select("id")
        .eq("empresa_id", empresaId)
        .eq("periodo", periodo)
        .maybeSingle();

      if (existing) {
        await supabase.from("pila_records").update({
          estado: "cargada",
          fecha_carga: now.toISOString(),
          archivo_url: archivoUrl,
        }).eq("id", existing.id);
      } else {
        await supabase.from("pila_records").insert({
          empresa_id: empresaId,
          periodo,
          estado: "cargada",
          fecha_carga: now.toISOString(),
          archivo_url: archivoUrl,
        });
      }

      toast.success(`PILA "${file.name}" cargada — periodo ${periodo}`);
      setOpen(false);
      loadRecords();
    } catch (err: any) {
      toast.error(err.message || "Error al cargar PILA");
    }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const cargadas = records.filter(r => r.estado === "cargada").length;
    const pendientes = records.filter(r => r.estado === "pendiente").length;
    const vencidas = records.filter(r => r.estado === "vencida").length;
    const pct = total > 0 ? Math.round((cargadas / total) * 100) : 0;
    return { total, cargadas, pendientes, vencidas, pct };
  }, [records]);

  return (
    <div>
      <PageHeader
        title="Gestión PILA"
        description="Planilla Integrada de Liquidación de Aportes — control mensual automatizado."
        actions={
          <div className="flex gap-2">
            {(user?.role === "admin" || user?.role === "consultor") && (
              <Button variant="outline" className="gap-2" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Sincronizando..." : "Sincronizar periodos"}
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Upload className="h-4 w-4" /> Cargar PILA</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cargar planilla PILA</DialogTitle>
                  <DialogDescription>Sube el archivo de la planilla mensual. Se archiva automáticamente.</DialogDescription>
                </DialogHeader>
                {(user?.role === "admin" || user?.role === "consultor") && (
                  <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={uploadEmpresa} onValueChange={setUploadEmpresa}>
                      <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                      <SelectContent>
                        {empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <FileDropzone onFiles={handleFiles} accept=".pdf,.xlsx,.xls,.zip" hint="PDF, Excel o ZIP — máx. 10MB" />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.pct}%</div>
            <div className="text-xs text-muted-foreground mt-1">Cumplimiento PILA</div>
            <Progress value={stats.pct} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.cargadas}</div>
              <div className="text-xs text-muted-foreground">Cargadas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.pendientes}</div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.vencidas}</div>
              <div className="text-xs text-muted-foreground">Vencidas</div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>Archivo</TableHead>
                  {(user?.role === "admin" || user?.role === "consultor") && <TableHead className="text-right">Acciones</TableHead>}
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
                      <TableCell className="tabular-nums font-medium">{r.periodo}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[r.estado] || ""}`}>
                          <Icon className="h-3 w-3" /> {r.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {r.fecha_carga ? new Date(r.fecha_carga).toLocaleDateString("es-CO") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {r.archivo_url ? (
                            <a href={r.archivo_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                              Ver archivo
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {r.drive_file_id && (
                            <a href={`https://drive.google.com/file/d/${r.drive_file_id}/view`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              Google Drive
                            </a>
                          )}
                        </div>
                      </TableCell>
                      {(user?.role === "admin" || user?.role === "consultor") && (
                        <TableCell className="text-right">
                          {r.estado !== "cargada" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 text-xs"
                              onClick={() => handleSendReminder(r)}
                            >
                              <Bell className="h-3.5 w-3.5" />
                              {r.intentos_solicitud ? `Recordatorio (${r.intentos_solicitud})` : "Recordatorio"}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {(user?.role === "admin" || user?.role === "consultor")
                ? 'Haz clic en "Sincronizar periodos" para generar los registros automáticamente.'
                : "No hay registros PILA. Usa el botón \"Cargar PILA\" para empezar."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
