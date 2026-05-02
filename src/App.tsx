import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewModeProvider } from "@/context/ViewModeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pila from "./pages/Pila";
import MedicalExams from "./pages/MedicalExams";
import RiskMatrices from "./pages/RiskMatrices";
import Committees from "./pages/Committees";
import EmergencyPlans from "./pages/EmergencyPlans";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ViewModeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pila" element={<Pila />} />
              <Route path="/medical-exams" element={<MedicalExams />} />
              <Route path="/risk-matrices" element={<RiskMatrices />} />
              <Route path="/committees" element={<Committees />} />
              <Route path="/emergency-plans" element={<EmergencyPlans />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ViewModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
