import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Stethoscope, FileText, ClipboardList, Sparkles } from "lucide-react";
import { openStorageFile } from "@/lib/utils";
import type { Trabajador, ExamenMedico } from "@/types/domain";

const conceptoColor: Record<string, string> = {
  apto: "text-green-700 bg-green-50",
  apto_con_restricciones: "text-yellow-700 bg-yellow-50",
  no_apto: "text-red-700 bg-red-50",
  aplazado: "text-gray-700 bg-gray-50",
};

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<Trabajador | null>(null);
  const [empresa, setEmpresa] = useState<string>("");
  const [examenes, setExamenes] = useState<ExamenMedico[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      // Load worker
      const { data: w } = await supabase
        .from("trabajadores")
        .select("*, empresas_cliente(razon_social)")
        .eq("id", id)
        .single();
      if (w) {
        setWorker(w);
        setEmpresa((w as any).empresas_cliente?.razon_social ?? "");
      }

      // Load exams by worker document (cedula)
      if (w?.cedula) {
        const { data: exams } = await supabase
          .from("examenes_medicos")
          .select("*")
          .eq("trabajador_documento", w.cedula)
          .order("fecha_examen", { ascending: false });
        setExamenes(exams ?? []);
      }

      // Load activity logs mentioning this worker
      const { data: logData } = await supabase
        .from("logs_actividad")
        .select("*")
        .or(`metadata->>trabajador_id.eq.${id},descripcion.ilike.%${w?.nombre ?? ""}%`)
        .order("created_at", { ascending: false })
        .limit(20);
      setLogs(logData ?? []);

      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="space-y-6">
        <PageHeader title="Trabajador no encontrado" description="El trabajador solicitado no existe." />
        <Button variant="outline" onClick={() => navigate("/trabajadores")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver a trabajadores
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={worker.nombre}
        description={`${worker.cargo || "Sin cargo"} — ${empresa}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/trabajadores")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        }
      />

      {/* Worker info card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" /> Datos del trabajador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Cedula:</span> <span className="font-medium tabular-nums">{worker.cedula}</span></div>
            <div><span className="text-muted-foreground">Cargo:</span> <span className="font-medium">{worker.cargo || "—"}</span></div>
            <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{worker.area || "—"}</span></div>
            <div><span className="text-muted-foreground">Empresa:</span> <span className="font-medium">{empresa}</span></div>
            {worker.fecha_ingreso && (
              <div><span className="text-muted-foreground">Ingreso:</span> <span className="font-medium">{new Date(worker.fecha_ingreso).toLocaleDateString("es-CO")}</span></div>
            )}
            <div>
              <span className="text-muted-foreground">Estado:</span>{" "}
              <Badge variant={worker.activo ? "default" : "secondary"} className={worker.activo ? "bg-green-100 text-green-800" : ""}>
                {worker.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="examenes">
            <TabsList>
              <TabsTrigger value="examenes" className="gap-1.5">
                <Stethoscope className="h-3.5 w-3.5" /> Examenes medicos
                {examenes.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{examenes.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="historial" className="gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" /> Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="examenes" className="mt-4">
              {examenes.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Concepto</TableHead>
                            <TableHead>IA</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examenes.map((ex) => (
                            <TableRow key={ex.id}>
                              <TableCell className="text-sm">{(ex.tipo_examen || "—").replace(/_/g, " ")}</TableCell>
                              <TableCell className="tabular-nums">{new Date(ex.fecha_examen).toLocaleDateString("es-CO")}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${conceptoColor[ex.concepto_aptitud] || ""}`}>
                                  {(ex.concepto_aptitud || "pendiente").replace(/_/g, " ")}
                                </span>
                              </TableCell>
                              <TableCell>
                                {ex.procesado_por_ia && <Sparkles className="h-3.5 w-3.5 text-green-600" />}
                              </TableCell>
                              <TableCell>
                                {ex.archivo_url && (
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => openStorageFile(ex.archivo_url!)}>
                                    <FileText className="h-3.5 w-3.5" /> Ver PDF
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay examenes medicos registrados para este trabajador.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="historial" className="mt-4">
              {logs.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Descripcion</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="tabular-nums text-xs">{new Date(log.created_at).toLocaleString("es-CO")}</TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px]">{log.tipo}</Badge></TableCell>
                              <TableCell className="text-sm">{log.descripcion}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No hay registros de actividad para este trabajador.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
