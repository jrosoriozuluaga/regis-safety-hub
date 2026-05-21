import { useEffect, useState, useMemo, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, Send, RefreshCw, Bell, MessageCircle, AlertTriangle, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileDropzone } from "@/components/common/FileDropzone";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { empresasService, pilaService, logsService } from "@/services";
import type { PilaConfig } from "@/services";
import type { Empresa, PilaRecord } from "@/types/domain";
import { generateUploadToken } from "./UploadPila";

const statusIcon: Record<string, typeof CheckCircle2> = {
  pendiente: Clock,
  cargada: Upload,
  validada: ShieldCheck,
  aprobada: BadgeCheck,
  vencida: AlertCircle,
};

const statusColor: Record<string, string> = {
  pendiente: "text-yellow-700 bg-yellow-50",
  cargada: "text-blue-700 bg-blue-50",
  validada: "text-purple-700 bg-purple-50",
  aprobada: "text-green-700 bg-green-50",
  vencida: "text-red-700 bg-red-50",
};

const statusLabel: Record<string, string> = {
  pendiente: "Pendiente",
  cargada: "Cargada",
  validada: "Validada",
  aprobada: "Aprobada",
  vencida: "Vencida",
};

/** Generate last N month periods as "YYYY-MM" strings */
function getUploadPeriods(count: number = 6): { value: string; label: string }[] {
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const periods: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${meses[d.getMonth()]} ${d.getFullYear()}`;
    periods.push({ value, label });
  }
  return periods;
}

export default function Pila() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [uploadEmpresa, setUploadEmpresa] = useState("");
  const [uploadPeriodo, setUploadPeriodo] = useState("");
  const [records, setRecords] = useState<PilaRecord[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState<PilaConfig | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "consultor";
  const uploadPeriods = useMemo(() => getUploadPeriods(6), []);

  // Load config on mount
  useEffect(() => {
    pilaService.loadConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  const loadRecords = useCallback(async () => {
    try {
      const data = await pilaService.listRecords(selectedEmpresa || undefined);
      setRecords(data);
    } catch (err: any) {
      console.error("Error loading PILA records:", err);
    }
  }, [selectedEmpresa]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { created, overdue } = await pilaService.syncPeriods(
        empresas,
        selectedEmpresa || undefined,
        config ?? undefined,
        user?.id,
      );
      await loadRecords();
      toast.success(`Sincronizacion completada: ${created} periodos creados, ${overdue} marcados como vencidos`);
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

      const maxAttempts = config?.max_recordatorios ?? 3;
      const currentAttempts = record.intentos_solicitud || 0;

      const { escalated } = await pilaService.sendReminder(record, empresa, config ?? undefined, user?.id);

      const email = empresa.email_contacto_pila || empresa.email_contacto;
      if (escalated) {
        toast.warning(`Recordatorio ESCALADO enviado a ${email} — Se superaron los ${maxAttempts} intentos maximos`, { duration: 6000 });
      } else {
        toast.success(`Recordatorio enviado a ${email} (intento ${currentAttempts + 1}/${maxAttempts})`);
      }
      loadRecords();
    } catch (err: any) {
      toast.error(`Error al enviar recordatorio: ${err.message || "No se pudo conectar con el servicio de correo. Verifica la configuracion de n8n o Edge Functions."}`);
    }
  };

  const handleWhatsAppReminder = async (record: PilaRecord) => {
    const empresa = empresas.find(e => e.id === record.empresa_id);
    if (!empresa) { toast.error("Empresa no encontrada"); return; }

    const whatsapp = empresa.whatsapp_contacto_pila || (empresa as any).telefono;
    if (!whatsapp) {
      toast.error("No hay numero de WhatsApp registrado para esta empresa. Agrega el numero en la ficha de la empresa.");
      return;
    }

    // Generate upload link
    const token = generateUploadToken(empresa.id, record.periodo, empresa.razon_social);
    const uploadUrl = `${window.location.origin}/upload-pila?t=${token}`;

    // Also fire Twilio API in background (non-blocking) for automated delivery
    supabase.functions.invoke("send-whatsapp-reminder", {
      body: {
        phone: whatsapp,
        nombre_contacto: empresa.nombre_contacto_pila || empresa.nombre_contacto,
        empresa_id: empresa.id,
        empresa_nombre: empresa.razon_social,
        modulo: "pila",
        periodo: record.periodo,
        intento: (record.intentos_solicitud || 0) + 1,
        upload_link: uploadUrl,
      },
    }).then(({ data }) => {
      if (data?.success) console.log("Twilio WhatsApp also queued:", data.sid);
    }).catch(() => {});

    // Open wa.me link — always shows the message for visual confirmation
    const cleanPhone = whatsapp.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
    const phone = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;

    const mes = record.periodo.split("-")[1];
    const anio = record.periodo.split("-")[0];
    const meses = ["", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mesNombre = meses[parseInt(mes)] || mes;

    const message = `Cordial saludo, le escribimos desde *Regis Colombia*.\n\nSolicitamos amablemente el envio de la *Planilla PILA* de *${empresa.razon_social}* correspondiente al periodo *${mesNombre} ${anio}*.\n\n*Cargue su planilla directamente aqui:*\n${uploadUrl}\n\nTambien puede enviar el PDF como respuesta a este mensaje o al correo sgsst@regiscolombia.com.\n\nGracias por su pronta gestion.\n_Regis Colombia - SG-SST_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    logsService.log({
      tipo: "recordatorio_whatsapp",
      modulo: "pila",
      descripcion: `Recordatorio WhatsApp enviado a ${empresa.razon_social} — periodo ${record.periodo}`,
      empresa_id: empresa.id,
      usuario_id: user?.id,
      metadata: { periodo: record.periodo, telefono: whatsapp, intento: (record.intentos_solicitud || 0) + 1 },
    }).catch(() => {});
    toast.success(`WhatsApp abierto para ${empresa.razon_social} (modo manual)`);
  };

  const handleFiles = async (files: File[]) => {
    const empresaId = uploadEmpresa || selectedEmpresa || user?.empresa_id;
    if (!empresaId || empresaId === "all") {
      toast.error("Selecciona una empresa primero");
      return;
    }

    const file = files[0];
    if (!file) return;

    // Use selected period or default to current month
    const periodo = uploadPeriodo || uploadPeriods[0]?.value;
    if (!periodo) { toast.error("Selecciona un periodo"); return; }

    try {
      await pilaService.uploadFile(empresaId, periodo, file, user?.id);
      toast.success(`PILA "${file.name}" cargada — periodo ${periodo}`);
      setOpen(false);
      setUploadPeriodo("");
      loadRecords();
    } catch (err: any) {
      toast.error(err.message || "Error al cargar PILA");
    }
  };

  const stats = useMemo(() => pilaService.getStats(records), [records]);

  return (
    <div>
      <PageHeader
        title="Gestion PILA"
        description="Planilla Integrada de Liquidacion de Aportes — control mensual automatizado."
        actions={
          <div className="flex gap-2">
            {isAdmin && (
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
                  <DialogDescription>Sube el archivo de la planilla mensual. Se archiva automaticamente.</DialogDescription>
                </DialogHeader>
                {isAdmin && (
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
                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <Select value={uploadPeriodo} onValueChange={setUploadPeriodo}>
                    <SelectTrigger><SelectValue placeholder={uploadPeriods[0]?.label || "Selecciona periodo"} /></SelectTrigger>
                    <SelectContent>
                      {uploadPeriods.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FileDropzone onFiles={handleFiles} accept=".pdf,.xlsx,.xls,.zip" hint="PDF, Excel o ZIP — max. 10MB" />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Config indicator */}
      {config && isAdmin && (
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Dia solicitud: <strong>{config.dia_solicitud}</strong></span>
          <span>Recordatorio cada: <strong>{config.dias_recordatorio} dias</strong></span>
          <span>Max intentos: <strong>{config.max_recordatorios}</strong></span>
          {config.n8n_webhook_base_url ? (
            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 text-[10px]">n8n conectado</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">n8n no configurado</Badge>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
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
              <BadgeCheck className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.aprobadas}</div>
              <div className="text-xs text-muted-foreground">Aprobadas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stats.enProceso}</div>
              <div className="text-xs text-muted-foreground">En proceso</div>
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

      {isAdmin && (
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
                  {isAdmin && <TableHead>Empresa</TableHead>}
                  <TableHead>Periodo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha carga</TableHead>
                  <TableHead>Intentos</TableHead>
                  <TableHead>Archivo</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const Icon = statusIcon[r.estado] || Clock;
                  const maxAttempts = config?.max_recordatorios ?? 3;
                  const isEscalated = (r.intentos_solicitud || 0) >= maxAttempts;
                  return (
                    <TableRow key={r.id}>
                      {isAdmin && (
                        <TableCell className="font-medium">{r.empresa_razon_social}</TableCell>
                      )}
                      <TableCell className="tabular-nums font-medium">{r.periodo}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[r.estado] || ""}`}>
                          <Icon className="h-3 w-3" /> {statusLabel[r.estado] || r.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {r.fecha_carga ? new Date(r.fecha_carga).toLocaleDateString("es-CO") : "—"}
                      </TableCell>
                      <TableCell>
                        {r.intentos_solicitud ? (
                          <div className="flex items-center gap-1">
                            <span className={`text-xs tabular-nums ${isEscalated ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                              {r.intentos_solicitud}/{maxAttempts}
                            </span>
                            {isEscalated && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
                            <a href={`https://1drv.ms/${r.drive_file_id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              OneDrive
                            </a>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {(r.estado === "pendiente" || r.estado === "vencida") && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-xs"
                                  onClick={() => handleSendReminder(r)}
                                  title={isEscalated ? "Se superaron los intentos maximos — se enviara escalamiento" : "Enviar recordatorio por correo"}
                                >
                                  {isEscalated ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> : <Bell className="h-3.5 w-3.5" />}
                                  {r.intentos_solicitud ? `(${r.intentos_solicitud})` : "Email"}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1.5 text-xs text-[#25D366] hover:text-[#128C7E] hover:bg-green-50"
                                  onClick={() => handleWhatsAppReminder(r)}
                                  title="Enviar recordatorio por WhatsApp"
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                  WhatsApp
                                </Button>
                              </>
                            )}
                            {r.estado === "cargada" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                onClick={async () => {
                                  const { error } = await supabase.from("pila_records").update({
                                    estado: "validada",
                                    validado_por: user?.id,
                                    fecha_validacion: new Date().toISOString(),
                                  }).eq("id", r.id);
                                  if (error) { toast.error("Error al validar planilla"); return; }
                                  await logsService.log({
                                    tipo: "validacion",
                                    modulo: "pila",
                                    descripcion: `Planilla PILA validada — periodo ${r.periodo}`,
                                    empresa_id: r.empresa_id,
                                    usuario_id: user?.id,
                                    metadata: { pila_record_id: r.id, periodo: r.periodo },
                                  });
                                  toast.success("Planilla validada por el analista");
                                  loadRecords();
                                }}
                                title="Marcar como validada por el analista"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Validar
                              </Button>
                            )}
                            {r.estado === "validada" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-xs text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={async () => {
                                  const { error } = await supabase.from("pila_records").update({
                                    estado: "aprobada",
                                    aprobado_por: user?.id,
                                    fecha_aprobacion: new Date().toISOString(),
                                  }).eq("id", r.id);
                                  if (error) { toast.error("Error al aprobar planilla"); return; }
                                  await logsService.log({
                                    tipo: "aprobacion",
                                    modulo: "pila",
                                    descripcion: `Planilla PILA aprobada — periodo ${r.periodo} — puntos de cumplimiento otorgados`,
                                    empresa_id: r.empresa_id,
                                    usuario_id: user?.id,
                                    metadata: { pila_record_id: r.id, periodo: r.periodo },
                                  });
                                  toast.success("Planilla aprobada — puntos de cumplimiento otorgados");
                                  loadRecords();
                                }}
                                title="Aprobar y otorgar puntos de cumplimiento"
                              >
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Aprobar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {isAdmin
                ? 'Haz clic en "Sincronizar periodos" para generar los registros automaticamente.'
                : 'No hay registros PILA. Usa el boton "Cargar PILA" para empezar.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
