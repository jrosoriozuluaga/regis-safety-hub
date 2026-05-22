import { useEffect, useState } from "react";
import { FileText, Sparkles, Loader2, Printer, AlertTriangle, CheckCircle2, History, Clock, MapPin, PenLine, Archive, Link2, Copy, UserCheck, Bell, Mic, Video, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { empresasService, comitesService, logsService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa, Comite, IntegranteComite, ActaComite } from "@/types/domain";
import { getExportHeaderHTML, getExportFooterHTML, injectLogoIntoWindow } from "@/lib/exportHeader";
import logo from "@/assets/regis-logo.jpeg";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { generateAsistenciaToken } from "./AsistenciaComite";

export default function Committees() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [comites, setComites] = useState<Comite[]>([]);
  const [selectedComite, setSelectedComite] = useState("");
  const [tipoComite, setTipoComite] = useState<"vigia" | "copasst" | "convivencia">("copasst");
  const [members, setMembers] = useState<IntegranteComite[]>([]);
  const [points, setPoints] = useState("");
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [generatedActa, setGeneratedActa] = useState("");
  const [actas, setActas] = useState<ActaComite[]>([]);
  // Meeting fields
  const [lugar, setLugar] = useState("Oficinas de la empresa");
  const [tipoReunion, setTipoReunion] = useState<"ordinaria" | "extraordinaria" | "seguimiento">("ordinaria");
  const [horaInicio, setHoraInicio] = useState(() => new Date().toTimeString().slice(0, 5));
  const [horaFin, setHoraFin] = useState(() => new Date(Date.now() + 3600000).toTimeString().slice(0, 5));

  const [asistenciaLink, setAsistenciaLink] = useState("");
  const [individualLinks, setIndividualLinks] = useState<Array<{ nombre: string; url: string }>>([]);

  // Meeting transcription state (T69)
  const [firefliesMeetings, setFirefliesMeetings] = useState<any[]>([]);
  const [loadingFireflies, setLoadingFireflies] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [transcripcionPreview, setTranscripcionPreview] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [editableTranscription, setEditableTranscription] = useState("");
  const [firefliesError, setFirefliesError] = useState("");

  // Quorum calculation (seguimiento doesn't require quorum)
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalMembers = members.length;
  const quorumRequired = Math.floor(totalMembers / 2) + 1;
  const isSeguimiento = tipoReunion === "seguimiento";
  const hasQuorum = isSeguimiento || presentCount >= quorumRequired;

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedEmpresa) return;
    comitesService.listByEmpresa(selectedEmpresa).then(setComites);
  }, [selectedEmpresa]);

  useEffect(() => {
    const match = comites.find(c => c.tipo === tipoComite && c.activo);
    if (match) {
      setSelectedComite(match.id);
      comitesService.integrantes(match.id).then((m) => {
        setMembers(m);
        setAttendance(Object.fromEntries(m.map((x) => [x.id, true])));
      });
      comitesService.actas(match.id).then(setActas);
    } else {
      setSelectedComite("");
      setMembers([]);
      setAttendance({});
      setActas([]);
    }
  }, [comites, tipoComite]);

  const handleGenerate = async () => {
    if (!selectedComite) { toast.error("No hay comite activo para esta empresa"); return; }
    if (!points.trim()) { toast.error("Ingresa los puntos a tratar"); return; }

    // Quorum validation — required by Regis
    if (!hasQuorum) {
      toast.error(`Sin quorum: se requieren ${quorumRequired} integrantes (hay ${presentCount} presentes). La reunion debe reprogramarse.`);
      return;
    }

    setGenerating(true);
    setGeneratedActa("");
    try {
      const asistentesIds = Object.entries(attendance).filter(([, v]) => v).map(([k]) => k);
      const puntosArray = points.split("\n").filter(l => l.trim()).map((l) => ({
        titulo: l.trim(),
        desarrollo: "",
        compromisos: [],
      }));

      const { data, error } = await supabase.functions.invoke("generate-acta", {
        body: {
          comite_id: selectedComite,
          tipo_reunion: tipoReunion,
          lugar,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          puntos_json: puntosArray,
          asistentes_ids: asistentesIds,
        },
      });

      if (error) throw error;

      const contenido = data.contenido;
      setGeneratedActa(contenido);

      // Persist acta to database
      const nextNumero = actas.length > 0 ? Math.max(...actas.map(a => a.numero_acta || 0)) + 1 : 1;
      const savedActa = await comitesService.createActa({
        comite_id: selectedComite,
        numero_acta: nextNumero,
        fecha_reunion: new Date().toISOString(),
        tipo_reunion: tipoReunion,
        lugar,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        contenido_generado: contenido,
        hay_quorum: true,
        generada_por_ia: true,
        estado: "borrador",
      });

      // Save attendance records to asistencia_comite
      if (savedActa?.id && asistentesIds.length > 0) {
        try {
          await comitesService.insertAsistencia(
            asistentesIds.map(integranteId => ({
              acta_id: savedActa.id,
              integrante_id: integranteId,
              presente: true,
            }))
          );
        } catch (attErr: any) {
          console.error("Error saving attendance:", attErr);
        }
      }
      // Reload actas
      const updatedActas = await comitesService.actas(selectedComite);
      setActas(updatedActas);

      await logsService.log({
        tipo: "crear",
        modulo: "comites",
        descripcion: `Acta #${nextNumero} generada con IA para comité ${tipoComite} (${tipoReunion})`,
        empresa_id: selectedEmpresa || undefined,
        usuario_id: user?.id,
        metadata: { comite_id: selectedComite, numero_acta: nextNumero, tipo_comite: tipoComite, tipo_reunion: tipoReunion },
      });

      toast.success("Acta generada y guardada exitosamente");
      setPoints("");
    } catch (err: any) {
      toast.error(err.message || "Error al generar el acta con IA");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Actas de Comite" description="Genera actas COPASST y Convivencia Laboral con IA, listas para firma." />

      {/* Unsigned actas alert */}
      {actas.filter(a => !a.firmada).length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{actas.filter(a => !a.firmada).length} acta(s)</strong> pendiente(s) de firma.
            Las actas deben ser firmadas y archivadas para cumplir con la trazabilidad del SG-SST.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {(user?.role === "admin" || user?.role === "consultor") && (
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Nueva acta</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de comite</Label>
                <Select value={tipoComite} onValueChange={(v) => setTipoComite(v as "vigia" | "copasst" | "convivencia")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vigia">Vigia SST</SelectItem>
                    <SelectItem value="copasst">COPASST</SelectItem>
                    <SelectItem value="convivencia">Convivencia Laboral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de reunion</Label>
                <Select value={tipoReunion} onValueChange={(v) => setTipoReunion(v as "ordinaria" | "extraordinaria" | "seguimiento")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinaria">Ordinaria</SelectItem>
                    <SelectItem value="extraordinaria">Extraordinaria</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Lugar</Label>
                <Input value={lugar} onChange={(e) => setLugar(e.target.value)} placeholder="Oficinas de la empresa" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Hora inicio</Label>
                <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Hora fin</Label>
                <Input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
              </div>
            </div>
            {/* Tabs: Manual vs Desde reunión */}
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="text-xs gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Crear acta manual</TabsTrigger>
                <TabsTrigger value="reunion" className="text-xs gap-1.5"><Video className="h-3.5 w-3.5" /> Desde reunion</TabsTrigger>
              </TabsList>

              {/* Tab 1: Manual (original flow) */}
              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Puntos a tratar (uno por linea)</Label>
                  <Textarea id="points" rows={5} value={points} onChange={(e) => setPoints(e.target.value)} placeholder={"Revision de inspecciones de seguridad\nSeguimiento a incidentes reportados\nEstado de capacitaciones SST\nRevision de EPP"} />
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleGenerate} disabled={generating || (members.length > 0 && !hasQuorum)} className="gap-2">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {generating ? "Generando con IA..." : "Generar Acta con IA"}
                  </Button>
                  {members.length > 0 && !hasQuorum && (
                    <span className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      Sin quorum ({presentCount}/{quorumRequired} requeridos)
                    </span>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: From meeting (Fireflies or audio) */}
              <TabsContent value="reunion" className="space-y-4 mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Fireflies import */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Video className="h-4 w-4 text-purple-600" />
                      Reunion virtual (Fireflies)
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Importa la transcripcion con identificacion de hablantes desde Fireflies.ai
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      disabled={loadingFireflies}
                      onClick={async () => {
                        setLoadingFireflies(true);
                        setFirefliesError("");
                        try {
                          const { data, error } = await supabase.functions.invoke("fetch-fireflies-transcripts", {
                            body: { action: "list" },
                          });
                          if (error) throw error;
                          if (data.error) {
                            setFirefliesError(data.message || data.error);
                            return;
                          }
                          setFirefliesMeetings(data.transcripts || []);
                          if ((data.transcripts || []).length === 0) {
                            toast.info("No se encontraron reuniones recientes en Fireflies");
                          }
                        } catch (err: any) {
                          setFirefliesError("No se pudo conectar con Fireflies. Verifica la API key.");
                        } finally {
                          setLoadingFireflies(false);
                        }
                      }}
                    >
                      {loadingFireflies ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
                      {loadingFireflies ? "Obteniendo reuniones..." : "Conectar con Fireflies"}
                    </Button>
                    {firefliesError && (
                      <p className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                        {firefliesError}
                      </p>
                    )}
                    {firefliesMeetings.length > 0 && (
                      <Select value={selectedMeeting} onValueChange={async (id) => {
                        setSelectedMeeting(id);
                        setLoadingTranscript(true);
                        try {
                          const { data, error } = await supabase.functions.invoke("fetch-fireflies-transcripts", {
                            body: { action: "get", transcript_id: id },
                          });
                          if (error) throw error;
                          const texto = data.transcript?.transcripcion_texto || "";
                          setTranscripcionPreview(texto);
                          setEditableTranscription(texto);
                          toast.success("Transcripcion importada");
                        } catch (err: any) {
                          toast.error("Error al importar transcripcion");
                        } finally {
                          setLoadingTranscript(false);
                        }
                      }}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Selecciona una reunion" />
                        </SelectTrigger>
                        <SelectContent>
                          {firefliesMeetings.map((m: any) => (
                            <SelectItem key={m.id} value={m.id} className="text-xs">
                              {m.title} — {m.date ? new Date(m.date).toLocaleDateString("es-CO") : ""}
                              {m.duration ? ` (${Math.round(m.duration / 60)} min)` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Audio upload */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mic className="h-4 w-4 text-blue-600" />
                      Grabacion de reunion
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sube una grabacion de audio. Se transcribe con Whisper (sin hablantes).
                    </p>
                    <label className="flex items-center justify-center gap-2 w-full h-9 rounded-md border border-input bg-background px-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground">
                      <Upload className="h-3.5 w-3.5" />
                      {audioFile ? audioFile.name : "Seleccionar audio"}
                      <input
                        type="file"
                        accept=".mp3,.wav,.m4a,.webm,.ogg"
                        className="hidden"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    {audioFile && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        disabled={transcribingAudio}
                        onClick={async () => {
                          if (!audioFile || !selectedEmpresa) return;
                          setTranscribingAudio(true);
                          try {
                            // Upload to storage
                            const ext = audioFile.name.split(".").pop();
                            const path = `comites/${selectedEmpresa}/audio_${Date.now()}.${ext}`;
                            await supabase.storage.from("documentos").upload(path, audioFile, { upsert: true });
                            const { data: urlData } = await supabase.storage.from("documentos").createSignedUrl(path, 3600);

                            // Transcribe
                            const { data, error } = await supabase.functions.invoke("transcribe-audio", {
                              body: { audio_url: urlData?.signedUrl, empresa_id: selectedEmpresa },
                            });
                            if (error) throw error;
                            const texto = data.transcripcion || data.texto || "";
                            setTranscripcionPreview(texto);
                            setEditableTranscription(texto);
                            toast.success("Audio transcrito exitosamente");
                          } catch (err: any) {
                            toast.error("Error al transcribir el audio");
                          } finally {
                            setTranscribingAudio(false);
                          }
                        }}
                      >
                        {transcribingAudio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
                        {transcribingAudio ? "Transcribiendo..." : "Transcribir audio"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Transcription preview + generate */}
                {(transcripcionPreview || loadingTranscript) && (
                  <div className="space-y-3">
                    {loadingTranscript ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Importando transcripcion...
                      </div>
                    ) : (
                      <>
                        <Label>Transcripcion (editable)</Label>
                        <Textarea
                          rows={8}
                          value={editableTranscription}
                          onChange={(e) => setEditableTranscription(e.target.value)}
                          className="font-mono text-xs"
                          placeholder="La transcripcion aparecera aqui..."
                        />
                        <Button
                          className="gap-2"
                          disabled={generating || !editableTranscription.trim()}
                          onClick={async () => {
                            if (!selectedComite || !editableTranscription.trim()) return;
                            setGenerating(true);
                            setGeneratedActa("");
                            try {
                              const { data, error } = await supabase.functions.invoke("generate-acta", {
                                body: {
                                  comite_id: selectedComite,
                                  tipo_reunion: tipoReunion,
                                  lugar,
                                  hora_inicio: horaInicio,
                                  hora_fin: horaFin,
                                  transcripcion: editableTranscription,
                                  asistentes_ids: Object.entries(attendance).filter(([, v]) => v).map(([k]) => k),
                                },
                              });
                              if (error) throw error;
                              setGeneratedActa(data.contenido);

                              // Reload actas
                              const updatedActas = await comitesService.actas(selectedComite);
                              setActas(updatedActas);

                              await logsService.log({
                                tipo: "crear",
                                modulo: "comites",
                                descripcion: `Acta generada desde transcripcion (${selectedMeeting ? "Fireflies" : "audio"}) para comité ${tipoComite}`,
                                empresa_id: selectedEmpresa || undefined,
                                usuario_id: user?.id,
                                metadata: { comite_id: selectedComite, tipo_comite: tipoComite, fuente: selectedMeeting ? "fireflies" : "audio" },
                              });

                              toast.success("Acta generada desde transcripcion");
                              setTranscripcionPreview("");
                              setEditableTranscription("");
                              setSelectedMeeting("");
                              setAudioFile(null);
                            } catch (err: any) {
                              toast.error(err.message || "Error al generar acta desde transcripcion");
                            } finally {
                              setGenerating(false);
                            }
                          }}
                        >
                          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          {generating ? "Generando acta..." : "Generar acta desde transcripcion"}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Attendance link generator */}
            {selectedComite && actas.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                  <Link2 className="h-4 w-4" />
                  Link de asistencia digital
                </div>
                <p className="text-xs text-blue-700">
                  Genera un link para que los integrantes confirmen su asistencia desde el celular (WhatsApp, email).
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-blue-700 border-blue-300"
                    onClick={() => {
                      const lastActa = actas[0];
                      if (!lastActa) return;
                      const empresa = empresas.find(e => e.id === selectedEmpresa);
                      // Generate individual links per member
                      const links = members.map(m => {
                        const token = generateAsistenciaToken(
                          selectedComite, lastActa.id, lastActa.fecha_reunion,
                          empresa?.razon_social || "Empresa", tipoComite, lugar, horaInicio,
                          7, m.nombre, m.id
                        );
                        return { nombre: m.nombre, url: `${window.location.origin}/asistencia-comite?t=${token}` };
                      });
                      setIndividualLinks(links);
                      // Also generate a general link (backward compat)
                      const generalToken = generateAsistenciaToken(
                        selectedComite, lastActa.id, lastActa.fecha_reunion,
                        empresa?.razon_social || "Empresa", tipoComite, lugar, horaInicio
                      );
                      const generalUrl = `${window.location.origin}/asistencia-comite?t=${generalToken}`;
                      setAsistenciaLink(generalUrl);
                      // Copy all individual links
                      const allText = links.map(l => `${l.nombre}: ${l.url}`).join("\n");
                      navigator.clipboard.writeText(allText).then(() => {
                        toast.success(`${links.length} links individuales copiados al portapapeles`);
                      }).catch(() => {
                        toast.info("Links generados — copialos manualmente");
                      });
                      logsService.log({
                        tipo: "generar",
                        modulo: "comites",
                        descripcion: `Links asistencia individuales generados para acta #${lastActa.numero_acta} (${links.length} integrantes)`,
                        empresa_id: selectedEmpresa || undefined,
                        usuario_id: user?.id,
                        metadata: { acta_id: lastActa.id, numero_acta: lastActa.numero_acta, tipo_comite: tipoComite, num_links: links.length },
                      });
                    }}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Generar link para ultima acta
                  </Button>
                </div>
                {individualLinks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-blue-800">Links individuales por integrante:</p>
                    {individualLinks.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-medium text-blue-700 w-28 truncate">{l.nombre}</span>
                        <input type="text" readOnly value={l.url}
                          className="flex-1 text-[10px] bg-white border rounded px-1.5 py-1 text-slate-500 select-all"
                          onClick={(e) => (e.target as HTMLInputElement).select()} />
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0"
                          onClick={() => { navigator.clipboard.writeText(l.url); toast.success(`Link de ${l.nombre} copiado`); }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 gap-1 text-blue-600"
                      onClick={() => {
                        const allText = individualLinks.map(l => `${l.nombre}: ${l.url}`).join("\n");
                        navigator.clipboard.writeText(allText);
                        toast.success("Todos los links copiados");
                      }}>
                      <Copy className="h-3 w-3" /> Copiar todos
                    </Button>
                  </div>
                )}
                {asistenciaLink && individualLinks.length === 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={asistenciaLink}
                      className="flex-1 text-xs bg-white border rounded px-2 py-1.5 text-slate-600 select-all"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(asistenciaLink);
                        toast.success("Link copiado");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Attendance + quorum panel */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Asistencia</CardTitle>
            {members.length > 0 && (
              <div className={cn(
                "flex items-center gap-2 mt-2 p-2 rounded-md text-sm font-medium",
                isSeguimiento ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : hasQuorum ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              )}>
                {isSeguimiento ? <CheckCircle2 className="h-4 w-4" />
                  : hasQuorum ? <CheckCircle2 className="h-4 w-4" />
                  : <AlertTriangle className="h-4 w-4" />}
                {isSeguimiento
                  ? `Seguimiento — sin quorum requerido (${presentCount}/${totalMembers})`
                  : hasQuorum
                  ? `Quorum alcanzado (${presentCount}/${totalMembers})`
                  : `Sin quorum: ${presentCount}/${totalMembers} (min. ${quorumRequired})`}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length > 0 ? members.map((m) => (
              <label key={m.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/40 cursor-pointer">
                <Checkbox
                  checked={!!attendance[m.id]}
                  onCheckedChange={(v) => setAttendance((a) => ({ ...a, [m.id]: !!v }))}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{m.nombre}</div>
                  <div className="text-xs text-muted-foreground">{m.rol_comite}{m.es_principal ? " (Principal)" : " (Suplente)"}</div>
                </div>
              </label>
            )) : (
              <p className="text-sm text-muted-foreground">
                {selectedEmpresa ? "No hay integrantes registrados para este comite." : "Selecciona una empresa."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {generatedActa && (
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" /> Acta generada
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              const printW = window.open("", "_blank");
              if (!printW) { toast.error("Habilita ventanas emergentes"); return; }
              const empresa = empresas.find(e => e.id === selectedEmpresa);
              const html = generatedActa
                .replace(/^### (.+)$/gm, "<h3>$1</h3>")
                .replace(/^## (.+)$/gm, "<h2>$1</h2>")
                .replace(/^# (.+)$/gm, "<h1>$1</h1>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
                .replace(/^---$/gm, "<hr>")
                .replace(/_________________________/g, "<div style='border-bottom:1px solid #333;width:250px;margin-top:40px'></div>")
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br>");
              const headerHTML = getExportHeaderHTML({
                title: "Acta de Reunión — Comité",
                moduleCode: "ACTA",
                empresaNombre: empresa?.razon_social,
                empresaNit: empresa?.nit,
              });
              printW.document.write(`<!DOCTYPE html><html><head><title>Acta — ${empresa?.razon_social || ""}</title>
<style>body{font-family:'Segoe UI',Arial,sans-serif;margin:40px 60px;font-size:12px;line-height:1.6;color:#1a1a1a;max-width:900px;margin:0 auto;padding:20px 40px}h1{font-size:18px;text-align:center}h2{font-size:14px;border-bottom:2px solid #333;padding-bottom:4px;margin-top:24px}h3{font-size:13px;margin-top:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:11px}th{background:#f3f4f6}hr{border:none;border-top:1px solid #ddd;margin:16px 0}li{margin-left:20px}@media print{@page{margin:20mm}}</style>
</head><body>${headerHTML}<p>${html}</p>${getExportFooterHTML()}</body></html>`);
              printW.document.close();
              injectLogoIntoWindow(printW, logo);
              setTimeout(() => printW.print(), 500);
            }}>
              <Printer className="h-4 w-4" /> Exportar PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-xs bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto">
              {generatedActa}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acta history */}
      {actas.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" /> Historial de actas ({actas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {actas.map((a) => (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        Acta #{a.numero_acta} — {a.tipo_reunion}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(a.fecha_reunion).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        {a.lugar ? ` — ${a.lugar}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {a.hay_quorum !== undefined && (
                      <Badge variant={a.hay_quorum ? "default" : "destructive"} className="text-[10px]">
                        {a.hay_quorum ? "Con quorum" : "Sin quorum"}
                      </Badge>
                    )}
                    {a.tipo_reunion === "seguimiento" && (
                      <Badge variant="outline" className="text-[10px] gap-1 text-blue-600 border-blue-300">
                        Seguimiento
                      </Badge>
                    )}
                    {a.generada_por_ia && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Sparkles className="h-3 w-3" /> IA
                      </Badge>
                    )}
                    {/* Signature status + overdue badge */}
                    {a.firmada ? (
                      <Badge variant="default" className="text-[10px] gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Firmada
                      </Badge>
                    ) : (
                      <>
                        {/* Overdue badge: > 7 days without signature */}
                        {Date.now() - new Date(a.fecha_reunion).getTime() > 7 * 24 * 60 * 60 * 1000 && (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <AlertTriangle className="h-3 w-3" /> Vencida
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-amber-600 border-amber-300"
                          onClick={async () => {
                            await supabase.from("actas_comite").update({
                              firmada: true,
                              fecha_firma: new Date().toISOString(),
                              estado: "firmada",
                            }).eq("id", a.id);
                            await logsService.log({
                              tipo: "actualizar",
                              modulo: "comites",
                              descripcion: `Acta #${a.numero_acta} marcada como firmada`,
                              empresa_id: selectedEmpresa || undefined,
                              usuario_id: user?.id,
                              metadata: { acta_id: a.id, numero_acta: a.numero_acta },
                            });
                            toast.success("Acta marcada como firmada");
                            comitesService.actas(a.comite_id).then(setActas);
                          }}
                        >
                          <PenLine className="h-3 w-3" /> Firmar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-orange-600"
                          onClick={async () => {
                            const empresa = empresas.find(e => e.id === selectedEmpresa);
                            const diasPendiente = Math.floor((Date.now() - new Date(a.fecha_reunion).getTime()) / (24 * 60 * 60 * 1000));
                            await logsService.log({
                              tipo: "recordatorio",
                              modulo: "comites",
                              descripcion: `Recordatorio de firma enviado: Acta #${a.numero_acta} del comité ${tipoComite} — ${diasPendiente} días pendiente`,
                              empresa_id: selectedEmpresa || undefined,
                              usuario_id: user?.id,
                              metadata: { acta_id: a.id, numero_acta: a.numero_acta, dias_pendiente: diasPendiente, tipo_comite: tipoComite },
                            });
                            toast.success(`Recordatorio registrado — Acta #${a.numero_acta} pendiente de firma hace ${diasPendiente} día(s)`);
                          }}
                        >
                          <Bell className="h-3 w-3" /> Recordar
                        </Button>
                      </>
                    )}
                    {/* Archive status */}
                    {a.archivada ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Archive className="h-3 w-3" /> Archivada
                      </Badge>
                    ) : a.firmada ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={async () => {
                          await supabase.from("actas_comite").update({
                            archivada: true,
                            fecha_archivado: new Date().toISOString(),
                          }).eq("id", a.id);
                          await logsService.log({
                            tipo: "actualizar",
                            modulo: "comites",
                            descripcion: `Acta #${a.numero_acta} archivada`,
                            empresa_id: selectedEmpresa || undefined,
                            usuario_id: user?.id,
                            metadata: { acta_id: a.id, numero_acta: a.numero_acta },
                          });
                          toast.success("Acta archivada");
                          comitesService.actas(a.comite_id).then(setActas);
                        }}
                      >
                        <Archive className="h-3 w-3" /> Archivar
                      </Button>
                    ) : null}
                    <Badge variant="outline" className="text-[10px]">
                      {a.estado}
                    </Badge>
                    {a.contenido_generado && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setGeneratedActa(a.contenido_generado)}
                      >
                        <FileText className="h-3 w-3" /> Ver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
