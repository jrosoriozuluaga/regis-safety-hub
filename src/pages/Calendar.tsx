import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Stethoscope,
  Users,
  Siren,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { empresasService } from "@/services";
import type { Empresa } from "@/types/domain";

type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  modulo: "pila" | "examenes" | "comites" | "emergencias";
  empresa: string;
  empresaId: string;
  estado?: string;
};

const MODULO_COLORS: Record<string, string> = {
  pila: "bg-blue-100 text-blue-800 border-blue-200",
  examenes: "bg-purple-100 text-purple-800 border-purple-200",
  comites: "bg-emerald-100 text-emerald-800 border-emerald-200",
  emergencias: "bg-orange-100 text-orange-800 border-orange-200",
};

const MODULO_ICONS: Record<string, React.ElementType> = {
  pila: FileText,
  examenes: Stethoscope,
  comites: Users,
  emergencias: Siren,
};

const MODULO_LABELS: Record<string, string> = {
  pila: "PILA",
  examenes: "Examen",
  comites: "Comité",
  emergencias: "Emergencia",
};

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaFilter, setEmpresaFilter] = useState<string>("__all__");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    empresasService.list().then(setEmpresas);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadEvents() {
      setLoading(true);
      try {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const endDay = getDaysInMonth(year, month);
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;

      const allEvents: CalendarEvent[] = [];

      // PILA deadlines (periodo matches this month)
      const periodo = `${year}-${String(month + 1).padStart(2, "0")}`;
      const { data: pilas } = await supabase
        .from("pila_records")
        .select("id, periodo, estado, empresa_id, empresas_cliente(razon_social)")
        .eq("periodo", periodo);

      (pilas ?? []).forEach((p: any) => {
        allEvents.push({
          id: `pila-${p.id}`,
          date: `${p.periodo}-15`, // PILA deadline is 15th of following month, but show in period month
          title: `PILA ${p.periodo}`,
          modulo: "pila",
          empresa: p.empresas_cliente?.razon_social ?? "",
          empresaId: p.empresa_id,
          estado: p.estado,
        });
      });

      // Medical exams this month
      const { data: exams } = await supabase
        .from("examenes_medicos")
        .select("id, fecha_examen, tipo_examen, empresa_id, trabajadores(nombre), empresas_cliente(razon_social)")
        .gte("fecha_examen", startDate)
        .lte("fecha_examen", endDate);

      (exams ?? []).forEach((e: any) => {
        allEvents.push({
          id: `exam-${e.id}`,
          date: e.fecha_examen,
          title: `${e.tipo_examen ?? "Examen"} — ${e.trabajadores?.nombre ?? ""}`,
          modulo: "examenes",
          empresa: e.empresas_cliente?.razon_social ?? "",
          empresaId: e.empresa_id,
        });
      });

      // Committee meetings (actas) this month
      const { data: actas } = await supabase
        .from("actas_comite")
        .select("id, fecha_reunion, comite_id, comites(tipo, empresa_id, empresas_cliente(razon_social))")
        .gte("fecha_reunion", startDate)
        .lte("fecha_reunion", endDate);

      (actas ?? []).forEach((a: any) => {
        allEvents.push({
          id: `acta-${a.id}`,
          date: a.fecha_reunion,
          title: `Reunión ${a.comites?.tipo ?? "Comité"}`,
          modulo: "comites",
          empresa: a.comites?.empresas_cliente?.razon_social ?? "",
          empresaId: a.comites?.empresa_id ?? "",
        });
      });

      // Emergency plans created this month
      const { data: planes } = await supabase
        .from("planes_emergencia")
        .select("id, fecha_elaboracion, empresa_id, empresas_cliente(razon_social)")
        .gte("fecha_elaboracion", startDate)
        .lte("fecha_elaboracion", endDate);

      (planes ?? []).forEach((p: any) => {
        allEvents.push({
          id: `plan-${p.id}`,
          date: p.fecha_elaboracion,
          title: "Plan de emergencia",
          modulo: "emergencias",
          empresa: p.empresas_cliente?.razon_social ?? "",
          empresaId: p.empresa_id,
        });
      });

      if (mounted) {
        setEvents(allEvents);
        setLoading(false);
      }
      } catch (err) {
        console.error("Error loading calendar events:", err);
        if (mounted) setLoading(false);
      }
    }
    loadEvents();
    return () => { mounted = false; };
  }, [year, month]);

  const filteredEvents = useMemo(() => {
    if (empresaFilter === "__all__") return events;
    return events.filter((e) => e.empresaId === empresaFilter);
  }, [events, empresaFilter]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = now.toISOString().split("T")[0];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDate(null);
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(today);
  };

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] ?? []) : [];

  // Summary counts
  const moduloCounts = filteredEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.modulo] = (acc[e.modulo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Calendario SG-SST
          </h1>
          <p className="text-muted-foreground mt-1">
            Vista consolidada de eventos, vencimientos y reuniones.
          </p>
        </div>
        <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Todas las empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las empresas</SelectItem>
            {empresas.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Module summary badges */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(moduloCounts).map(([mod, count]) => {
          const Icon = MODULO_ICONS[mod] ?? CalendarDays;
          return (
            <Badge key={mod} variant="outline" className={cn("gap-1.5 py-1 px-2.5", MODULO_COLORS[mod])}>
              <Icon className="h-3.5 w-3.5" />
              {count} {MODULO_LABELS[mod] ?? mod}
            </Badge>
          );
        })}
        {filteredEvents.length === 0 && !loading && (
          <span className="text-sm text-muted-foreground">Sin eventos este mes</span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg">
                {MONTHS_ES[month]} {year}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={goToday}>Hoy</Button>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
                {/* Day headers */}
                {DAYS_ES.map((d) => (
                  <div key={d} className="bg-card text-center text-xs font-medium text-muted-foreground py-2">
                    {d}
                  </div>
                ))}
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-card min-h-[80px]" />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = eventsByDate[dateStr] ?? [];
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                      className={cn(
                        "bg-card min-h-[80px] p-1 text-left transition-colors hover:bg-muted/50 relative",
                        isSelected && "ring-2 ring-primary ring-inset",
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center h-6 w-6 text-xs font-medium rounded-full",
                        isToday && "bg-primary text-primary-foreground",
                      )}>
                        {day}
                      </span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className={cn(
                              "text-xs leading-tight px-1 py-0.5 rounded truncate border",
                              MODULO_COLORS[ev.modulo],
                            )}
                          >
                            {MODULO_LABELS[ev.modulo]}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEvents.length - 3} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event detail sidebar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("es-CO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Selecciona un día"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground py-4">
                Haz clic en un día del calendario para ver los eventos.
              </p>
            ) : selectedEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin eventos este día</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => {
                  const Icon = MODULO_ICONS[ev.modulo] ?? CalendarDays;
                  return (
                    <div key={ev.id} className={cn("rounded-lg border p-3", MODULO_COLORS[ev.modulo])}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase">{MODULO_LABELS[ev.modulo]}</span>
                        {ev.estado && (
                          <Badge variant={ev.estado === "cargada" ? "default" : ev.estado === "vencida" ? "destructive" : "secondary"} className="text-xs ml-auto">
                            {ev.estado}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs opacity-75 mt-0.5">{ev.empresa}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
