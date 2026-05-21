import { PageHeader } from "@/components/common/PageHeader";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { useViewMode } from "@/context/ViewModeContext";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { mode } = useViewMode();
  const { user } = useAuth();
  const isRealAdmin = user?.role === "admin" || user?.role === "consultor";
  const isPreview = isRealAdmin && mode === "client";

  return (
    <div>
      <PageHeader
        title={mode === "admin" ? "Panel general" : "Mi panel SG-SST"}
        description={mode === "admin" ? "Resumen de cumplimiento de tus empresas clientes." : "Estado actual de tu sistema de gestión de seguridad y salud."}
      />
      {mode === "admin" ? <AdminDashboard /> : <ClientDashboard isPreview={isPreview} />}
    </div>
  );
}
