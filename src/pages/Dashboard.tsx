import { PageHeader } from "@/components/common/PageHeader";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { useViewMode } from "@/context/ViewModeContext";

export default function Dashboard() {
  const { mode } = useViewMode();
  return (
    <div>
      <PageHeader
        title={mode === "admin" ? "Panel general" : "Mi panel SG-SST"}
        description={mode === "admin" ? "Resumen de cumplimiento de tus empresas clientes." : "Estado actual de tu sistema de gestión de seguridad y salud."}
      />
      {mode === "admin" ? <AdminDashboard /> : <ClientDashboard />}
    </div>
  );
}
