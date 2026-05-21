// ============================================================================
// DRAFT — NO ROUTING. No agregar a App.tsx hasta aprobación.
//
// CompanyOnboardingWizard.tsx
// Wizard de 7 pasos para dar de alta una empresa cliente en Regis SG-SST.
// Este componente es un borrador funcional de UI. No realiza llamadas reales
// a Supabase — todos los puntos de integración están marcados con TODO.
//
// Prerequisitos para producción:
//   1. Agregar ruta en App.tsx dentro de ProtectedRoute (rol admin/consultor)
//   2. Conectar funciones de servicio en src/services/index.ts
//   3. Agregar link en AppSidebar.tsx
// ============================================================================

import { useState, useCallback, useMemo } from "react";
import {
  Building2,
  Users,
  Phone,
  ClipboardList,
  Shield,
  Calendar,
  UserCog,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  Search,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = {
  id: number;
  key: "empresa" | "contactos" | "trabajadores" | "comites" | "cronograma" | "acceso" | "resumen";
  title: string;
  description: string;
  icon: React.ElementType;
};

type EmpresaData = {
  nit: string;
  digitoVerificacion: string;
  razonSocial: string;
  ciiuCodigo: string;
  ciiuDescripcion: string;
  nivelRiesgoArl: string;
  numTrabajadores: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  telefono: string;
};

type ContactosData = {
  nombreContacto: string;
  cargoContacto: string;
  emailContacto: string;
  mismoContactoPila: boolean;
  nombreContactoPila: string;
  emailContactoPila: string;
  whatsappContactoPila: string;
};

type TrabajadorRow = {
  tempId: string;
  nombre: string;
  cedula: string;
  cargo: string;
  area: string;
  fechaIngreso: string;
  isDuplicate?: boolean;
};

type IntegranteRow = {
  tempId: string;
  nombre: string;
  cedula: string;
  cargoEmpresa: string;
  rolComite: string;
  esPrincipal: boolean;
  email: string;
};

type ComiteData = {
  tipo: "copasst" | "convivencia" | "vigia";
  fechaInicio: string;
  fechaFin: string;
  integrantes: IntegranteRow[];
};

type CronogramaActividad = {
  id: string;
  nombre: string;
  meses: boolean[]; // 12 booleans, one per month
};

type AccesoData = {
  consultorId: string;
  consultorNombre: string;
  crearAdminCliente: boolean;
  nombreAdminCliente: string;
  emailAdminCliente: string;
  enviarInvitacion: boolean;
};

type WizardData = {
  empresa: EmpresaData;
  contactos: ContactosData;
  trabajadores: TrabajadorRow[];
  comites: ComiteData[];
  cronograma: CronogramaActividad[];
  acceso: AccesoData;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  { id: 1, key: "empresa", title: "Datos Básicos", description: "Información legal y operativa", icon: Building2 },
  { id: 2, key: "contactos", title: "Contactos", description: "General y PILA", icon: Phone },
  { id: 3, key: "trabajadores", title: "Trabajadores", description: "Importar o agregar manual", icon: Users },
  { id: 4, key: "comites", title: "Comités", description: "COPASST / Convivencia / Vigía", icon: Shield },
  { id: 5, key: "cronograma", title: "Cronograma SST", description: "Plan anual de actividades", icon: Calendar },
  { id: 6, key: "acceso", title: "Roles de Acceso", description: "Consultor y admin cliente", icon: UserCog },
  { id: 7, key: "resumen", title: "Resumen", description: "Revisar y activar", icon: CheckCircle2 },
];

const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá",
  "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
  "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena",
  "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
  "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
  "Vaupés", "Vichada", "Bogotá D.C.",
];

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DEFAULT_CRONOGRAMA: CronogramaActividad[] = [
  { id: "1", nombre: "Seguimiento PILA", meses: Array(12).fill(true) },
  { id: "2", nombre: "Inspección de seguridad", meses: Array(12).fill(true) },
  { id: "3", nombre: "Reunión COPASST", meses: [true, false, true, false, true, false, true, false, true, false, true, false] },
  { id: "4", nombre: "Capacitación SST", meses: [true, false, true, false, true, false, true, false, true, false, true, false] },
  { id: "5", nombre: "Simulacro de emergencia", meses: [false, false, false, false, false, true, false, false, false, false, false, true] },
  { id: "6", nombre: "Actualización matriz de riesgos", meses: [false, false, false, false, false, true, false, false, false, false, false, false] },
  { id: "7", nombre: "Revisión por la dirección", meses: [false, false, false, false, false, false, false, false, false, false, false, true] },
  { id: "8", nombre: "Evaluación estándares 0312", meses: [false, false, false, false, false, false, false, false, false, false, false, true] },
  { id: "9", nombre: "Exámenes médicos periódicos", meses: [false, false, false, false, false, true, false, false, false, false, false, false] },
];

