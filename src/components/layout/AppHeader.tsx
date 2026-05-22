import { useEffect, useState } from "react";
import { Bell, ChevronDown, LogOut, User as UserIcon, Settings, Shield, UserCircle2, AlertTriangle, FileText, Stethoscope, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useViewMode } from "@/context/ViewModeContext";
import { useAuth } from "@/context/AuthContext";
import { alertsService, type AlertItem } from "@/services";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const ALERT_ICON: Record<AlertItem["tipo"], React.ElementType> = {
  pila_vencida: FileText,
  pila_pendiente: FileText,
  examen_restriccion: Stethoscope,
  cumplimiento_bajo: ClipboardCheck,
};

const SEVERITY_COLOR: Record<AlertItem["severidad"], string> = {
  alta: "bg-red-500",
  media: "bg-amber-500",
  baja: "bg-blue-500",
};

const SEVERITY_TEXT: Record<AlertItem["severidad"], string> = {
  alta: "text-red-600",
  media: "text-amber-600",
  baja: "text-blue-600",
};

export function AppHeader() {
  const { mode, setMode } = useViewMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await alertsService.getAlerts();
        if (mounted) setAlerts(data);
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // Refresh alerts every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const highCount = alerts.filter((a) => a.severidad === "alta").length;
  const totalCount = alerts.length;

  const displayName = user?.nombre || user?.companyName || "Invitado";
  const isStaff = user?.role === "admin" || user?.role === "consultor";
  const roleLabel = user?.role === "admin" ? "Administrador" : user?.role === "consultor" ? "Consultor" : user?.companyName;
  const initials = (displayName)
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="h-16 border-b bg-card flex items-center gap-3 px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="flex-1" />

      {/* View toggle — only for admin/consultor */}
      {(user?.role === "admin" || user?.role === "consultor") && (
        <>
          {mode === "client" && (
            <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 bg-amber-50 gap-1">
              <AlertTriangle className="h-3 w-3" />
              Vista previa cliente
            </Badge>
          )}
          <div className="hidden sm:flex items-center rounded-md border bg-muted/50 p-0.5 text-xs">
            {(["admin", "client"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1.5 rounded-[5px] font-medium flex items-center gap-1.5 transition-colors",
                  mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "admin" ? <Shield className="h-3.5 w-3.5" /> : <UserCircle2 className="h-3.5 w-3.5" />}
                {m === "admin" ? "Admin" : "Cliente"}
              </button>
            ))}
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
              <span className={cn(
                "absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center",
                highCount > 0 ? "bg-destructive" : "bg-amber-500"
              )}>
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Alertas del Sistema</span>
            <div className="flex gap-1.5">
              {highCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {highCount} urgente{highCount > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {totalCount} total
              </Badge>
            </div>
          </div>
          <ScrollArea className="max-h-80">
            {loading && totalCount === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Cargando alertas...</div>
            ) : totalCount === 0 ? (
              <div className="py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin alertas pendientes</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Todo está al día</p>
              </div>
            ) : (
              <div className="divide-y">
                {alerts.slice(0, 20).map((alert) => {
                  const Icon = ALERT_ICON[alert.tipo];
                  return (
                    <div key={alert.id} className="flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-default">
                      <div className={cn("mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        alert.severidad === "alta" ? "bg-red-100" : alert.severidad === "media" ? "bg-amber-100" : "bg-blue-100"
                      )}>
                        <Icon className={cn("h-4 w-4", SEVERITY_TEXT[alert.severidad])} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{alert.titulo}</span>
                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", SEVERITY_COLOR[alert.severidad])} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.descripcion}</p>
                      </div>
                    </div>
                  );
                })}
                {totalCount > 20 && (
                  <div className="py-2 text-center text-xs text-muted-foreground border-t">
                    +{totalCount - 20} alertas más
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-[11px] text-muted-foreground">
                {isStaff ? roleLabel : user ? `NIT ${user.nit}` : "—"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{displayName}</span>
              {user && <span className="text-[11px] font-normal text-muted-foreground">{user.contactEmail}</span>}
              {user && <span className="text-[10px] font-normal text-muted-foreground capitalize">{user.role} {!isStaff && user.companyName ? `— ${user.companyName}` : ""}</span>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/perfil")}><UserIcon className="mr-2 h-4 w-4" />Mi Perfil</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/configuracion")}><Settings className="mr-2 h-4 w-4" />Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
