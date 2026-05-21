import React, { useEffect, useState, useRef } from "react";
import { Wand2, Printer, Plus, Pencil, Save, X, Trash2, Upload, CheckCircle2, FileText, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { empresasService, matricesService, riesgosTipicosService, logsService } from "@/services";
import { supabase } from "@/lib/supabase";
import type { Empresa, MatrizRiesgo, RiesgoMatriz } from "@/types/domain";
import { useAuth } from "@/context/AuthContext";
import { getExportHeaderHTML, getExportFooterHTML, injectLogoIntoWindow } from "@/lib/exportHeader";
import logo from "@/assets/regis-logo.jpeg";

/* ─── GTC 45 helpers ─── */

function calcNP(nd: number, ne: number) { return nd * ne; }
function calcNR(nd: number, ne: number, nc: number) { return nd * ne * nc; }

function interpretNR(nr: number): string {
  if (nr >= 600) return "I";
  if (nr >= 150) return "II";
  if (nr >= 40) return "III";
  return "IV";
}

function interpretAceptabilidad(nr: number): string {
  if (nr <= 20) return "aceptable";
  if (nr <= 120) return "mejorable";
  if (nr <= 500) return "no_aceptable_si";
  return "no_aceptable";
}

const aceptabilidadLabel: Record<string, string> = {
  aceptable: "Aceptable",
  mejorable: "Mejorable",
  no_aceptable_si: "No Aceptable",
  no_aceptable: "No Aceptable",
};

const aceptabilidadColor: Record<string, string> = {
  aceptable: "bg-green-100 text-green-800 border-green-300",
  mejorable: "bg-yellow-100 text-yellow-800 border-yellow-300",
  no_aceptable_si: "bg-orange-100 text-orange-800 border-orange-300",
  no_aceptable: "bg-red-100 text-red-800 border-red-300",
};

const ND_OPTIONS = [
  { value: 0, label: "0 – No deficiente" },
  { value: 2, label: "2 – Bajo" },
  { value: 6, label: "6 – Medio" },
  { value: 10, label: "10 – Alto" },
];
const NE_OPTIONS = [
  { value: 1, label: "1 – Esporádica" },
  { value: 2, label: "2 – Ocasional" },
  { value: 3, label: "3 – Frecuente" },
  { value: 4, label: "4 – Continua" },
];
const NC_OPTIONS = [
  { value: 10, label: "10 – Leve" },
  { value: 25, label: "25 – Grave" },
  { value: 60, label: "60 – Muy grave" },
  { value: 100, label: "100 – Mortal" },
];

/* ─── empty row template ─── */

function emptyRiesgo(matrizId: string): Partial<RiesgoMatriz> & { matriz_id: string; _isNew?: boolean } {
  return {
    matriz_id: matrizId,
    categoria_peligro: "",
    descripcion_peligro: "",
    fuente_peligro: "",
    efectos_posibles: "",
    nivel_deficiencia: 6,
    nivel_exposicion: 3,
    nivel_consecuencia: 25,
    aceptabilidad: "no_aceptable_si",
    control_fuente: "",
    control_medio: "",
    control_individuo: "",
    medida_administrativa: "",
    medida_epp: "",
    _isNew: true,
  };
}

/* ─── component ─── */

export default function RiskMatrices() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [matrices, setMatrices] = useState<MatrizRiesgo[]>([]);
  const [selectedMatriz, setSelectedMatriz] = useState<string | null>(null);
  const [riesgos, setRiesgos] = useState<RiesgoMatriz[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<RiesgoMatriz>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState<ReturnType<typeof emptyRiesgo> | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingArl, setUploadingArl] = useState(false);
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
    setEditingId(null);
    setAddingNew(false);
    setNewDraft(null);
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

  /* ─── Edit handlers ─── */

  const startEdit = (r: RiesgoMatriz) => {
    setEditingId(r.id);
    setAddingNew(false);
    setNewDraft(null);
    setEditDraft({
      descripcion_peligro: r.descripcion_peligro,
      fuente_peligro: r.fuente_peligro,
      categoria_peligro: r.categoria_peligro,
      efectos_posibles: r.efectos_posibles,
      nivel_deficiencia: r.nivel_deficiencia,
      nivel_exposicion: r.nivel_exposicion,
      nivel_consecuencia: r.nivel_consecuencia,
      control_fuente: r.control_fuente || "",
      control_medio: r.control_medio || "",
      control_individuo: r.control_individuo || "",
      medida_administrativa: r.medida_administrativa || "",
      medida_epp: r.medida_epp || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async (riesgoId: string) => {
    setSavingId(riesgoId);
    try {
      const nd = editDraft.nivel_deficiencia ?? 0;
      const ne = editDraft.nivel_exposicion ?? 1;
      const nc = editDraft.nivel_consecuencia ?? 10;
      const nr = calcNR(nd, ne, nc);
      const updates = {
        ...editDraft,
        aceptabilidad: interpretAceptabilidad(nr),
      };
      await matricesService.updateRiesgo(riesgoId, updates);
      setRiesgos(prev => prev.map(r => r.id === riesgoId ? { ...r, ...updates } as RiesgoMatriz : r));
      setEditingId(null);
      setEditDraft({});
      toast.success("Riesgo actualizado");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setSavingId(null);
    }
  };

  /* ─── Add new row ─── */

  const startAddNew = () => {
    if (!selectedMatriz) return;
    setAddingNew(true);
    setEditingId(null);
    setNewDraft(emptyRiesgo(selectedMatriz));
  };

  const cancelAddNew = () => {
    setAddingNew(false);
    setNewDraft(null);
  };

  const saveNewRiesgo = async () => {
    if (!newDraft || !selectedMatriz) return;
    if (!newDraft.descripcion_peligro?.trim()) {
      toast.error("La descripción del peligro es obligatoria");
      return;
    }
    setSavingId("__new__");
    try {
      const nd = newDraft.nivel_deficiencia ?? 6;
      const ne = newDraft.nivel_exposicion ?? 3;
      const nc = newDraft.nivel_consecuencia ?? 25;
      const nr = calcNR(nd, ne, nc);
      const row = {
        matriz_id: selectedMatriz,
        categoria_peligro: newDraft.categoria_peligro || "General",
        descripcion_peligro: newDraft.descripcion_peligro || "",
        fuente_peligro: newDraft.fuente_peligro || "",
        efectos_posibles: newDraft.efectos_posibles || "",
        nivel_deficiencia: nd,
        nivel_exposicion: ne,
        nivel_consecuencia: nc,
        aceptabilidad: interpretAceptabilidad(nr),
        control_fuente: newDraft.control_fuente || null,
        control_medio: newDraft.control_medio || null,
        control_individuo: newDraft.control_individuo || null,
        medida_administrativa: newDraft.medida_administrativa || null,
        medida_epp: newDraft.medida_epp || null,
      };
      const created = await matricesService.insertRiesgo(row);
      setRiesgos(prev => [...prev, created]);
      setAddingNew(false);
      setNewDraft(null);
      toast.success("Nuevo riesgo agregado a la matriz");
    } catch (err: any) {
      toast.error(err.message || "Error al agregar riesgo");
    } finally {
      setSavingId(null);
    }
  };

  /* ─── Print/Export ─── */

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

  /* ─── Inline edit row renderer ─── */

  function renderEditableRow(
    draft: Partial<RiesgoMatriz>,
    setDraft: (fn: (prev: Partial<RiesgoMatriz>) => Partial<RiesgoMatriz>) => void,
    onSave: () => void,
    onCancel: () => void,
    saving: boolean,
    isNew: boolean,
  ) {
    const nd = draft.nivel_deficiencia ?? 6;
    const ne = draft.nivel_exposicion ?? 3;
    const nc = draft.nivel_consecuencia ?? 25;
    const np = calcNP(nd, ne);
    const nr = calcNR(nd, ne, nc);
    const acept = interpretAceptabilidad(nr);
    const nivel = interpretNR(nr);

    return (
      <TableRow className="bg-primary/5">
        <TableCell className="align-top">
          <Input
            value={draft.descripcion_peligro || ""}
            onChange={e => setDraft(d => ({ ...d, descripcion_peligro: e.target.value }))}
            placeholder="Descripción del peligro"
            className="text-sm mb-1"
          />
          <Input
            value={draft.categoria_peligro || ""}
            onChange={e => setDraft(d => ({ ...d, categoria_peligro: e.target.value }))}
            placeholder="Categoría"
            className="text-xs"
          />
        </TableCell>
        <TableCell className="align-top">
          <Input
            value={draft.fuente_peligro || ""}
            onChange={e => setDraft(d => ({ ...d, fuente_peligro: e.target.value }))}
            placeholder="Fuente del peligro"
            className="text-sm"
          />
        </TableCell>
        <TableCell className="align-top">
          <Select
            value={String(nd)}
            onValueChange={v => setDraft(d => ({ ...d, nivel_deficiencia: Number(v) }))}
          >
            <SelectTrigger className="w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ND_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="align-top">
          <Select
            value={String(ne)}
            onValueChange={v => setDraft(d => ({ ...d, nivel_exposicion: Number(v) }))}
          >
            <SelectTrigger className="w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NE_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-center tabular-nums font-medium">{np}</TableCell>
        <TableCell className="align-top">
          <Select
            value={String(nc)}
            onValueChange={v => setDraft(d => ({ ...d, nivel_consecuencia: Number(v) }))}
          >
            <SelectTrigger className="w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NC_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </TableCell>
        <TableCell className="text-center tabular-nums font-bold">{nr}</TableCell>
        <TableCell>
          <Badge variant="outline" className={`${aceptabilidadColor[acept] || ""} text-xs`}>
            {nivel} – {aceptabilidadLabel[acept] || acept}
          </Badge>
        </TableCell>
        <TableCell className="align-top">
          <Textarea
            value={[draft.control_fuente, draft.control_medio, draft.control_individuo].filter(Boolean).join("\n") || ""}
            onChange={e => {
              const lines = e.target.value.split("\n");
              setDraft(d => ({ ...d, control_fuente: lines[0] || "", control_medio: lines[1] || "", control_individuo: lines[2] || "" }));
            }}
            placeholder="Controles (uno por línea)"
            className="text-xs min-h-[60px]"
          />
        </TableCell>
        <TableCell className="align-top">
          <div className="flex gap-1">
            <Button size="sm" variant="default" onClick={onSave} disabled={saving} className="gap-1">
              <Save className="h-3 w-3" /> {saving ? "..." : "Guardar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  /* ─── Render ─── */

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
                    <div className="text-sm font-medium truncate flex items-center gap-2">
                      Matriz GTC 45 v{m.version}
                      {m.aprobada_por_arl && (
                        <Badge className="text-[9px] px-1.5 py-0 bg-green-600 shrink-0">ARL</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{m.empresa_razon_social} — {m.estado}</div>
                  </div>
                </button>
              ))}
              {matrices.length === 0 && (
                <EmptyState
                  icon={ShieldAlert}
                  title="Sin matrices de riesgo"
                  description="Selecciona una empresa y genera tu primera matriz GTC 45."
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2" ref={printRef}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Detalle de riesgos</CardTitle>
            <div className="flex gap-2">
              {selectedMatriz && (
                <Button variant="outline" size="sm" className="gap-1" onClick={startAddNew} disabled={addingNew}>
                  <Plus className="h-4 w-4" /> Agregar riesgo
                </Button>
              )}
              {riesgos.length > 0 && (
                <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                  <Printer className="h-4 w-4" /> Exportar PDF
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {riesgos.length > 0 || addingNew ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Peligro</TableHead>
                      <TableHead className="min-w-[120px]">Fuente</TableHead>
                      <TableHead className="text-center w-16">ND</TableHead>
                      <TableHead className="text-center w-16">NE</TableHead>
                      <TableHead className="text-center w-12">NP</TableHead>
                      <TableHead className="text-center w-16">NC</TableHead>
                      <TableHead className="text-center w-12">NR</TableHead>
                      <TableHead className="w-28">Nivel</TableHead>
                      <TableHead className="min-w-[150px]">Controles</TableHead>
                      <TableHead className="w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* New row at top when adding */}
                    {addingNew && newDraft && renderEditableRow(
                      newDraft,
                      (fn) => setNewDraft(prev => prev ? { ...prev, ...fn(prev) } as any : prev),
                      saveNewRiesgo,
                      cancelAddNew,
                      savingId === "__new__",
                      true,
                    )}

                    {riesgos.map((r) => {
                      if (editingId === r.id) {
                        return (
                          <React.Fragment key={r.id}>
                            {renderEditableRow(
                              editDraft,
                              (fn) => setEditDraft(prev => fn(prev)),
                              () => saveEdit(r.id),
                              cancelEdit,
                              savingId === r.id,
                              false,
                            )}
                          </React.Fragment>
                        );
                      }

                      const np = calcNP(r.nivel_deficiencia, r.nivel_exposicion);
                      const nr = calcNR(r.nivel_deficiencia, r.nivel_exposicion, r.nivel_consecuencia);
                      const nivel = interpretNR(nr);
                      return (
                        <TableRow key={r.id} className="group">
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
                            <Badge variant="outline" className={`${aceptabilidadColor[r.aceptabilidad] || ""} text-xs`}>
                              {nivel} – {aceptabilidadLabel[r.aceptabilidad] || r.aceptabilidad.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">
                            {[r.control_fuente, r.control_medio, r.control_individuo].filter(Boolean).join("; ") || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(r)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {selectedMatriz ? "Esta matriz no tiene riesgos aún. Haga clic en \"Agregar riesgo\" para comenzar." : "Seleccione una matriz para ver sus riesgos."}
              </div>
            )}
          </CardContent>

          {/* ARL Approval Section */}
          {selectedMatriz && (() => {
            const matrizActual = matrices.find(m => m.id === selectedMatriz);
            if (!matrizActual) return null;
            return (
              <div className="border-t px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Aprobacion ARL
                    </h4>
                    {matrizActual.aprobada_por_arl ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="gap-1 bg-green-600 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> Aprobada por ARL
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {matrizActual.fecha_aprobacion_arl
                            ? new Date(matrizActual.fecha_aprobacion_arl).toLocaleDateString("es-CO")
                            : ""}
                        </span>
                        {matrizActual.archivo_aprobado_url && (
                          <a
                            href={matrizActual.archivo_aprobado_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Ver documento
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        Sube la version aprobada por la ARL para que sume al puntaje de cumplimiento.
                      </p>
                    )}
                  </div>
                  {!matrizActual.aprobada_por_arl && (
                    <label className="shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={uploadingArl}
                        asChild
                      >
                        <span>
                          {uploadingArl ? <span className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          {uploadingArl ? "Subiendo..." : "Subir aprobacion ARL"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.xlsx,.xls"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !selectedMatriz) return;
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("El archivo excede 10 MB");
                            return;
                          }
                          setUploadingArl(true);
                          try {
                            const matrizData = matrices.find(m => m.id === selectedMatriz);
                            const path = `matrices/${matrizData?.empresa_id}/arl_aprobacion_${Date.now()}.${file.name.split('.').pop()}`;
                            const { error: upErr } = await supabase.storage.from("documentos").upload(path, file, { upsert: true });
                            if (upErr) throw upErr;
                            const { data: urlData } = await supabase.storage.from("documentos").createSignedUrl(path, 31536000);
                            const { error: dbErr } = await supabase.from("matrices_riesgo").update({
                              archivo_aprobado_url: urlData?.signedUrl,
                              aprobada_por_arl: true,
                              fecha_aprobacion_arl: new Date().toISOString(),
                            }).eq("id", selectedMatriz);
                            if (dbErr) throw dbErr;

                            // Reload matrices
                            const updated = await matricesService.listAll();
                            setMatrices(updated);

                            await logsService.log({
                              tipo: "carga_archivo",
                              modulo: "matrices_riesgo",
                              descripcion: `Aprobacion ARL subida para Matriz v${matrizData?.version}`,
                              empresa_id: matrizData?.empresa_id,
                              usuario_id: user?.id,
                              metadata: { matriz_id: selectedMatriz, filename: file.name },
                            });
                            toast.success("Aprobacion ARL registrada exitosamente");
                          } catch (err: any) {
                            toast.error("Error al subir: " + (err.message || "Intente de nuevo"));
                          } finally {
                            setUploadingArl(false);
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })()}
        </Card>
      </div>
    </div>
  );
}
