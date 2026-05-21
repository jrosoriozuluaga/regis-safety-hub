// =============================================================================
// DRAFT — NO ROUTING. No agregar a App.tsx hasta aprobación.
//
// Wizard de Onboarding de Consultor para Regis SG-SST.
// 5 pasos: Datos Personales, Credenciales, Empresas, Notificaciones, Resumen.
//
// TODO antes de producción:
// - Conectar a Supabase Auth (crear usuario)
// - Conectar a tabla `usuarios` (INSERT)
// - Conectar a `empresas_cliente` (UPDATE consultor_id)
// - Conectar a `preferencias_notificacion` (INSERT)
// - Conectar a Edge Function `send-welcome-email`
// - Conectar a `logs_actividad` (INSERT)
// - Agregar ruta en App.tsx: /consultores/nuevo
// - Importar servicios reales desde @/services/index
// - Agregar guard de rol admin
// =============================================================================

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Shield,
  Building2,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Search,
  Upload,
  AlertTriangle,
  X,
} from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface PersonalInfo {
  nombre: string;
  email: string;
  cedula: string;
  telefono: string;
  fotoFile: File | null;
  fotoPreview: string | null;
}

interface Credentials {
  rol: "consultor" | "consultor_senior" | "admin";
  useTempPassword: boolean;
  manualPassword: string;
  confirmPassword: string;
}

type AlertType =
  | "pila_vencida"
  | "equipos_vencer"
  | "nuevos_documentos"
  | "examenes_pendientes"
  | "cumplimiento_bajo";

interface NotificationPrefs {
  alertas: AlertType[];
  frecuencia: "inmediata" | "diario" | "semanal";
  canales: ("email" | "whatsapp")[];
}

interface CompanyOption {
  id: string;
  razon_social: string;
  nit: string;
  consultor_actual: string | null;
  num_trabajadores: number;
}

interface ConsultorCarga {
  nombre: string;
  empresas_count: number;
}

interface WizardData {
  personalInfo: PersonalInfo;
  credentials: Credentials;
  selectedCompanyIds: string[];
  notifications: NotificationPrefs;
}

// =============================================================================
// Mock Data — TODO: Replace with Supabase queries
// =============================================================================

const MOCK_COMPANIES: CompanyOption[] = [
  {
    id: "c1",
    razon_social: "Construandes Ltda",
    nit: "900.123.456-7",
    consultor_actual: null,
    num_trabajadores: 12,
  },
  {
    id: "c2",
    razon_social: "DevCo Technologies S.A.S.",
    nit: "900.789.012-3",
    consultor_actual: "Ana Garcia",
    num_trabajadores: 35,
  },
  {
    id: "c3",
    razon_social: "Sabor Criollo S.A.S.",
    nit: "900.456.789-0",
    consultor_actual: null,
    num_trabajadores: 8,
  },
];

const MOCK_CARGA: ConsultorCarga[] = [
  { nombre: "Ana Garcia", empresas_count: 5 },
  { nombre: "Carlos Martinez", empresas_count: 8 },
];

const ALERT_LABELS: Record<AlertType, string> = {
  pila_vencida: "PILA vencida",
  equipos_vencer: "Equipos por vencer",
  nuevos_documentos: "Nuevos documentos",
  examenes_pendientes: "Examenes pendientes",
  cumplimiento_bajo: "Cumplimiento bajo",
};

const STEP_LABELS = [
  "Datos Personales",
  "Credenciales y Rol",
  "Empresas Asignadas",
  "Notificaciones",
  "Resumen",
];

const STEP_ICONS = [User, Shield, Building2, Bell, CheckCircle2];

// =============================================================================
// Step 1: PersonalInfoStep
// =============================================================================

