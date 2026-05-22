import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Eagerly loaded (login + dashboard are first-paint critical)
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Lazy-loaded modules (split into separate chunks)
const Pila = lazy(() => import("./pages/Pila"));
const MedicalExams = lazy(() => import("./pages/MedicalExams"));
const RiskMatrices = lazy(() => import("./pages/RiskMatrices"));
const Committees = lazy(() => import("./pages/Committees"));
const EmergencyPlans = lazy(() => import("./pages/EmergencyPlans"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Companies = lazy(() => import("./pages/Companies"));
const Users = lazy(() => import("./pages/Users"));
const Workers = lazy(() => import("./pages/Workers"));
const Settings = lazy(() => import("./pages/Settings"));
const ActivityLog = lazy(() => import("./pages/ActivityLog"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const CompanyReport = lazy(() => import("./pages/CompanyReport"));
const EmailTemplates = lazy(() => import("./pages/EmailTemplates"));
const Documents = lazy(() => import("./pages/Documents"));
const EquipmentInventory = lazy(() => import("./pages/EquipmentInventory"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UploadPila = lazy(() => import("./pages/UploadPila"));
const Observability = lazy(() => import("./pages/Observability"));
const Profile = lazy(() => import("./pages/Profile"));
const AsistenciaComite = lazy(() => import("./pages/AsistenciaComite"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function AppInner() {
  const { user } = useAuth();
  return (
    <ViewModeProvider user={user}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/upload-pila" element={<UploadPila />} />
            <Route path="/asistencia-comite" element={<AsistenciaComite />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/pila" element={<Pila />} />
                <Route path="/medical-exams" element={<MedicalExams />} />
                <Route path="/risk-matrices" element={<RiskMatrices />} />
                <Route path="/committees" element={<Committees />} />
                <Route path="/emergency-plans" element={<EmergencyPlans />} />
                <Route path="/compliance" element={<Compliance />} />
                <Route path="/empresas" element={<Companies />} />
                <Route path="/trabajadores" element={<Workers />} />
                <Route path="/calendario" element={<CalendarPage />} />
                <Route path="/informe" element={<CompanyReport />} />
                <Route path="/documentos" element={<Documents />} />
                <Route path="/inventario-equipos" element={<EquipmentInventory />} />
                {/* Admin/Consultor only routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/usuarios" element={<Users />} />
                  <Route path="/configuracion" element={<Settings />} />
                  <Route path="/actividad" element={<ActivityLog />} />
                  <Route path="/plantillas-correo" element={<EmailTemplates />} />
                  <Route path="/observabilidad" element={<Observability />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ViewModeProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
