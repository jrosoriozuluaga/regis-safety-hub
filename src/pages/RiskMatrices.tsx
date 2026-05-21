import { useEffect, useState, useRef } from "react";
import { Wand2, Printer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { empresasService, matricesService, riesgosTipicosService, logsService } from "@/services";
import type { Empresa, MatrizRiesgo, RiesgoMatriz } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";
import { getExportHeaderHTML, getExportFooterHTML, injectLogoIntoWindow } from "@/lib/exportHeader";
import logo from "@/assets/regis-logo.jpeg";

function calcNP(nd: number, ne: number) { return nd * ne; }
function calcNR(nd: number, ne: number, nc: number) { return nd * ne * nc; }

function interpretAceptabilidad(nr: number): string {
  if (nr <= 20) return "aceptable";
  if (nr <= 120) return "mejorable";
  if (nr <= 500) return "no_aceptable_si";
  return "no_aceptable";
}

const aceptabilidadColor: Record<string, string> = {
  aceptable: "text-green-700 bg-green-50",
  mejorable: "text-yellow-700 bg-yellow-50",
  no_aceptable_si: "text-orange-700 bg-orange-50",
  no_aceptable: "text-red-700 bg-red-50",
};

export default function RiskMatrices() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [matrices, setMatrices] = useState<MatrizRiesgo[]>([]);
  const [selectedMatriz, setSelectedMatriz] = useState<string | null>(null);
  const [riesgos, setRiesgos] = useState<RiesgoMatriz[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "consultor") {
      empresasService.list().then(setEmpresas);
      matricesService.listAll().then(setMatrices);
    } else if (user?.empresa_id) {
      setSelectedEmpresa(user.empresa_id);
      matricesService.listByEmpresa(user.empresa_id).then(setMatrices);
    }
  }, [user]);

  const handleSelectMatriz = async (matrizId: string) => {
    setSelectedMatriz(matrizId);
    const data = await matricesService.getRiesgos(matrizId);
    setRiesgos(data);
  };

  const handleGenerate = async () => {
    if (!selectedEmpresa) { toast.error("Selecciona una empresa"); return; }
    setLoading(true);
    try {
      const empresa = empresas.find(e => e.id === selectedEmpresa);
      const newMatriz = await matricesService.create(selectedEmpresa);
      toast.success("Matriz creada. Cargando riesgos típicos del CIIU...");

      if (empresa) {
        const tipicos = await riesgosTipicosService.getByCiiu(empresa.ciiu_codigo);
        if (tipicos.length > 0) {
          const riesgosToInsert = tipicos.map((t: any) => ({
            proceso: "Operación general",
            actividad: "Actividades del CIIU " + empresa.ciiu_codigo,
            categoria_peligro: t.categoria_peligro || "General",
            descripcion_peligro: t.descripcion_peligro,
            fuente_peligro: t.fuente_peligro || "Actividad laboral",
            efectos_posibles: t.efectos_posibles || "Lesiones, enfermedades laborales",
            nivel_deficiencia: t.nivel_deficiencia_sugerido ?? 6,
            nivel_exposicion: t.nivel_exposicion_sugerido ?? 3,
            nivel_consecuencia: t.nivel_consecuencia_sugerido ?? 25,
            aceptabilidad: interpretAceptabilidad(
              (t.nivel_deficiencia_sugerido ?? 6) * (t.nivel_exposicion_sugerido ?? 3) * (t.nivel_consecuencia_sugerido ?? 25)
            ),
            control_fuente: t.control_tipico_fuente,
            control_medio: t.control_tipico_medio,
            control_individuo: t.control_tipico_individuo,
            medida_administrativa: t.medida_tipica_administrativa,
            medida_epp: t.medida_tipica_epp,
          }));
          await matricesService.insertRiesgos(newMatriz.id, riesgosToInsert);
          await logsService.log({
            tipo: "generar",
            modulo: "matrices",
            descripcion: `Matriz de riesgo GTC 45 generada con ${tipicos.length} riesgos para ${empresa.razon_social} (CIIU ${empresa.ciiu_codigo})`,
            empresa_id: selectedEmpresa || undefined,
            usuario_id: user?.id,
            metadata: { matriz_id: newMatriz.id, ciiu: empresa.ciiu_codigo, num_riesgos: tipicos.length },
          });
          toast.success(`${tipicos.length} riesgos típicos insertados para CIIU ${empresa.ciiu_codigo}`);
        } else {
          toast.info(`No hay riesgos pre-cargados para CIIU ${empresa.ciiu_codigo}`);
        }
      }

      const updated = user?.role === "cliente"
        ? await matricesService.listByEmpresa(selectedEmpresa)
        : await matricesService.listAll();
      setMatrices(updated);
      setSelectedMatriz(newMatriz.id);
      await handleSelectMatriz(newMatriz.id);
    } catch (err: any) {
      toast.error(err.message || "Error al crear la matriz");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const matrizInfo = matrices.find(m => m.id === selectedMatriz);
    const empresaInfo = empresas.find(e => e.id === selectedEmpresa) || empresas.find(e => e.razon_social === matrizInfo?.empresa_razon_social);

    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Habilita ventanas emergentes para exportar"); return; }

    const rows = riesgos.map(r => {
      const np = calcNP(r.nivel_deficiencia, r.nivel_exposicion);
      const nr = calcNR(r.nivel_deficiencia, r.nivel_exposicion, r.nivel_consecuencia);
      const acColor = r.aceptabilidad === "aceptable" ? "#16a34a"
        : r.aceptabilidad === "mejorable" ? "#ca8a04"
        : r.aceptabilidad === "no_aceptable_si" ? "#ea580c" : "#dc2626";
      return `<tr>
        <td>${r.categoria_peligro}</td>
        <td><strong>${r.descripcion_peligro}</strong></td>
        <td>${r.fuente_peligro}</td>
        <td>${r.efectos_posibles || "—"}</td>
        <td class="center">${r.nivel_deficiencia}</td>
        <td class="center">${r.nivel_exposicion}</td>
        <td class="center">${np}</td>
        <td class="center">${r.nivel_consecuencia}</td>
        <td class="center bold">${nr}</td>
        <td style="color:${acColor};font-weight:600">${r.aceptabilidad.replace(/_/g, " ")}</td>
        <td>${[r.control_fuente, r.control_medio, r.control_individuo].filter(Boolean).join("; ") || "—"}</td>
        <td>${[r.medida_administrativa, r.medida_epp].filter(Boolean).join("; ") || "—"}</td>
      </tr>`;
    }).join("");

    const headerHTML = getExportHeaderHTML({
      title: "Matriz de Identificación de Peligros, Evaluación y Valoración de Riesgos",
      moduleCode: "MAT-RIE",
      empresaNombre: empresaInfo?.razon_social || matrizInfo?.empresa_razon_social || "",
      empresaNit: empresaInfo?.nit,
      version: String(matrizInfo?.version || 1),
    });

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Matriz GTC 45 — ${empresaInfo?.razon_social || ""}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; font-size: 10px; color: #1e293b; max-width: 1200px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 16px; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #555; margin-top: 0; }
  .meta { display: flex; gap: 24px; margin-bottom: 12px; font-size: 11px; color: #333; }
  .meta span { background: #f3f4f6; padding: 3px 8px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #1e293b; color: white; padding: 6px 4px; text-align: left; font-size: 9px; text-transform: uppercase; }
  td { padding: 5px 4px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  tr:nth-child(even) { background: #f9fafb; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  @media print { body { margin: 10px; } @page { size: landscape; margin: 10mm; } }
</style></head><body>
${headerHTML}
<h1>Matriz de Identificación de Peligros, Evaluación y Valoración de Riesgos</h1>
<h2>Metodología GTC 45 — ${empresaInfo?.razon_social || matrizInfo?.empresa_razon_social || ""}</h2>
<div class="meta">
  <span><strong>CIIU:</strong> ${empresaInfo?.ciiu_codigo || "—"}</span>
  <span><strong>Estado:</strong> ${matrizInfo?.estado || "borrador"}</span>
</div>
<table>
  <thead><tr>
    <th>Categoría</th><th>Peligro</th><th>Fuente</th><th>Efectos</th>
    <th>ND</th><th>NE</th><th>NP</th><th>NC</th><th>NR</th>
    <th>Aceptabilidad</th><th>Controles existentes</th><th>Medidas</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
${getExportFooterHTML()}
</body></html>`);
    printWindow.document.close();
    injectLogoIntoWindow(printWindow, logo);
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div>
      <PageHeader
        title="Matrices de Riesgo GTC 45"
        description="Identificación de peligros, evaluación y valoración de riesgos."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Generar nueva matriz</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(user?.role === "admin" || user?.role === "consultor") && (
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.razon_social} — CIIU {e.ciiu_codigo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleGenerate} className="w-full gap-2" disabled={loading}>
              <Wand2 className="h-4 w-4" /> {loading ? "Generando..." : "Generar Matriz"}
            </Button>

            <div className="space-y-2 pt-4">
              <Label className="text-xs text-muted-foreground">Matrices existentes</Label>
              {matrices.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMatriz(m.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/40 transition-colors ${selectedMatriz === m.id ? "border-primary bg-primary/5" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">Matriz GTC 45 v{m.version}</div>
                    <div className="text-xs text-muted-foreground">{m.empresa_razon_social} — {m.estado}</div>
                  </div>
                </button>
              ))}
              {matrices.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay matrices generadas aún.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2" ref={printRef}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Detalle de riesgos</CardTitle>
            {riesgos.length > 0 && (
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Exportar PDF
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {riesgos.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peligro</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead className="text-center">ND</TableHead>
                      <TableHead className="text-center">NE</TableHead>
                      <TableHead className="text-center">NP</TableHead>
                      <TableHead className="text-center">NC</TableHead>
                      <TableHead className="text-center">NR</TableHead>
                      <TableHead>Aceptabilidad</TableHead>
                      <TableHead>Controles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riesgos.map((r) => {
                      const np = calcNP(r.nivel_deficiencia, r.nivel_exposicion);
                      const nr = calcNR(r.nivel_deficiencia, r.nivel_exposicion, r.nivel_consecuencia);
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{r.descripcion_peligro}</div>
                            <div className="text-xs text-muted-foreground">{r.categoria_peligro}</div>
                          </TableCell>
                          <TableCell className="text-sm">{r.fuente_peligro}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.nivel_deficiencia}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.nivel_exposicion}</TableCell>
                          <TableCell className="text-center tabular-nums">{np}</TableCell>
                          <TableCell className="text-center tabular-nums">{r.nivel_consecuencia}</TableCell>
                          <TableCell className="text-center tabular-nums font-semibold">{nr}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${aceptabilidadColor[r.aceptabilidad] || ""}`}>
                              {r.aceptabilidad.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {[r.control_fuente, r.control_medio, r.control_individuo].filter(Boolean).join("; ") || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {selectedMatriz ? "Esta matriz no tiene riesgos aún." : "Selecciona una matriz para ver sus riesgos."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
