"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  authRequests,
  clearTokens,
  getRefreshToken,
  registerLogoutHandler,
} from "@/src/services/apiClient";
import { AuthUser } from "@/src/types/auth";

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const unregister = registerLogoutHandler(() => {
      clearTokens();
      setUser(null);
      router.push("/login");
    });

    return unregister;
  }, [router]);

  const bootstrap = useCallback(async () => {
    const hasRefresh = getRefreshToken();
    if (!hasRefresh) {
      setIsBootstrapping(false);
      return;
    }

    try {
      const session = await authRequests.refresh();
      setUser(session.user);
    } catch (error) {
      clearTokens();
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      const session = await authRequests.login(credentials);
      setUser(session.user);
      router.push("/dashboard");
    },
    [router]
  );

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      signIn,
      signOut,
    }),
    [user, isBootstrapping, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
