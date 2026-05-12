import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pila from "./pages/Pila";
import MedicalExams from "./pages/MedicalExams";
import RiskMatrices from "./pages/RiskMatrices";
import Committees from "./pages/Committees";
import EmergencyPlans from "./pages/EmergencyPlans";
import Compliance from "./pages/Compliance";
import Companies from "./pages/Companies";
import Users from "./pages/Users";
import Workers from "./pages/Workers";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import CalendarPage from "./pages/Calendar";
import CompanyReport from "./pages/CompanyReport";
import EmailTemplates from "./pages/EmailTemplates";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppInner() {
  const { user } = useAuth();
  return (
    <ViewModeProvider user={user}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pila" element={<Pila />} />
              <Route path="/medical-exams" element={<MedicalExams />} />
              <Route path="/risk-matrices" element={<RiskMatrices />} />
              <Route path="/committees" element={<Committees />} />
              <Route path="/emergency-plans" element={<EmergencyPlans />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/empresas" element={<Companies />} />
              <Route path="/usuarios" element={<Users />} />
              <Route path="/trabajadores" element={<Workers />} />
              <Route path="/configuracion" element={<Settings />} />
              <Route path="/actividad" element={<ActivityLog />} />
              <Route path="/calendario" element={<CalendarPage />} />
              <Route path="/informe" element={<CompanyReport />} />
              <Route path="/plantillas-correo" element={<EmailTemplates />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
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