const INITIAL_WIZARD_DATA: WizardData = {
  empresa: {
    nit: "", digitoVerificacion: "", razonSocial: "", ciiuCodigo: "", ciiuDescripcion: "",
    nivelRiesgoArl: "", numTrabajadores: "", direccion: "", ciudad: "", departamento: "", telefono: "",
  },
  contactos: {
    nombreContacto: "", cargoContacto: "", emailContacto: "",
    mismoContactoPila: false, nombreContactoPila: "", emailContactoPila: "", whatsappContactoPila: "",
  },
  trabajadores: [],
  comites: [],
  cronograma: DEFAULT_CRONOGRAMA.map((a) => ({ ...a, meses: [...a.meses] })),
  acceso: {
    consultorId: "", consultorNombre: "", crearAdminCliente: false,
    nombreAdminCliente: "", emailAdminCliente: "", enviarInvitacion: true,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcularDigitoVerificacion(nit: string): string {
  const pesos = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 17, 13, 7, 3];
  const digits = nit.replace(/\D/g, "").padStart(pesos.length, "0").split("").map(Number);
  const suma = digits.reduce((acc, d, i) => acc + d * pesos[i], 0);
  const residuo = suma % 11;
  if (residuo === 0) return "0";
  if (residuo === 1) return "1";
  return String(11 - residuo);
}

function calcularCapitulo(numTrabajadores: number, nivelRiesgo: number): string {
  if (nivelRiesgo >= 4) return "Capítulo 3";
  if (numTrabajadores <= 10) return "Capítulo 1";
  if (numTrabajadores <= 50) return "Capítulo 2";
  return "Capítulo 3";
}

function generateTempId(): string {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function StepProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-2">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? "bg-green-600 border-green-600 text-white"
                    : isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs mt-1 text-center hidden sm:block ${
                  isActive ? "text-blue-600 font-semibold" : isCompleted ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      {/* Current step label */}
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].description}
      </p>
    </div>
  );
}

// ─── Step 1: Company Info ────────────────────────────────────────────────────

