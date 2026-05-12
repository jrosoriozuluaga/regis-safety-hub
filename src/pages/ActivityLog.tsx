import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logsService, type LogActividad, empresasService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  History,
  Search,
  Loader2,
  FileText,
  Stethoscope,
  ShieldAlert,
  Users,
  Siren,
  ClipboardCheck,
  Briefcase,
  UserCog,
  Settings2,
  HardHat,
} from "lucide-react";
import type { Empresa } from "@/types/domain";

const MODULO_ICONS: Record<string, React.ElementType> = {
  pila: FileText,
  examenes: Stethoscope,
  matrices: ShieldAlert,
  comites: Users,
  emergencias: Siren,
  cumplimiento: ClipboardCheck,
  empresas: Briefcase,
  usuarios: UserCog,
  trabajadores: HardHat,
  configuracion: Settings2,
};

const MODULO_LABELS: Record<string, string> = {
  pila: "PILA",
  examenes: "Exámenes Médicos",
  matrices: "Matrices de Riesgo",
  comites: "Comités",
  emergencias: "Planes de Emergencia",
  cumplimiento: "Cumplimiento 0312",
  empresas: "Empresas",
  usuarios: "Usuarios",
  trabajadores: "Trabajadores",
  configuracion: "Configuración",
};

const TIPO_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  crear: "default",
  actualizar: "secondary",
  eliminar: "destructive",
  desactivar: "destructive",
  activar: "default",
  cargar: "default",
  generar: "default",
  enviar: "default",
  login: "outline",
  configurar: "secondary",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ActivityLog() {
  const [search, setSearch] = useState("");
  const [moduloFilter, setModuloFilter] = useState<string>("__all__");
  const [empresaFilter, setEmpresaFilter] = useState<string>("__all__");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["logs_actividad", moduloFilter, empresaFilter],
    queryFn: () =>
      logsService.list({
        limit: 200,
        modulo: moduloFilter === "__all__" ? undefined : moduloFilter,
        empresaId: empresaFilter === "__all__" ? undefined : empresaFilter,
      }),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas_for_log"],
    queryFn: empresasService.listAll,
  });

  const filtered = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.descripcion.toLowerCase().includes(q) ||
      log.tipo.toLowerCase().includes(q) ||
      (log.usuario_nombre ?? "").toLowerCase().includes(q) ||
      (log.empresa_nombre ?? "").toLowerCase().includes(q)
    );
  });

  // Get unique modulos from data for filter
  const modulos = [...new Set(logs.map((l) => l.modulo).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-6 w-6" />
          Registro de Actividad
        </h1>
        <p className="text-muted-foreground mt-1">
          Historial de acciones realizadas en la plataforma.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {[...new Set(logs.map((l) => l.usuario_nombre).filter(Boolean))].length}
            </div>
            <p className="text-sm text-muted-foreground">Usuarios Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-emerald-600">
              {[...new Set(logs.map((l) => l.modulo).filter(Boolean))].length}
            </div>
            <p className="text-sm text-muted-foreground">Módulos Afectados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-48"
                />
              </div>
              <Select value={moduloFilter} onValueChange={setModuloFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todos los módulos</SelectItem>
                  {modulos.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODULO_LABELS[m] || m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas las empresas</SelectItem>
                  {empresas.map((e: Empresa) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.razon_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Empresa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {search ? "Sin resultados para la búsqueda." : "No hay registros de actividad."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((log) => {
                    const Icon = MODULO_ICONS[log.modulo ?? ""] ?? History;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {log.usuario_nombre || "Sistema"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{MODULO_LABELS[log.modulo ?? ""] || log.modulo || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={TIPO_COLORS[log.tipo] ?? "outline"} className="text-[10px]">
                            {log.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {log.descripcion}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.empresa_nombre || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
