import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export function AdminRoute() {
  const { user } = useAuth();
  const toasted = useRef(false);

  useEffect(() => {
    if (user && user.role === "cliente" && !toasted.current) {
      toast.error("No tienes permisos para acceder a esta sección.");
      toasted.current = true;
    }
  }, [user]);

  if (user?.role === "cliente") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