function CompanyInfoStep({
  data,
  onChange,
}: {
  data: EmpresaData;
  onChange: (data: EmpresaData) => void;
}) {
  const [ciiuSearch, setCiiuSearch] = useState("");

  const handleNitChange = (nit: string) => {
    const cleanNit = nit.replace(/\D/g, "").slice(0, 9);
    const dv = cleanNit.length >= 6 ? calcularDigitoVerificacion(cleanNit) : "";
    onChange({ ...data, nit: cleanNit, digitoVerificacion: dv });
    // TODO: Validar NIT único consultando empresasService.getByNit(cleanNit)
  };

  const capituloCalculado = useMemo(() => {
    const num = parseInt(data.numTrabajadores) || 0;
    const riesgo = parseInt(data.nivelRiesgoArl) || 1;
    return calcularCapitulo(num, riesgo);
  }, [data.numTrabajadores, data.nivelRiesgoArl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Datos Básicos de la Empresa
        </CardTitle>
        <CardDescription>Información legal y operativa de la empresa cliente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NIT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="nit">NIT *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="nit"
                placeholder="900123456"
                value={data.nit}
                onChange={(e) => handleNitChange(e.target.value)}
                maxLength={9}
              />
              <span className="text-muted-foreground">—</span>
              <Input
                className="w-16"
                value={data.digitoVerificacion}
                disabled
                placeholder="DV"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              El dígito de verificación se calcula automáticamente
            </p>
          </div>
        </div>

        {/* Razón social */}
        <div>
          <Label htmlFor="razonSocial">Razón Social *</Label>
          <Input
            id="razonSocial"
            placeholder="Nombre de la empresa como aparece en el RUT"
            value={data.razonSocial}
            onChange={(e) => onChange({ ...data, razonSocial: e.target.value })}
          />
        </div>

        {/* CIIU */}
        <div>
          <Label htmlFor="ciiu">Código CIIU *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="ciiu"
              className="pl-9"
              placeholder="Buscar por código o descripción..."
              value={ciiuSearch}
              onChange={(e) => {
                setCiiuSearch(e.target.value);
                // TODO: Buscar en tabla ciiu_codigos con filtro
              }}
            />
          </div>
          {data.ciiuCodigo && (
            <Badge variant="secondary" className="mt-2">
              {data.ciiuCodigo} — {data.ciiuDescripcion}
            </Badge>
          )}
          {/* TODO: Mostrar lista desplegable con resultados de búsqueda */}
        </div>

        {/* Riesgo y trabajadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Nivel de Riesgo ARL *</Label>
            <Select
              value={data.nivelRiesgoArl}
              onValueChange={(v) => onChange({ ...data, nivelRiesgoArl: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Nivel {n === 1 ? "I" : n === 2 ? "II" : n === 3 ? "III" : n === 4 ? "IV" : "V"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="numTrabajadores">Número de Trabajadores *</Label>
            <Input
              id="numTrabajadores"
              type="number"
              min={1}
              placeholder="Ej: 15"
              value={data.numTrabajadores}
              onChange={(e) => onChange({ ...data, numTrabajadores: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Alert className="flex-1">
              <AlertDescription className="text-sm">
                <strong>{capituloCalculado}</strong> (calculado automáticamente)
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Separator />

        {/* Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              placeholder="Cra 45 #67-89"
              value={data.direccion}
              onChange={(e) => onChange({ ...data, direccion: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ciudad">Ciudad *</Label>
            <Input
              id="ciudad"
              placeholder="Bogotá"
              value={data.ciudad}
              onChange={(e) => onChange({ ...data, ciudad: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Departamento</Label>
            <Select
              value={data.departamento}
              onValueChange={(v) => onChange({ ...data, departamento: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar departamento" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTAMENTOS_COLOMBIA.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              placeholder="6011234567"
              value={data.telefono}
              onChange={(e) => onChange({ ...data, telefono: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 2: Contacts ────────────────────────────────────────────────────────

function ContactsStep({
  data,
  onChange,
}: {
  data: ContactosData;
  onChange: (data: ContactosData) => void;
}) {
  const handleMismoContacto = (checked: boolean) => {
    onChange({
      ...data,
      mismoContactoPila: checked,
      nombreContactoPila: checked ? data.nombreContacto : data.nombreContactoPila,
      emailContactoPila: checked ? data.emailContacto : data.emailContactoPila,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Configuración de Contactos
        </CardTitle>
        <CardDescription>Contacto general de la empresa y contacto para planillas PILA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contacto General */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Contacto General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombreContacto">Nombre *</Label>
              <Input
                id="nombreContacto"
                placeholder="Nombre completo"
                value={data.nombreContacto}
                onChange={(e) => onChange({ ...data, nombreContacto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cargoContacto">Cargo *</Label>
              <Input
                id="cargoContacto"
                placeholder="Ej: Gerente General"
                value={data.cargoContacto}
                onChange={(e) => onChange({ ...data, cargoContacto: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="emailContacto">Email *</Label>
            <Input
              id="emailContacto"
              type="email"
              placeholder="contacto@empresa.com"
              value={data.emailContacto}
              onChange={(e) => onChange({ ...data, emailContacto: e.target.value })}
            />
          </div>
        </div>

        <Separator />

        {/* Mismo contacto checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="mismoContactoPila"
            checked={data.mismoContactoPila}
            onCheckedChange={(checked) => handleMismoContacto(checked as boolean)}
          />
          <Label htmlFor="mismoContactoPila" className="cursor-pointer">
            Usar el mismo contacto para PILA
          </Label>
        </div>

        {/* Contacto PILA */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Contacto PILA (Planillas de Seguridad Social)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombreContactoPila">Nombre *</Label>
              <Input
                id="nombreContactoPila"
                placeholder="Nombre completo"
                value={data.nombreContactoPila}
                disabled={data.mismoContactoPila}
                onChange={(e) => onChange({ ...data, nombreContactoPila: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="emailContactoPila">Email PILA *</Label>
              <Input
                id="emailContactoPila"
                type="email"
                placeholder="pila@empresa.com"
                value={data.emailContactoPila}
                disabled={data.mismoContactoPila}
                onChange={(e) => onChange({ ...data, emailContactoPila: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 md:w-1/2">
            <Label htmlFor="whatsappContactoPila">WhatsApp PILA *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">+57</span>
              <Input
                id="whatsappContactoPila"
                placeholder="3001234567"
                maxLength={10}
                value={data.whatsappContactoPila}
                onChange={(e) =>
                  onChange({ ...data, whatsappContactoPila: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 3: Workers Import ──────────────────────────────────────────────────

function WorkersImportStep({
  data,
  onChange,
}: {
  data: TrabajadorRow[];
  onChange: (data: TrabajadorRow[]) => void;
}) {
  const [importMode, setImportMode] = useState<"file" | "manual">("manual");

  const addWorker = () => {
    onChange([
      ...data,
      { tempId: generateTempId(), nombre: "", cedula: "", cargo: "", area: "", fechaIngreso: "" },
    ]);
  };

  const updateWorker = (tempId: string, field: keyof TrabajadorRow, value: string) => {
    const updated = data.map((w) => (w.tempId === tempId ? { ...w, [field]: value } : w));
    // Check for duplicate cedulas
    const cedulaCounts: Record<string, number> = {};
    updated.forEach((w) => {
      if (w.cedula) cedulaCounts[w.cedula] = (cedulaCounts[w.cedula] || 0) + 1;
    });
    const withDuplicates = updated.map((w) => ({
      ...w,
      isDuplicate: w.cedula ? (cedulaCounts[w.cedula] || 0) > 1 : false,
    }));
    onChange(withDuplicates);
  };

  const removeWorker = (tempId: string) => {
    onChange(data.filter((w) => w.tempId !== tempId));
  };

  const handleFileUpload = useCallback(
    (_e: React.ChangeEvent<HTMLInputElement>) => {
      // TODO: Implementar parsing de CSV/XLSX con papaparse/xlsx
      // 1. Leer archivo
      // 2. Detectar columnas
      // 3. Mostrar UI de mapeo de columnas
      // 4. Validar datos y detectar duplicados
      // 5. Agregar a la lista de trabajadores
      console.log("File upload not implemented yet");
    },
    []
  );

  const duplicateCount = data.filter((w) => w.isDuplicate).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Importar Trabajadores
        </CardTitle>
        <CardDescription>
          Agrega la lista de trabajadores de la empresa. Mínimo 1 trabajador requerido.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import mode selector */}
        <div className="flex gap-4">
          <Button
            variant={importMode === "file" ? "default" : "outline"}
            onClick={() => setImportMode("file")}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importar CSV/Excel
          </Button>
          <Button
            variant={importMode === "manual" ? "default" : "outline"}
            onClick={() => setImportMode("manual")}
            className="flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Agregar manualmente
          </Button>
        </div>

        {/* File upload zone */}
        {importMode === "file" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mb-4">Formatos: .csv, .xlsx (máx 5MB)</p>
            <Input
              type="file"
              accept=".csv,.xlsx"
              className="max-w-xs mx-auto"
              onChange={handleFileUpload}
            />
            {/* TODO: Mostrar UI de mapeo de columnas después de subir */}
          </div>
        )}

        {/* Duplicate warning */}
        {duplicateCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cédulas duplicadas</AlertTitle>
            <AlertDescription>
              Se encontraron {duplicateCount} trabajadores con cédulas duplicadas.
              Revisa las filas marcadas en rojo.
            </AlertDescription>
          </Alert>
        )}

        {/* Workers table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Nombre *</TableHead>
                <TableHead>Cédula *</TableHead>
                <TableHead>Cargo *</TableHead>
                <TableHead>Área *</TableHead>
                <TableHead>Fecha Ingreso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay trabajadores agregados. Usa el botón de abajo para agregar.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((worker, idx) => (
                  <TableRow
                    key={worker.tempId}
                    className={worker.isDuplicate ? "bg-red-50" : undefined}
                  >
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Nombre completo"
                        value={worker.nombre}
                        onChange={(e) => updateWorker(worker.tempId, "nombre", e.target.value)}
                        className="min-w-[160px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="1012345678"
                        value={worker.cedula}
                        onChange={(e) =>
                          updateWorker(worker.tempId, "cedula", e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        className={`min-w-[120px] ${worker.isDuplicate ? "border-red-500" : ""}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Cargo"
                        value={worker.cargo}
                        onChange={(e) => updateWorker(worker.tempId, "cargo", e.target.value)}
                        className="min-w-[120px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Área"
                        value={worker.area}
                        onChange={(e) => updateWorker(worker.tempId, "area", e.target.value)}
                        className="min-w-[100px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={worker.fechaIngreso}
                        onChange={(e) => updateWorker(worker.tempId, "fechaIngreso", e.target.value)}
                        className="min-w-[140px]"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorker(worker.tempId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary + add button */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total: {data.length} trabajadores | {data.filter((w) => w.isDuplicate).length} duplicados
          </p>
          <Button variant="outline" onClick={addWorker} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar trabajador
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 4: Committees ──────────────────────────────────────────────────────

function CommitteesStep({
  data,
  numTrabajadores,
  trabajadores,
  onChange,
}: {
  data: ComiteData[];
  numTrabajadores: number;
  trabajadores: TrabajadorRow[];
  onChange: (data: ComiteData[]) => void;
}) {
  const requiereCopasst = numTrabajadores > 10;
  const today = new Date().toISOString().split("T")[0];
  const twoYearsLater = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Initialize committees if empty
  if (data.length === 0) {
    const initial: ComiteData[] = [];
    if (requiereCopasst) {
      initial.push({
        tipo: "copasst",
        fechaInicio: today,
        fechaFin: twoYearsLater,
        integrantes: [],
      });
    } else {
      initial.push({
        tipo: "vigia",
        fechaInicio: today,
        fechaFin: twoYearsLater,
        integrantes: [],
      });
    }
    initial.push({
      tipo: "convivencia",
      fechaInicio: today,
      fechaFin: twoYearsLater,
      integrantes: [],
    });
    // Use setTimeout to avoid updating state during render
    setTimeout(() => onChange(initial), 0);
  }

  const addIntegrante = (comiteIdx: number) => {
    const updated = [...data];
    updated[comiteIdx] = {
      ...updated[comiteIdx],
      integrantes: [
        ...updated[comiteIdx].integrantes,
        {
          tempId: generateTempId(),
          nombre: "",
          cedula: "",
          cargoEmpresa: "",
          rolComite: "miembro",
          esPrincipal: false,
          email: "",
        },
      ],
    };
    onChange(updated);
  };

  const updateIntegrante = (
    comiteIdx: number,
    integranteId: string,
    field: keyof IntegranteRow,
    value: string | boolean
  ) => {
    const updated = [...data];
    updated[comiteIdx] = {
      ...updated[comiteIdx],
      integrantes: updated[comiteIdx].integrantes.map((i) =>
        i.tempId === integranteId ? { ...i, [field]: value } : i
      ),
    };
    onChange(updated);
  };

  const removeIntegrante = (comiteIdx: number, integranteId: string) => {
    const updated = [...data];
    updated[comiteIdx] = {
      ...updated[comiteIdx],
      integrantes: updated[comiteIdx].integrantes.filter((i) => i.tempId !== integranteId),
    };
    onChange(updated);
  };

  const getComiteLabel = (tipo: string) => {
    switch (tipo) {
      case "copasst": return "COPASST (Comité Paritario de Seguridad y Salud)";
      case "convivencia": return "Comité de Convivencia Laboral";
      case "vigia": return "Vigía de Seguridad y Salud en el Trabajo";
      default: return tipo;
    }
  };

  const getMinIntegrantes = (tipo: string) => {
    switch (tipo) {
      case "copasst": return 4;
      case "convivencia": return 2;
      case "vigia": return 1;
      default: return 1;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Setup de Comités
        </CardTitle>
        <CardDescription>
          {requiereCopasst
            ? `Con ${numTrabajadores} trabajadores, se requieren COPASST y Comité de Convivencia.`
            : `Con ${numTrabajadores} trabajadores, se requieren Vigía SST y Comité de Convivencia.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {data.map((comite, comiteIdx) => (
          <div key={comite.tipo} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{getComiteLabel(comite.tipo)}</h3>
              <Badge variant="outline">
                Mín. {getMinIntegrantes(comite.tipo)} integrantes
              </Badge>
            </div>

            {/* Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Inicio del periodo</Label>
                <Input
                  type="date"
                  value={comite.fechaInicio}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[comiteIdx] = { ...updated[comiteIdx], fechaInicio: e.target.value };
                    onChange(updated);
                  }}
                />
              </div>
              <div>
                <Label>Fin del periodo</Label>
                <Input
                  type="date"
                  value={comite.fechaFin}
                  onChange={(e) => {
                    const updated = [...data];
                    updated[comiteIdx] = { ...updated[comiteIdx], fechaFin: e.target.value };
                    onChange(updated);
                  }}
                />
              </div>
            </div>

            {/* Integrantes table */}
            <div className="border rounded overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre *</TableHead>
                    <TableHead>Cédula *</TableHead>
                    <TableHead>Cargo Empresa *</TableHead>
                    <TableHead>Rol Comité *</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comite.integrantes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                        Sin integrantes. Agrega al menos {getMinIntegrantes(comite.tipo)}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    comite.integrantes.map((integrante) => (
                      <TableRow key={integrante.tempId}>
                        <TableCell>
                          <Input
                            placeholder="Nombre"
                            value={integrante.nombre}
                            onChange={(e) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "nombre", e.target.value)
                            }
                            className="min-w-[140px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Cédula"
                            value={integrante.cedula}
                            onChange={(e) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "cedula", e.target.value)
                            }
                            className="min-w-[110px]"
                          />
                          {/* TODO: Validar que cédula exista en lista de trabajadores */}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Cargo"
                            value={integrante.cargoEmpresa}
                            onChange={(e) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "cargoEmpresa", e.target.value)
                            }
                            className="min-w-[120px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={integrante.rolComite}
                            onValueChange={(v) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "rolComite", v)
                            }
                          >
                            <SelectTrigger className="min-w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {comite.tipo === "vigia" ? (
                                <SelectItem value="vigia">Vigía</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="presidente">Presidente</SelectItem>
                                  <SelectItem value="secretario">Secretario</SelectItem>
                                  <SelectItem value="miembro">Miembro</SelectItem>
                                </>
                              )}
                              <SelectItem value="representante">Representante</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={integrante.esPrincipal}
                            onCheckedChange={(checked) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "esPrincipal", checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="email"
                            placeholder="email@..."
                            value={integrante.email}
                            onChange={(e) =>
                              updateIntegrante(comiteIdx, integrante.tempId, "email", e.target.value)
                            }
                            className="min-w-[140px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeIntegrante(comiteIdx, integrante.tempId)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addIntegrante(comiteIdx)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar integrante
            </Button>

            {comite.integrantes.length > 0 &&
              comite.integrantes.length < getMinIntegrantes(comite.tipo) && (
                <p className="text-sm text-amber-600">
                  Faltan {getMinIntegrantes(comite.tipo) - comite.integrantes.length} integrantes
                  para cumplir el mínimo requerido.
                </p>
              )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Step 5: SST Schedule ────────────────────────────────────────────────────

function ScheduleStep({
  data,
  empresaData,
  onChange,
}: {
  data: CronogramaActividad[];
  empresaData: EmpresaData;
  onChange: (data: CronogramaActividad[]) => void;
}) {
  const [newActivityName, setNewActivityName] = useState("");

  const toggleMonth = (actIdx: number, monthIdx: number) => {
    const updated = data.map((a, i) => {
      if (i !== actIdx) return a;
      const newMeses = [...a.meses];
      newMeses[monthIdx] = !newMeses[monthIdx];
      return { ...a, meses: newMeses };
    });
    onChange(updated);
  };

  const addActivity = () => {
    if (!newActivityName.trim()) return;
    onChange([
      ...data,
      { id: generateTempId(), nombre: newActivityName.trim(), meses: Array(12).fill(false) },
    ]);
    setNewActivityName("");
  };

  const removeActivity = (id: string) => {
    onChange(data.filter((a) => a.id !== id));
  };

  const totalCeldas = data.length * 12;
  const celdasMarcadas = data.reduce((acc, a) => acc + a.meses.filter(Boolean).length, 0);

  const capituloLabel = calcularCapitulo(
    parseInt(empresaData.numTrabajadores) || 0,
    parseInt(empresaData.nivelRiesgoArl) || 1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Cronograma SST Anual
        </CardTitle>
        <CardDescription>
          Plan anual de actividades generado para CIIU {empresaData.ciiuCodigo || "(sin definir)"} |
          Riesgo {empresaData.nivelRiesgoArl || "—"} | {capituloLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* TODO: Generar cronograma según CIIU y nivel de riesgo desde ciiu_codigos */}

        {/* Schedule grid */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] sticky left-0 bg-white">Actividad</TableHead>
                {MESES.map((m) => (
                  <TableHead key={m} className="text-center w-12">{m}</TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((actividad, actIdx) => (
                <TableRow key={actividad.id}>
                  <TableCell className="font-medium sticky left-0 bg-white">
                    {actividad.nombre}
                  </TableCell>
                  {actividad.meses.map((checked, monthIdx) => (
                    <TableCell key={monthIdx} className="text-center">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleMonth(actIdx, monthIdx)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(actividad.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add activity */}
        <div className="flex gap-2">
          <Input
            placeholder="Nombre de nueva actividad..."
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addActivity()}
          />
          <Button variant="outline" onClick={addActivity} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar
          </Button>
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground">
          Actividades marcadas: {celdasMarcadas}/{totalCeldas} celdas |
          Cobertura: {totalCeldas > 0 ? Math.round((celdasMarcadas / totalCeldas) * 100) : 0}%
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Step 6: Access Roles ────────────────────────────────────────────────────

function AccessStep({
  data,
  onChange,
}: {
  data: AccesoData;
  onChange: (data: AccesoData) => void;
}) {
  // TODO: Cargar lista de consultores desde usuariosService.listByRole("consultor")
  const mockConsultores = [
    { id: "c1", nombre: "María Rodríguez", email: "maria@regis.com.co" },
    { id: "c2", nombre: "Carlos Gómez", email: "carlos@regis.com.co" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          Roles de Acceso
        </CardTitle>
        <CardDescription>
          Asigna el consultor responsable y opcionalmente crea un usuario para la empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consultor */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Consultor Asignado
          </h3>
          <div>
            <Label>Consultor *</Label>
            <Select
              value={data.consultorId}
              onValueChange={(v) => {
                const consultor = mockConsultores.find((c) => c.id === v);
                onChange({
                  ...data,
                  consultorId: v,
                  consultorNombre: consultor?.nombre || "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar consultor..." />
              </SelectTrigger>
              <SelectContent>
                {mockConsultores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} — {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Admin cliente */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="crearAdminCliente"
            checked={data.crearAdminCliente}
            onCheckedChange={(checked) =>
              onChange({ ...data, crearAdminCliente: checked as boolean })
            }
          />
          <Label htmlFor="crearAdminCliente" className="cursor-pointer">
            Crear usuario administrador para la empresa
          </Label>
        </div>

        {data.crearAdminCliente && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Datos del Administrador Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombreAdminCliente">Nombre *</Label>
                <Input
                  id="nombreAdminCliente"
                  placeholder="Nombre completo"
                  value={data.nombreAdminCliente}
                  onChange={(e) => onChange({ ...data, nombreAdminCliente: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="emailAdminCliente">Email *</Label>
                <Input
                  id="emailAdminCliente"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={data.emailAdminCliente}
                  onChange={(e) => onChange({ ...data, emailAdminCliente: e.target.value })}
                />
                {/* TODO: Validar email único en usuariosService.getByEmail() */}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviarInvitacion"
                checked={data.enviarInvitacion}
                onCheckedChange={(checked) =>
                  onChange({ ...data, enviarInvitacion: checked as boolean })
                }
              />
              <Label htmlFor="enviarInvitacion" className="cursor-pointer">
                Enviar correo de invitación
              </Label>
            </div>

            <p className="text-xs text-muted-foreground">
              El usuario recibirá un enlace para crear su contraseña y acceder a la plataforma.
              Solo podrá ver información de su empresa.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Step 7: Review ──────────────────────────────────────────────────────────

function ReviewStep({ wizardData }: { wizardData: WizardData }) {
  const { empresa, contactos, trabajadores, comites, cronograma, acceso } = wizardData;
  const celdasMarcadas = cronograma.reduce((acc, a) => acc + a.meses.filter(Boolean).length, 0);

  const capituloLabel = calcularCapitulo(
    parseInt(empresa.numTrabajadores) || 0,
    parseInt(empresa.nivelRiesgoArl) || 1
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Resumen y Activación
        </CardTitle>
        <CardDescription>Revisa toda la información antes de activar la empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Empresa */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4" /> Empresa
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Razón social:</span>{" "}
              <strong>{empresa.razonSocial || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">NIT:</span>{" "}
              <strong>{empresa.nit}{empresa.digitoVerificacion ? `-${empresa.digitoVerificacion}` : ""}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">CIIU:</span>{" "}
              <strong>{empresa.ciiuCodigo || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Riesgo ARL:</span>{" "}
              <strong>Nivel {empresa.nivelRiesgoArl || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Trabajadores:</span>{" "}
              <strong>{empresa.numTrabajadores || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Capítulo:</span>{" "}
              <strong>{capituloLabel}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Dirección:</span>{" "}
              <strong>
                {empresa.direccion || "—"}, {empresa.ciudad || "—"}, {empresa.departamento || "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Contactos */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4" /> Contactos
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">General:</span>{" "}
              {contactos.nombreContacto || "—"} ({contactos.cargoContacto || "—"}) —{" "}
              {contactos.emailContacto || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">PILA:</span>{" "}
              {contactos.nombreContactoPila || "—"} — {contactos.emailContactoPila || "—"} —{" "}
              {contactos.whatsappContactoPila ? `+57${contactos.whatsappContactoPila}` : "—"}
            </p>
          </div>
        </div>

        {/* Trabajadores */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" /> Trabajadores
          </h3>
          <p className="text-sm">
            <strong>{trabajadores.length}</strong> trabajadores importados |{" "}
            <strong>{trabajadores.filter((w) => w.isDuplicate).length}</strong> duplicados |{" "}
            <strong>{trabajadores.filter((w) => !w.nombre || !w.cedula).length}</strong> incompletos
          </p>
        </div>

        {/* Comités */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" /> Comités
          </h3>
          {comites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No se configuraron comités</p>
          ) : (
            <div className="text-sm space-y-1">
              {comites.map((c) => (
                <p key={c.tipo}>
                  <strong>{c.tipo.toUpperCase()}</strong>: {c.integrantes.length} integrantes |
                  Periodo: {c.fechaInicio} a {c.fechaFin}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Cronograma */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" /> Cronograma SST
          </h3>
          <p className="text-sm">
            <strong>{celdasMarcadas}</strong> actividades programadas en{" "}
            <strong>{cronograma.length}</strong> categorías para el año
          </p>
        </div>

        {/* Acceso */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4" /> Acceso
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Consultor:</span>{" "}
              <strong>{acceso.consultorNombre || "Sin asignar"}</strong>
            </p>
            {acceso.crearAdminCliente && (
              <p>
                <span className="text-muted-foreground">Admin cliente:</span>{" "}
                <strong>{acceso.nombreAdminCliente}</strong> ({acceso.emailAdminCliente})
                {acceso.enviarInvitacion && " — Se enviará invitación por correo"}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Activation warning */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Al activar la empresa se ejecutarán las siguientes acciones:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Crear empresa y todos los registros asociados</li>
              <li>Insertar {trabajadores.length} trabajadores</li>
              <li>Crear {comites.length} comités con sus integrantes</li>
              <li>Guardar cronograma SST anual</li>
              <li>Sincronizar periodos PILA (últimos 6 meses)</li>
              {acceso.crearAdminCliente && acceso.enviarInvitacion && (
                <li>Enviar correo de invitación a {acceso.emailAdminCliente}</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ─── Main Wizard Component ───────────────────────────────────────────────────

export default function CompanyOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(
    () => {
      // TODO: Cargar borrador desde localStorage si existe
      // const draft = localStorage.getItem("onboarding_draft");
      // if (draft) return JSON.parse(draft);
      return { ...INITIAL_WIZARD_DATA };
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  // ── Step navigation ──

  const goNext = () => {
    // TODO: Validar paso actual antes de avanzar
    if (currentStep < STEPS.length) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Guardar en localStorage o en tabla onboarding_borradores
      // localStorage.setItem(`onboarding_draft_${wizardData.empresa.nit}`, JSON.stringify({
      //   currentStep,
      //   lastSaved: new Date().toISOString(),
      //   wizardData,
      // }));
      // toast.success("Borrador guardado");
      console.log("Draft saved:", { currentStep, wizardData });
      await new Promise((r) => setTimeout(r, 500)); // Simulated delay
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, wizardData]);

  const activateCompany = useCallback(async () => {
    setIsActivating(true);
    try {
      // TODO: Call empresaService.create(wizardData.empresa)
      // TODO: Call trabajadoresService.bulkCreate(wizardData.trabajadores)
      // TODO: Call comitesService.create(wizardData.comites) + integrantes
      // TODO: Call cronogramaService.create(wizardData.cronograma)
      // TODO: Call usuariosService.create({ rol: "cliente", ...wizardData.acceso })
      // TODO: Call pilaService.syncPeriods(empresaId)
      // TODO: Call logsService.log({ tipo: "creacion", modulo: "onboarding", descripcion: "..." })
      // TODO: Send invitation email if acceso.enviarInvitacion
      // TODO: toast.success("Empresa activada exitosamente")
      // TODO: navigate("/companies")
      console.log("Activating company:", wizardData);
      await new Promise((r) => setTimeout(r, 1500)); // Simulated delay
    } catch (error) {
      // TODO: toast.error("No se pudo activar la empresa: " + error.message)
      console.error("Activation failed:", error);
    } finally {
      setIsActivating(false);
    }
  }, [wizardData]);

  // ── Data updaters ──

  const updateEmpresa = (data: EmpresaData) =>
    setWizardData((prev) => ({ ...prev, empresa: data }));
  const updateContactos = (data: ContactosData) =>
    setWizardData((prev) => ({ ...prev, contactos: data }));
  const updateTrabajadores = (data: TrabajadorRow[]) =>
    setWizardData((prev) => ({ ...prev, trabajadores: data }));
  const updateComites = (data: ComiteData[]) =>
    setWizardData((prev) => ({ ...prev, comites: data }));
  const updateCronograma = (data: CronogramaActividad[]) =>
    setWizardData((prev) => ({ ...prev, cronograma: data }));
  const updateAcceso = (data: AccesoData) =>
    setWizardData((prev) => ({ ...prev, acceso: data }));

  // ── Render current step ──

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfoStep data={wizardData.empresa} onChange={updateEmpresa} />;
      case 2:
        return <ContactsStep data={wizardData.contactos} onChange={updateContactos} />;
      case 3:
        return <WorkersImportStep data={wizardData.trabajadores} onChange={updateTrabajadores} />;
      case 4:
        return (
          <CommitteesStep
            data={wizardData.comites}
            numTrabajadores={parseInt(wizardData.empresa.numTrabajadores) || 0}
            trabajadores={wizardData.trabajadores}
            onChange={updateComites}
          />
        );
      case 5:
        return (
          <ScheduleStep
            data={wizardData.cronograma}
            empresaData={wizardData.empresa}
            onChange={updateCronograma}
          />
        );
      case 6:
        return <AccessStep data={wizardData.acceso} onChange={updateAcceso} />;
      case 7:
        return <ReviewStep wizardData={wizardData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Onboarding de Nueva Empresa
        </h1>
        <p className="text-muted-foreground mt-1">
          Configura todos los datos de la empresa cliente en un solo flujo.
        </p>
      </div>

      {/* Progress */}
      <StepProgressBar currentStep={currentStep} />

      {/* Step content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <Button
          variant="ghost"
          onClick={saveDraft}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar borrador
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={goNext} className="flex items-center gap-2">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={activateCompany}
            disabled={isActivating}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isActivating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Activar Empresa
          </Button>
        )}
      </div>
    </div>
  );
}
