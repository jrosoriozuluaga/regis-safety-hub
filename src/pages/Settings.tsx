import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configuracionService, type ConfiguracionSistema } from "@/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings2, Save, Loader2, Globe, Mail, Calendar, FolderOpen, FileText, RefreshCw } from "lucide-react";

type SettingGroup = {
  title: string;
  description: string;
  icon: React.ElementType;
  keys: string[];
};

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "Automatización (n8n)",
    description: "Configuración de webhooks y flujos automatizados.",
    icon: Globe,
    keys: ["n8n_webhook_base_url"],
  },
  {
    title: "PILA",
    description: "Parámetros para solicitud, recordatorios y escalamiento de planillas PILA.",
    icon: Calendar,
    keys: ["pila_dia_solicitud", "pila_dias_recordatorio", "pila_max_recordatorios", "pila_dia_escalamiento"],
  },
  {
    title: "Correo Electrónico",
    description: "Configuración del remitente de correos.",
    icon: Mail,
    keys: ["email_remitente"],
  },
  {
    title: "Google Drive",
    description: "Carpeta raíz para archivado automático de documentos.",
    icon: FolderOpen,
    keys: ["drive_root_folder"],
  },
  {
    title: "Normatividad",
    description: "Resolución de estándares mínimos vigente.",
    icon: FileText,
    keys: ["resolucion_vigente"],
  },
];

const SETTING_LABELS: Record<string, string> = {
  n8n_webhook_base_url: "URL base de webhooks n8n",
  pila_dia_solicitud: "Día del mes para solicitud",
  pila_dias_recordatorio: "Días entre recordatorios",
  pila_max_recordatorios: "Máx. recordatorios antes de escalar",
  pila_dia_escalamiento: "Día del mes para escalamiento",
  email_remitente: "Email remitente",
  drive_root_folder: "ID carpeta raíz en Drive",
  resolucion_vigente: "Resolución vigente",
};

const SETTING_PLACEHOLDERS: Record<string, string> = {
  n8n_webhook_base_url: "https://n8n.example.com/webhook",
  pila_dia_solicitud: "16",
  pila_dias_recordatorio: "3",
  pila_max_recordatorios: "3",
  pila_dia_escalamiento: "25",
  email_remitente: "sgsst@regiscolombia.com",
  drive_root_folder: "ID de Google Drive",
  resolucion_vigente: "0312_2019",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["configuracion"],
    queryFn: configuracionService.list,
  });

  const updateMutation = useMutation({
    mutationFn: ({ clave, valor }: { clave: string; valor: string }) =>
      configuracionService.update(clave, valor),
    onSuccess: (_, { clave }) => {
      queryClient.invalidateQueries({ queryKey: ["configuracion"] });
      setSavingKeys((prev) => { const n = new Set(prev); n.delete(clave); return n; });
      setEditedValues((prev) => { const n = { ...prev }; delete n[clave]; return n; });
      toast({ title: "Guardado", description: `Configuración "${SETTING_LABELS[clave] || clave}" actualizada.` });
    },
    onError: (err: any, { clave }) => {
      setSavingKeys((prev) => { const n = new Set(prev); n.delete(clave); return n; });
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const settingsMap = settings.reduce<Record<string, ConfiguracionSistema>>((acc, s) => {
    acc[s.clave] = s;
    return acc;
  }, {});

  const getValue = (key: string) => {
    if (key in editedValues) return editedValues[key];
    return settingsMap[key]?.valor ?? "";
  };

  const isDirty = (key: string) => {
    return key in editedValues && editedValues[key] !== (settingsMap[key]?.valor ?? "");
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    setSavingKeys((prev) => new Set(prev).add(key));
    updateMutation.mutate({ clave: key, valor: getValue(key) });
  };

  const handleSaveAll = () => {
    const dirtyKeys = Object.keys(editedValues).filter(isDirty);
    dirtyKeys.forEach((key) => {
      setSavingKeys((prev) => new Set(prev).add(key));
      updateMutation.mutate({ clave: key, valor: editedValues[key] });
    });
  };

  const dirtyCount = Object.keys(editedValues).filter(isDirty).length;

  // Collect keys that exist in DB but aren't in any group
  const groupedKeys = new Set(SETTING_GROUPS.flatMap((g) => g.keys));
  const otherSettings = settings.filter((s) => !groupedKeys.has(s.clave));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Configuración del Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Parámetros globales de la plataforma. Los cambios se aplican de inmediato.
          </p>
        </div>
        {dirtyCount > 0 && (
          <Button onClick={handleSaveAll} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar {dirtyCount} cambio{dirtyCount > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {SETTING_GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.title}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5 text-primary" />
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.keys.map((key) => {
                const saving = savingKeys.has(key);
                const dirty = isDirty(key);
                const lastUpdated = settingsMap[key]?.updated_at;
                return (
                  <div key={key} className="flex items-end gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {SETTING_LABELS[key] || key}
                      </Label>
                      <Input
                        id={key}
                        value={getValue(key)}
                        placeholder={SETTING_PLACEHOLDERS[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="max-w-lg"
                      />
                      {lastUpdated && (
                        <p className="text-xs text-muted-foreground">
                          Última actualización: {new Date(lastUpdated).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={dirty ? "default" : "outline"}
                      disabled={!dirty || saving}
                      onClick={() => handleSave(key)}
                      className="shrink-0"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {otherSettings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RefreshCw className="h-5 w-5 text-primary" />
              Otras Configuraciones
            </CardTitle>
            <CardDescription>Parámetros adicionales del sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherSettings.map((s) => {
              const saving = savingKeys.has(s.clave);
              const dirty = isDirty(s.clave);
              return (
                <div key={s.clave} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={s.clave} className="text-sm font-medium flex items-center gap-2">
                      {s.clave}
                      {s.descripcion && (
                        <Badge variant="secondary" className="font-normal text-xs">
                          {s.descripcion}
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id={s.clave}
                      value={getValue(s.clave)}
                      onChange={(e) => handleChange(s.clave, e.target.value)}
                      className="max-w-lg"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant={dirty ? "default" : "outline"}
                    disabled={!dirty || saving}
                    onClick={() => handleSave(s.clave)}
                    className="shrink-0"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
