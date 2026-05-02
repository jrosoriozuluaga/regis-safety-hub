import { Bell, ChevronDown, LogOut, User as UserIcon, Settings, Shield, UserCircle2 } from "lucide-react";
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
import { useViewMode } from "@/context/ViewModeContext";
import { mockNotifications } from "@/data/mockNotifications";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { mode, setMode } = useViewMode();
  const unread = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="h-16 border-b bg-card flex items-center gap-3 px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="flex-1" />

      {/* View toggle (prototyping) */}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notificaciones <Badge variant="secondary">{unread} nuevas</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {mockNotifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
              <div className="flex w-full items-center justify-between">
                <span className="font-medium text-sm">{n.title}</span>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </div>
              <span className="text-xs text-muted-foreground">{n.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">RG</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">Regis Admin</span>
              <span className="text-[11px] text-muted-foreground">admin@regiscolombia.com</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><UserIcon className="mr-2 h-4 w-4" />Perfil</DropdownMenuItem>
          <DropdownMenuItem><Settings className="mr-2 h-4 w-4" />Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" />Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
