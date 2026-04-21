"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser } from "@/lib/types";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (payload: { token: string; user: AuthUser } | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("stuach-session");
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { token: string; user: AuthUser };
      setToken(parsed.token);
      setUser(parsed.user);
    } catch {
      window.localStorage.removeItem("stuach-session");
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      setSession: (payload: { token: string; user: AuthUser } | null) => {
        queryClient.clear();
        setToken(payload?.token ?? null);
        setUser(payload?.user ?? null);
        if (payload) {
          window.localStorage.setItem("stuach-session", JSON.stringify(payload));
        } else {
          window.localStorage.removeItem("stuach-session");
        }
      },
    }),
    [queryClient, token, user]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within Providers");
  }
  return context;
}
