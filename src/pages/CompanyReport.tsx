import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { empresasService, cumplimientoService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Printer,
  Loader2,
  Building2,
  Users,
  FileText,
  ShieldAlert,
  Stethoscope,
  ClipboardCheck,
  Siren,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Empresa } from "@/types/domain";
import { getExportHeaderHTML, getExportFooterHTML, getExportStyles, injectLogoIntoWindow } from "@/lib/exportHeader";
import { toast } from "sonner";
import logo from "@/assets/regis-logo.jpeg";

type ReportData = {
  empresa: Empresa;
  trabajadoresActivos: number;
  trabajadoresTotal: number;
  pilaAprobadas: number;
  pilaEnProceso: number;
  pilaTotal: number;
  examenesTotal: number;
  examenesConRestricciones: number;
  matricesCount: number;
  comitesCount: number;
  actasCount: number;
  planesCount: number;
  cumplimientoPuntaje: number | null;
  cumplimientoFecha: string | null;
};

export default function CompanyReport() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("empresa");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedId, setSelectedId] = useState<string>(preselectedId || "");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    empresasService.list().then((data) => {
      setEmpresas(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;

    async function loadReport() {
      setLoading(true);
      try {
        const [
          empresa,
          { count: trabajadoresActivos },
          { count: trabajadoresTotal },
          { data: pilaData },
          { count: examenesTotal },
          { count: examenesRestr },
          { count: matricesCount },
          { count: comitesCount },
          { count: actasCount },
          { count: planesCount },
          cumplimiento,
        ] = await Promise.all([
          empresasService.getById(selectedId),
          supabase.from("trabajadores").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId).eq("activo", true),
          supabase.from("trabajadores").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          supabase.from("pila_records").select("estado").eq("empresa_id", selectedId),
          supabase.from("examenes_medicos").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          supabase.from("examenes_medicos").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId).eq("concepto_aptitud", "apto_con_restricciones"),
          supabase.from("matrices_riesgo").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          supabase.from("comites").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          supabase.from("actas_comite").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          supabase.from("planes_emergencia").select("*", { count: "exact", head: true }).eq("empresa_id", selectedId),
          cumplimientoService.getLatest(selectedId),
        ]);

        if (!mounted || !empresa) return;

        const pilas = pilaData ?? [];
        setReport({
          empresa,
          trabajadoresActivos: trabajadoresActivos ?? 0,
          trabajadoresTotal: trabajadoresTotal ?? 0,
          pilaAprobadas: pilas.filter((p: any) => p.estado === "aprobada").length,
          pilaEnProceso: pilas.filter((p: any) => ["cargada", "validada"].includes(p.estado)).length,
          pilaTotal: pilas.length,
          examenesTotal: examenesTotal ?? 0,
          examenesConRestricciones: examenesRestr ?? 0,
          matricesCount: matricesCount ?? 0,
          comitesCount: comitesCount ?? 0,
          actasCount: actasCount ?? 0,
          planesCount: planesCount ?? 0,
          cumplimientoPuntaje: cumplimiento?.puntaje_total ?? null,
          cumplimientoFecha: cumplimiento?.fecha_evaluacion ?? null,
        });
      } catch (err) {
        console.error("Error loading report:", err);
        toast.error("Error al cargar el informe. Intenta de nuevo.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReport();
    return () => { mounted = false; };
  }, [selectedId]);

  const handlePrint = () => {
    if (!report) return;

    const { empresa } = report;

    const headerHTML = getExportHeaderHTML({
      title: "Informe SG-SST",
      moduleCode: "INF-EMP",
      empresaNombre: empresa.razon_social,
      empresaNit: empresa.nit,
    });
    const footerHTML = getExportFooterHTML();
    const styles = getExportStyles();

    const complianceBadge =
      report.cumplimientoPuntaje !== null
        ? report.cumplimientoPuntaje >= 86
          ? "Aceptable"
          : report.cumplimientoPuntaje >= 60
          ? "Moderadamente aceptable"
          : "Crítico"
        : null;

    const moduleRows = [
      { label: "Trabajadores", count: `${report.trabajadoresActivos} / ${report.trabajadoresTotal}`, obs: report.trabajadoresTotal - report.trabajadoresActivos > 0 ? `${report.trabajadoresTotal - report.trabajadoresActivos} retirado(s)` : "Todos activos", ok: report.trabajadoresActivos > 0 },
      { label: "PILA", count: `${report.pilaAprobadas} / ${report.pilaTotal}`, obs: report.pilaTotal - report.pilaAprobadas > 0 ? `${report.pilaTotal - report.pilaAprobadas} pendiente(s)` : "Al día", ok: report.pilaAprobadas > 0 },
      { label: "Exámenes Médicos", count: String(report.examenesTotal), obs: report.examenesConRestricciones > 0 ? `${report.examenesConRestricciones} con restricciones` : "Sin restricciones", ok: report.examenesTotal > 0 },
      { label: "Matrices de Riesgo", count: String(report.matricesCount), obs: report.matricesCount > 0 ? "GTC 45 generada" : "Pendiente", ok: report.matricesCount > 0 },
      { label: "Comités", count: `${report.comitesCount} comités / ${report.actasCount} actas`, obs: report.comitesCount > 0 ? "Configurado" : "Pendiente", ok: report.comitesCount > 0 },
      { label: "Planes de Emergencia", count: String(report.planesCount), obs: report.planesCount > 0 ? "Generado" : "Pendiente", ok: report.planesCount > 0 },
    ];

    const moduleTableRows = moduleRows
      .map(
        (r) => `
        <tr>
          <td>${r.label}</td>
          <td style="text-align:center">${r.ok ? "✔" : "○"}</td>
          <td style="text-align:center">${r.count}</td>
          <td>${r.obs}</td>
        </tr>`
      )
      .join("");

    const complianceSection =
      report.cumplimientoPuntaje !== null
        ? `
      <h2>Cumplimiento Resolución 0312/2019</h2>
      <p>
        <strong>Puntaje:</strong> ${report.cumplimientoPuntaje}% —
        <strong>${complianceBadge}</strong>
        ${report.cumplimientoFecha ? ` | Evaluación: ${new Date(report.cumplimientoFecha).toLocaleDateString("es-CO")}` : ""}
      </p>
      `
        : "";

    const content = `
      <h2>Informe SG-SST — ${empresa.razon_social}</h2>
      <p style="color:#64748b;font-size:13px;">
        NIT: ${empresa.nit} | CIIU: ${empresa.ciiu_codigo} | ${empresa.ciudad}
      </p>

      ${complianceSection}

      <h2>Estado por Módulo</h2>
      <table>
        <thead>
          <tr>
            <th>Módulo</th>
            <th style="text-align:center">Estado</th>
            <th style="text-align:center">Registros</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>${moduleTableRows}</tbody>
      </table>

      <h2>Información de la Empresa</h2>
      <table>
        <tbody>
          <tr><th>Razón Social</th><td>${empresa.razon_social}</td><th>NIT</th><td>${empresa.nit}</td></tr>
          <tr><th>Código CIIU</th><td>${empresa.ciiu_codigo}</td><th>Ciudad</th><td>${empresa.ciudad}</td></tr>
          <tr><th>Nivel de Riesgo ARL</th><td>${empresa.nivel_riesgo_arl}</td><th>N. Trabajadores</th><td>${empresa.num_trabajadores}</td></tr>
          <tr><th>Contacto</th><td>${empresa.nombre_contacto}</td><th>Email</th><td>${empresa.email_contacto}</td></tr>
          <tr><th>Teléfono</th><td colspan="3">${empresa.telefono || "—"}</td></tr>
        </tbody>
      </table>
    `;

    const w = window.open("", "_blank");
    if (!w) {
      toast.error("No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada.");
      return;
    }

    w.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Informe SG-SST — ${empresa.razon_social}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${headerHTML}
          ${content}
          ${footerHTML}
        </body>
      </html>
    `);
    w.document.close();
    injectLogoIntoWindow(w, logo);
    setTimeout(() => w.print(), 400);
  };

  const today = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Controls — hidden in print */}
      <div className="print:hidden space-y-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Informe por Empresa
            </h1>
            <p className="text-muted-foreground mt-1">
              Genera un reporte PDF del estado del SG-SST.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecciona empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} disabled={!report || loading} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir / PDF
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !report ? (
        <div className="text-center py-20 text-muted-foreground">
          Selecciona una empresa para generar el informe.
        </div>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="border-b pb-4 print:pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logo} alt="Regis Colombia" className="h-14 w-14 rounded-md hidden print:block" />
                <div>
                  <h2 className="text-xl font-bold print:text-2xl">
                    Informe SG-SST — {report.empresa.razon_social}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    NIT: {report.empresa.nit} | CIIU: {report.empresa.ciiu_codigo} | {report.empresa.ciudad}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generado el {today} por REGIS COLOMBIA — Plataforma SG-SST
                  </p>
                  <p className="text-xs text-muted-foreground hidden print:block">
                    Código: DOC-INF-{report.empresa.nit?.replace(/[^0-9]/g, "").slice(0, 9) || "000"}-001 | Versión: 1.0
                  </p>
                </div>
              </div>
              <img src={logo} alt="Regis Colombia" className="h-12 w-12 rounded-md print:hidden" />
            </div>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <Card className="print:shadow-none print:border">
              <CardContent className="pt-4 text-center print:py-2">
                <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                <div className="text-2xl font-bold print:text-xl">{report.trabajadoresActivos}</div>
                <p className="text-xs text-muted-foreground">Trabajadores activos</p>
              </CardContent>
            </Card>
            <Card className="print:shadow-none print:border">
              <CardContent className="pt-4 text-center print:py-2">
                <FileText className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-2xl font-bold print:text-xl">{report.pilaAprobadas}/{report.pilaTotal}</div>
                <p className="text-xs text-muted-foreground">PILAs cargadas</p>
              </CardContent>
            </Card>
            <Card className="print:shadow-none print:border">
              <CardContent className="pt-4 text-center print:py-2">
                <Stethoscope className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <div className="text-2xl font-bold print:text-xl">{report.examenesTotal}</div>
                <p className="text-xs text-muted-foreground">Exámenes médicos</p>
              </CardContent>
            </Card>
            <Card className="print:shadow-none print:border">
              <CardContent className="pt-4 text-center print:py-2">
                <ClipboardCheck className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
                <div className="text-2xl font-bold print:text-xl">
                  {report.cumplimientoPuntaje !== null ? `${report.cumplimientoPuntaje}%` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">Cumplimiento 0312</p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance detail */}
          {report.cumplimientoPuntaje !== null && (
            <Card className="print:shadow-none print:border">
              <CardHeader className="pb-2 print:pb-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Cumplimiento Resolución 0312/2019
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={report.cumplimientoPuntaje} className="flex-1 h-3" />
                  <span className="text-lg font-bold tabular-nums">{report.cumplimientoPuntaje}%</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={
                    report.cumplimientoPuntaje >= 86 ? "default" :
                    report.cumplimientoPuntaje >= 60 ? "secondary" : "destructive"
                  }>
                    {report.cumplimientoPuntaje >= 86 ? "Aceptable" :
                     report.cumplimientoPuntaje >= 60 ? "Moderadamente aceptable" : "Crítico"}
                  </Badge>
                  {report.cumplimientoFecha && (
                    <span className="text-xs text-muted-foreground">
                      Evaluación: {new Date(report.cumplimientoFecha).toLocaleDateString("es-CO")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Module status table */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2 print:pb-1">
              <CardTitle className="text-base">Estado por Módulo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Registros</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" /> Trabajadores
                    </TableCell>
                    <TableCell className="text-center">
                      {report.trabajadoresActivos > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.trabajadoresActivos} / {report.trabajadoresTotal}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.trabajadoresTotal - report.trabajadoresActivos > 0
                        ? `${report.trabajadoresTotal - report.trabajadoresActivos} retirado(s)`
                        : "Todos activos"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" /> PILA
                    </TableCell>
                    <TableCell className="text-center">
                      {report.pilaAprobadas > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.pilaAprobadas} / {report.pilaTotal}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.pilaTotal - report.pilaAprobadas > 0
                        ? `${report.pilaTotal - report.pilaAprobadas} pendiente(s)`
                        : "Al día"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" /> Exámenes Médicos
                    </TableCell>
                    <TableCell className="text-center">
                      {report.examenesTotal > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.examenesTotal}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.examenesConRestricciones > 0
                        ? `${report.examenesConRestricciones} con restricciones`
                        : "Sin restricciones"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground" /> Matrices de Riesgo
                    </TableCell>
                    <TableCell className="text-center">
                      {report.matricesCount > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.matricesCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.matricesCount > 0 ? "GTC 45 generada" : "Pendiente"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" /> Comités
                    </TableCell>
                    <TableCell className="text-center">
                      {report.comitesCount > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.comitesCount} / {report.actasCount} actas</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.comitesCount > 0 ? "Configurado" : "Pendiente"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium flex items-center gap-2">
                      <Siren className="h-4 w-4 text-muted-foreground" /> Planes de Emergencia
                    </TableCell>
                    <TableCell className="text-center">
                      {report.planesCount > 0
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                        : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{report.planesCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.planesCount > 0 ? "Generado" : "Pendiente"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Company info */}
          <Card className="print:shadow-none print:border">
            <CardHeader className="pb-2 print:pb-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Razón Social</span>
                  <p className="font-medium">{report.empresa.razon_social}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">NIT</span>
                  <p className="font-medium font-mono">{report.empresa.nit}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Código CIIU</span>
                  <p className="font-medium">{report.empresa.ciiu_codigo}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ciudad</span>
                  <p className="font-medium">{report.empresa.ciudad}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nivel de Riesgo ARL</span>
                  <p className="font-medium">{report.empresa.nivel_riesgo_arl}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">N. Trabajadores</span>
                  <p className="font-medium">{report.empresa.num_trabajadores}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contacto</span>
                  <p className="font-medium">{report.empresa.nombre_contacto}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{report.empresa.email_contacto}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono</span>
                  <p className="font-medium">{report.empresa.telefono || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Print footer */}
          <div className="hidden print:block text-center text-xs text-muted-foreground border-t pt-2 mt-4">
            <p>REGIS COLOMBIA — Plataforma SG-SST | www.regiscolombia.com</p>
            <p>Este informe fue generado automáticamente el {today}</p>
          </div>
        </div>
      )}
    </div>
  );
}