function PersonalInfoStep({
  data,
  onChange,
}: {
  data: PersonalInfo;
  onChange: (d: PersonalInfo) => void;
}) {
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: validate file type (JPG/PNG) and size (max 2MB)
    const preview = URL.createObjectURL(file);
    onChange({ ...data, fotoFile: file, fotoPreview: preview });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombre"
          placeholder="Ej: Juan Perez Martinez"
          value={data.nombre}
          onChange={(e) => onChange({ ...data, nombre: e.target.value })}
        />
        {data.nombre.length > 0 && data.nombre.length < 3 && (
          <p className="text-sm text-red-500">Minimo 3 caracteres</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email corporativo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="consultor@regis.com.co"
          value={data.email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
        />
        {/* TODO: async uniqueness check against usuarios.email */}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cedula">
            Cedula <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cedula"
            placeholder="1234567890"
            value={data.cedula}
            onChange={(e) =>
              onChange({ ...data, cedula: e.target.value.replace(/\D/g, "") })
            }
            maxLength={12}
          />
          {data.cedula.length > 0 && data.cedula.length < 6 && (
            <p className="text-sm text-red-500">Minimo 6 digitos</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Telefono</Label>
          <Input
            id="telefono"
            placeholder="310 456 7890"
            value={data.telefono}
            onChange={(e) => onChange({ ...data, telefono: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Foto de perfil (opcional)</Label>
        <div className="flex items-center gap-4">
          {data.fotoPreview ? (
            <div className="relative">
              <img
                src={data.fotoPreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                onClick={() =>
                  onChange({ ...data, fotoFile: null, fotoPreview: null })
                }
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-gray-400 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Subir</span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={handlePhotoChange}
              />
            </label>
          )}
          <p className="text-sm text-gray-500">JPG o PNG, maximo 2MB</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Step 2: CredentialsStep
// =============================================================================

function CredentialsStep({
  data,
  onChange,
}: {
  data: Credentials;
  onChange: (d: Credentials) => void;
}) {
  const roleDescriptions: Record<Credentials["rol"], string> = {
    consultor:
      "Acceso operativo a empresas asignadas. Puede cargar documentos y generar reportes.",
    consultor_senior:
      "Operativo + validacion de documentos, aprobacion y metricas de equipo.",
    admin:
      "Acceso total: gestion de usuarios, configuracion, reportes globales y auditoria.",
  };

  const roleLabels: Record<Credentials["rol"], string> = {
    consultor: "Consultor",
    consultor_senior: "Consultor Senior",
    admin: "Administrador",
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>
          Rol del consultor <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={data.rol}
          onValueChange={(v) =>
            onChange({ ...data, rol: v as Credentials["rol"] })
          }
          className="space-y-3"
        >
          {(
            ["consultor", "consultor_senior", "admin"] as Credentials["rol"][]
          ).map((rol) => (
            <label
              key={rol}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                data.rol === rol
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <RadioGroupItem value={rol} className="mt-0.5" />
              <div>
                <p className="font-medium">{roleLabels[rol]}</p>
                <p className="text-sm text-gray-500">
                  {roleDescriptions[rol]}
                </p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label>Credenciales de acceso</Label>
        <div className="flex items-center gap-3">
          <Switch
            checked={data.useTempPassword}
            onCheckedChange={(checked) =>
              onChange({ ...data, useTempPassword: checked })
            }
          />
          <div>
            <p className="font-medium text-sm">
              Generar enlace de clave temporal
            </p>
            <p className="text-xs text-gray-500">
              Recomendado. El consultor recibira un link para crear su clave.
            </p>
          </div>
        </div>

        {!data.useTempPassword && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="password">
                Clave <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={data.manualPassword}
                onChange={(e) =>
                  onChange({ ...data, manualPassword: e.target.value })
                }
                placeholder="Minimo 8 caracteres, 1 mayuscula, 1 numero"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar clave <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={data.confirmPassword}
                onChange={(e) =>
                  onChange({ ...data, confirmPassword: e.target.value })
                }
              />
              {data.confirmPassword &&
                data.manualPassword !== data.confirmPassword && (
                  <p className="text-sm text-red-500">
                    Las claves no coinciden
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Step 3: CompaniesStep
// =============================================================================

function CompaniesStep({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  // TODO: Replace with real Supabase query: empresasService.list()
  const companies = MOCK_COMPANIES;
  // TODO: Replace with real query: count empresas per consultor
  const carga = MOCK_CARGA;

  const filtered = companies.filter(
    (c) =>
      c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
      c.nit.includes(search)
  );

  const toggleCompany = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre o NIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Company list */}
        <div className="col-span-2 space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filtered.map((company) => {
            const isSelected = selectedIds.includes(company.id);
            const hasConsultor = !!company.consultor_actual;

            return (
              <div
                key={company.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleCompany(company.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={isSelected} className="mt-1" />
                    <div>
                      <p className="font-medium">{company.razon_social}</p>
                      <p className="text-sm text-gray-500">
                        NIT: {company.nit}
                      </p>
                      <p className="text-sm text-gray-500">
                        Trabajadores: {company.num_trabajadores}
                      </p>
                    </div>
                  </div>
                  {hasConsultor && (
                    <Badge variant="outline\" className="text-xs">
                      {company.consultor_actual}
                    </Badge>
                  )}
                </div>
                {hasConsultor && isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-amber-600 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      Se reasignara desde {company.consultor_actual}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No se encontraron empresas
            </p>
          )}
        </div>

        {/* Load balancing panel */}
        <div className="col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Carga Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {carga.map((c) => (
                <div
                  key={c.nombre}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{c.nombre}</span>
                  <Badge variant="secondary">{c.empresas_count}</Badge>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between text-sm font-medium text-blue-600">
                <span>Nuevo consultor</span>
                <Badge>{selectedIds.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Empresas seleccionadas: <strong>{selectedIds.length}</strong>
        {selectedIds.length === 0 && (
          <span className="text-amber-500 ml-2">
            (Puedes crear el consultor sin empresas y asignarlas despues)
          </span>
        )}
      </p>
    </div>
  );
}

// =============================================================================
// Step 4: NotificationsStep
// =============================================================================

function NotificationsStep({
  data,
  onChange,
}: {
  data: NotificationPrefs;
  onChange: (d: NotificationPrefs) => void;
}) {
  const toggleAlert = (alert: AlertType) => {
    if (data.alertas.includes(alert)) {
      onChange({ ...data, alertas: data.alertas.filter((a) => a !== alert) });
    } else {
      onChange({ ...data, alertas: [...data.alertas, alert] });
    }
  };

  const toggleCanal = (canal: "email" | "whatsapp") => {
    if (data.canales.includes(canal)) {
      if (data.canales.length > 1) {
        onChange({
          ...data,
          canales: data.canales.filter((c) => c !== canal),
        });
      }
    } else {
      onChange({ ...data, canales: [...data.canales, canal] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Alertas que recibira el consultor</Label>
        {(Object.keys(ALERT_LABELS) as AlertType[]).map((alert) => (
          <div key={alert} className="flex items-center gap-3">
            <Checkbox
              checked={data.alertas.includes(alert)}
              onCheckedChange={() => toggleAlert(alert)}
            />
            <span className="text-sm">{ALERT_LABELS[alert]}</span>
          </div>
        ))}
        {data.alertas.length === 0 && (
          <p className="text-sm text-amber-500">
            Se recomienda seleccionar al menos una alerta.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>
          Frecuencia de notificaciones <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={data.frecuencia}
          onValueChange={(v) =>
            onChange({
              ...data,
              frecuencia: v as NotificationPrefs["frecuencia"],
            })
          }
          className="space-y-2"
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="inmediata" />
            <div>
              <p className="text-sm font-medium">Inmediata</p>
              <p className="text-xs text-gray-500">
                Un email por cada evento
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="diario" />
            <div>
              <p className="text-sm font-medium">Resumen diario</p>
              <p className="text-xs text-gray-500">
                Email consolidado a las 6:00 PM
              </p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <RadioGroupItem value="semanal" />
            <div>
              <p className="text-sm font-medium">Resumen semanal</p>
              <p className="text-xs text-gray-500">
                Email consolidado los lunes a las 8:00 AM
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>
          Canal preferido <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={data.canales.includes("email")}
            onCheckedChange={() => toggleCanal("email")}
          />
          <span className="text-sm">Email</span>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={data.canales.includes("whatsapp")}
            onCheckedChange={() => toggleCanal("whatsapp")}
          />
          <span className="text-sm">
            WhatsApp{" "}
            <span className="text-gray-400">(requiere verificacion)</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Step 5: ReviewStep
// =============================================================================

function ReviewStep({
  data,
  companies,
  onGoToStep,
}: {
  data: WizardData;
  companies: CompanyOption[];
  onGoToStep: (step: number) => void;
}) {
  const { personalInfo, credentials, selectedCompanyIds, notifications } = data;

  const roleLabels: Record<Credentials["rol"], string> = {
    consultor: "Consultor",
    consultor_senior: "Consultor Senior",
    admin: "Administrador",
  };

  const frecuenciaLabels: Record<NotificationPrefs["frecuencia"], string> = {
    inmediata: "Inmediata",
    diario: "Resumen diario",
    semanal: "Resumen semanal",
  };

  const selectedCompanies = companies.filter((c) =>
    selectedCompanyIds.includes(c.id)
  );

  const Section = ({
    title,
    step,
    children,
  }: {
    title: string;
    step: number;
    children: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGoToStep(step)}
          className="text-blue-600 hover:text-blue-800"
        >
          Editar
        </Button>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Datos Personales" step={0}>
        <p>
          <span className="text-gray-500">Nombre:</span> {personalInfo.nombre}
        </p>
        <p>
          <span className="text-gray-500">Email:</span> {personalInfo.email}
        </p>
        <p>
          <span className="text-gray-500">Cedula:</span> {personalInfo.cedula}
        </p>
        {personalInfo.telefono && (
          <p>
            <span className="text-gray-500">Telefono:</span>{" "}
            {personalInfo.telefono}
          </p>
        )}
        {personalInfo.fotoPreview && (
          <div className="mt-2">
            <img
              src={personalInfo.fotoPreview}
              alt="Foto"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
        )}
      </Section>

      <Section title="Rol y Credenciales" step={1}>
        <p>
          <span className="text-gray-500">Rol:</span>{" "}
          {roleLabels[credentials.rol]}
        </p>
        <p>
          <span className="text-gray-500">Clave:</span>{" "}
          {credentials.useTempPassword
            ? "Enlace temporal (se enviara por email)"
            : "Clave manual configurada"}
        </p>
      </Section>

      <Section title={`Empresas Asignadas (${selectedCompanies.length})`} step={2}>
        {selectedCompanies.length > 0 ? (
          <ul className="list-disc list-inside">
            {selectedCompanies.map((c) => (
              <li key={c.id}>
                {c.razon_social}{" "}
                <span className="text-gray-400">({c.nit})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-amber-500">Sin empresas asignadas</p>
        )}
      </Section>

      <Section title="Notificaciones" step={3}>
        <p>
          <span className="text-gray-500">Alertas:</span>{" "}
          {notifications.alertas.length > 0
            ? notifications.alertas.map((a) => ALERT_LABELS[a]).join(", ")
            : "Ninguna"}
        </p>
        <p>
          <span className="text-gray-500">Frecuencia:</span>{" "}
          {frecuenciaLabels[notifications.frecuencia]}
        </p>
        <p>
          <span className="text-gray-500">Canal:</span>{" "}
          {notifications.canales.join(", ")}
        </p>
      </Section>
    </div>
  );
}

// =============================================================================
// Main Wizard Component
// =============================================================================

export default function ConsultantOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    nombre: "",
    email: "",
    cedula: "",
    telefono: "",
    fotoFile: null,
    fotoPreview: null,
  });

  const [credentials, setCredentials] = useState<Credentials>({
    rol: "consultor",
    useTempPassword: true,
    manualPassword: "",
    confirmPassword: "",
  });

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    alertas: ["pila_vencida", "equipos_vencer", "examenes_pendientes"],
    frecuencia: "diario",
    canales: ["email"],
  });

  const wizardData: WizardData = {
    personalInfo,
    credentials,
    selectedCompanyIds,
    notifications,
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          personalInfo.nombre.length >= 3 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email) &&
          personalInfo.cedula.length >= 6
        );
      case 1:
        if (credentials.useTempPassword) return true;
        return (
          credentials.manualPassword.length >= 8 &&
          /[A-Z]/.test(credentials.manualPassword) &&
          /[0-9]/.test(credentials.manualPassword) &&
          credentials.manualPassword === credentials.confirmPassword
        );
      case 2:
        return true; // Companies are optional
      case 3:
        return notifications.canales.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNext = () => {
    if (currentStep < STEP_LABELS.length - 1 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToStep = (step: number) => {
    setCurrentStep(step);
  };

  // ---------------------------------------------------------------------------
  // Save Draft (localStorage)
  // ---------------------------------------------------------------------------

  const handleSaveDraft = () => {
    // TODO: Persist to localStorage
    // localStorage.setItem('consultant_onboarding_draft', JSON.stringify(wizardData));
    // toast.success("Borrador guardado");
    console.log("DRAFT: Save to localStorage", wizardData);
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Step 1 — Create user in Supabase Auth
      // const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      //   email: personalInfo.email,
      //   password: credentials.useTempPassword ? crypto.randomUUID() : credentials.manualPassword,
      //   email_confirm: true,
      // });

      // TODO: Step 2 — Insert into `usuarios` table
      // const { error: userError } = await supabase.from('usuarios').insert({
      //   auth_user_id: authUser.user.id,
      //   email: personalInfo.email,
      //   nombre: personalInfo.nombre,
      //   rol: credentials.rol,
      //   activo: true,
      // });

      // TODO: Step 3 — Upload photo to Supabase Storage if provided
      // if (personalInfo.fotoFile) {
      //   await supabase.storage.from('avatars').upload(`${userId}/${personalInfo.fotoFile.name}`, personalInfo.fotoFile);
      // }

      // TODO: Step 4 — Update empresas_cliente.consultor_id
      // for (const empresaId of selectedCompanyIds) {
      //   await supabase.from('empresas_cliente').update({ consultor_id: userId }).eq('id', empresaId);
      // }

      // TODO: Step 5 — Insert notification preferences
      // for (const alerta of notifications.alertas) {
      //   await supabase.from('preferencias_notificacion').insert({
      //     usuario_id: userId,
      //     tipo_alerta: alerta,
      //     activo: true,
      //     frecuencia: notifications.frecuencia,
      //     canal: notifications.canales[0],
      //   });
      // }

      // TODO: Step 6 — Generate password reset link if using temp password
      // if (credentials.useTempPassword) {
      //   const { data: linkData } = await supabase.auth.admin.generateLink({
      //     type: 'recovery',
      //     email: personalInfo.email,
      //   });
      // }

      // TODO: Step 7 — Send welcome email via Edge Function
      // await supabase.functions.invoke('send-welcome-email', {
      //   body: { nombre: personalInfo.nombre, email: personalInfo.email, resetLink, empresas: selectedCompanies }
      // });

      // TODO: Step 8 — Log activity
      // await logsService.log({
      //   tipo: 'usuario_creado',
      //   modulo: 'usuarios',
      //   descripcion: `Consultor ${personalInfo.nombre} creado con rol ${credentials.rol}`,
      //   metadata: { rol: credentials.rol, empresas: selectedCompanyIds },
      // });

      // TODO: toast.success("Consultor creado exitosamente");
      // TODO: navigate to /usuarios or /consultores

      console.log("DRAFT: Submit wizard", wizardData);
    } catch (error) {
      console.error("Error creating consultant:", error);
      // TODO: toast.error("Error al crear el consultor");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render current step content
  // ---------------------------------------------------------------------------

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep data={personalInfo} onChange={setPersonalInfo} />
        );
      case 1:
        return (
          <CredentialsStep data={credentials} onChange={setCredentials} />
        );
      case 2:
        return (
          <CompaniesStep
            selectedIds={selectedCompanyIds}
            onChange={setSelectedCompanyIds}
          />
        );
      case 3:
        return (
          <NotificationsStep
            data={notifications}
            onChange={setNotifications}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={wizardData}
            companies={MOCK_COMPANIES}
            onGoToStep={handleGoToStep}
          />
        );
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Component render
  // ---------------------------------------------------------------------------

  const progressPercent = ((currentStep + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Onboarding de Consultor</h1>
        <p className="text-gray-500">
          Registra un nuevo consultor en el sistema paso a paso.
        </p>
      </div>

      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Paso {currentStep + 1} de {STEP_LABELS.length}
          </span>
          <span className="font-medium">{STEP_LABELS[currentStep]}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between">
          {STEP_LABELS.map((label, idx) => {
            const Icon = STEP_ICONS[idx];
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={label}
                onClick={() => idx <= currentStep && handleGoToStep(idx)}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive
                    ? "text-blue-600 font-medium"
                    : isCompleted
                    ? "text-green-600 cursor-pointer"
                    : "text-gray-400"
                }`}
                disabled={idx > currentStep}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(STEP_ICONS[currentStep], {
              className: "h-5 w-5",
            })}
            {STEP_LABELS[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Atras
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-1" />
            Guardar borrador
          </Button>

          {currentStep < STEP_LABELS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-1" />
              {isSubmitting
                ? "Creando..."
                : "Crear consultor y enviar credenciales"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
