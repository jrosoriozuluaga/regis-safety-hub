import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

export type ViewMode = "admin" | "client";

type Ctx = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  toggle: () => void;
};

const ViewModeContext = createContext<Ctx | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [mode, setMode] = useState<ViewMode>("admin");

  useEffect(() => {
    if (user) {
      setMode(user.role === "cliente" ? "client" : "admin");
    }
  }, [user]);

  return (
    <ViewModeContext.Provider
      value={{ mode, setMode, toggle: () => setMode(mode === "admin" ? "client" : "admin") }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}
