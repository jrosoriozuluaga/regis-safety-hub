import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "@/types/domain";
import * as authService from "@/services/auth";

type AuthCtx = {
  user: UserProfile | null;
  loading: boolean;
  login: (nit: string, password: string) => Promise<UserProfile>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: async (nit, password) => {
          const u = await authService.login(nit, password);
          setUser(u);
          return u;
        },
        logout: () => {
          authService.logout();
          setUser(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
