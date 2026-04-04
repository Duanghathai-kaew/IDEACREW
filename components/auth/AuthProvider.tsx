"use client";

import { authService, AuthUser } from "@/lib/auth/authService";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signInForDevelopment: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function hydrateAuth() {
      const currentUser = await authService.getCurrentUser();
      if (!mounted) return;

      setUser(currentUser);
      setIsLoading(false);
    }

    hydrateAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signInForDevelopment: async () => {
        const signedInUser = await authService.signInForDevelopment();
        setUser(signedInUser);
      },
      signOut: async () => {
        await authService.signOut();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
