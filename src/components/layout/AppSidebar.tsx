import { Building2, FileText, Stethoscope, ShieldAlert, Users, Siren, ClipboardCheck, Briefcase, UserCog, HardHat, Settings2, History, CalendarDays, FileBarChart, Mail, FolderOpen, Flame, Activity } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useViewMode } from "@/context/ViewModeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/regis-logo.jpeg";

const items = [
  { title: "Inicio", url: "/", icon: Building2 },
  { title: "PILA", url: "/pila", icon: FileText },
  { title: "Exámenes Médicos", url: "/medical-exams", icon: Stethoscope },
  { title: "Matrices de Riesgo", url: "/risk-matrices", icon: ShieldAlert },
  { title: "Comités", url: "/committees", icon: Users },
  { title: "Planes de Emergencia", url: "/emergency-plans", icon: Siren },
  { title: "Documentos", url: "/documentos", icon: FolderOpen },
  { title: "Cumplimiento 0312", url: "/compliance", icon: ClipboardCheck },
  { title: "Inventario Equipos", url: "/inventario-equipos", icon: Flame },
  { title: "Calendario", url: "/calendario", icon: CalendarDays },
  { title: "Informe", url: "/informe", icon: FileBarChart },
];

const adminItems = [
  { title: "Empresas", url: "/empresas", icon: Briefcase },
  { title: "Usuarios", url: "/usuarios", icon: UserCog },
  { title: "Trabajadores", url: "/trabajadores", icon: HardHat },
  { title: "Configuración", url: "/configuracion", icon: Settings2 },
  { title: "Actividad", url: "/actividad", icon: History },
  { title: "Plantillas Correo", url: "/plantillas-correo", icon: Mail },
  { title: "Observabilidad", url: "/observabilidad", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { mode } = useViewMode();
  const isRealAdmin = user?.role === "admin" || user?.role === "consultor";
  const isAdmin = isRealAdmin && mode === "admin";
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-md bg-white flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logo} alt="Regis Colombia" className="h-9 w-9 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sidebar-foreground font-semibold tracking-wide text-sm">REGIS COLOMBIA</span>
              <span className="text-sidebar-foreground/60 text-[10px] uppercase tracking-wider">SG-SST Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
