import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Users, Lock, UserCheck, Clock } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/regis-logo.jpeg";

type TokenData = {
  comite_id: string;
  acta_id: string;
  fecha: string;
  empresa_nombre: string;
  tipo_comite: string;
  lugar?: string;
  hora_inicio?: string;
  expired: boolean;
};

type PageState = "loading" | "ready" | "invalid" | "expired" | "confirmed";

type Integrante = {
  id: string;
  nombre: string;
  cedula: string;
  cargo_empresa: string;
  rol_comite: string;
  es_principal: boolean;
};

function decodeToken(token: string): TokenData | null {
  try {
    const json = atob(token);
    const data = JSON.parse(json);
    if (!data.c || !data.a) return null;
    const expired = data.exp ? Date.now() > data.exp : false;
    return {
      comite_id: data.c,
      acta_id: data.a,
      fecha: data.f || "",
      empresa_nombre: data.n || "Empresa",
      tipo_comite: data.t || "COPASST",
      lugar: data.l,
      hora_inicio: data.h,
      expired,
    };
  } catch {
    return null;
  }
}

export function generateAsistenciaToken(
  comiteId: string,
  actaId: string,
  fecha: string,
  empresaNombre: string,
  tipoComite: string,
  lugar?: string,
  horaInicio?: string,
  expiryDays = 7
): string {
  const exp = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
  return btoa(
    JSON.stringify({
      c: comiteId,
      a: actaId,
      f: fecha,
      n: empresaNombre,
      t: tipoComite,
      l: lugar,
      h: horaInicio,
      exp,
    })
  );
}

export default function AsistenciaComite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("t") || "";
  const [state, setState] = useState<PageState>("loading");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [confirmados, setConfirmados] = useState<Record<string, boolean>>({});
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      setState("invalid");
      return;
    }
    if (decoded.expired) {
      setState("expired");
      return;
    }
    setTokenData(decoded);

    // Load committee members and existing attendance
    (async () => {
      try {
        const { data: members } = await supabase
          .from("integrantes_comite")
          .select("id, nombre, cedula, cargo_empresa, rol_comite, es_principal")
          .eq("comite_id", decoded.comite_id)
          .eq("activo", true);

        setIntegrantes(members ?? []);

        // Check existing attendance
        const { data: asistencia } = await supabase
          .from("asistencia_comite")
          .select("integrante_id, presente")
          .eq("acta_id", decoded.acta_id);

        const map: Record<string, boolean> = {};
        (asistencia ?? []).forEach((a: any) => {
          if (a.presente) map[a.integrante_id] = true;
        });
        setConfirmados(map);

        setState("ready");
      } catch (err) {
        console.error("Error loading data:", err);
        setState("invalid");
      }
    })();
  }, [token]);

  const handleConfirm = async (integranteId: string) => {
    if (!tokenData) return;
    setConfirming(integranteId);
    try {
      // Check if record already exists
      const { data: existing } = await supabase
        .from("asistencia_comite")
        .select("acta_id")
        .eq("acta_id", tokenData.acta_id)
        .eq("integrante_id", integranteId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("asistencia_comite")
          .update({ presente: true })
          .eq("acta_id", tokenData.acta_id)
          .eq("integrante_id", integranteId);
      } else {
        await supabase
          .from("asistencia_comite")
          .insert({
            acta_id: tokenData.acta_id,
            integrante_id: integranteId,
            presente: true,
          });
      }

      setConfirmados((prev) => ({ ...prev, [integranteId]: true }));
      toast.success("Asistencia confirmada");
    } catch (err: any) {
      console.error("Error confirming:", err);
      toast.error("Error al confirmar asistencia. Intente de nuevo.");
    } finally {
      setConfirming(null);
    }
  };

  const fechaLabel = tokenData?.fecha
    ? new Date(tokenData.fecha).toLocaleDateString("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const tipoLabel: Record<string, string> = {
    copasst: "COPASST",
    convivencia: "Convivencia Laboral",
    vigia: "Vigía SST",
  };

  const confirmedCount = Object.values(confirmados).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <img src={logo} alt="Regis Colombia" className="h-12 w-12 object-contain rounded" />
            <h1 className="text-2xl font-bold text-slate-800">Regis Colombia</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Confirmacion de asistencia — Comite SG-SST
          </p>
        </div>

        {/* Invalid token */}
        {state === "invalid" && (
          <Card className="shadow-lg border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-red-700 mb-2">Enlace invalido</h2>
              <p className="text-sm text-muted-foreground">
                Este enlace de asistencia no es valido. Solicite un nuevo enlace a su consultor de
                Regis Colombia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Expired token */}
        {state === "expired" && (
          <Card className="shadow-lg border-amber-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-amber-700 mb-2">Enlace vencido</h2>
              <p className="text-sm text-muted-foreground">
                Este enlace ya no es valido. Solicite un nuevo enlace a su consultor de Regis
                Colombia.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {state === "loading" && (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Cargando informacion de la reunion...</p>
            </CardContent>
          </Card>
        )}

        {/* Main attendance form */}
        {state === "ready" && tokenData && (
          <>
            <Card className="shadow-lg mb-4">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Asistencia de Comite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    {tokenData.empresa_nombre}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Comite:{" "}
                    <strong>
                      {tipoLabel[tokenData.tipo_comite] || tokenData.tipo_comite}
                    </strong>
                  </p>
                  {fechaLabel && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {fechaLabel}
                      {tokenData.hora_inicio ? ` — ${tokenData.hora_inicio}` : ""}
                    </p>
                  )}
                  {tokenData.lugar && (
                    <p className="text-sm text-muted-foreground">
                      Lugar: {tokenData.lugar}
                    </p>
                  )}
                </div>

                {confirmedCount > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary" className="gap-1">
                      <UserCheck className="h-3 w-3" />
                      {confirmedCount} de {integrantes.length} confirmados
                    </Badge>
                  </div>
                )}

                {/* Members list */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">
                    Integrantes del comite
                  </p>
                  {integrantes.length > 0 ? (
                    integrantes.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{m.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {m.cargo_empresa} — {m.rol_comite}
                            {m.es_principal ? " (Principal)" : " (Suplente)"}
                          </div>
                        </div>
                        {confirmados[m.id] ? (
                          <Badge className="gap-1 bg-green-600 shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Confirmado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="shrink-0 gap-1"
                            disabled={confirming === m.id}
                            onClick={() => handleConfirm(m.id)}
                          >
                            {confirming === m.id ? (
                              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Confirmar
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay integrantes registrados para este comite.
                    </p>
                  )}
                </div>

                {/* Privacy notice */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
                  <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                    <Lock className="h-3 w-3" /> Tratamiento de datos personales
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Al confirmar su asistencia, usted autoriza el tratamiento de sus datos
                    personales conforme a la Ley 1581 de 2012 y la politica de privacidad de Regis
                    Colombia SAS. Los datos seran utilizados exclusivamente para la gestion del
                    Sistema de Seguridad y Salud en el Trabajo (SG-SST).
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Regis Colombia &copy; {new Date().getFullYear()} — Plataforma SG-SST
        </p>
      </div>
    </div>
  );
}
