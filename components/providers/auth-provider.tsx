"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { authService } from "@/services";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const hydrate = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const session = await authService.login(credentials);
      setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
      });
      router.push(ROUTES.dashboard);
    },
    [router]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const session = await authService.register(credentials);
      setState({
        user: session.user,
        isAuthenticated: true,
        isLoading: false,
      });
      router.push(ROUTES.dashboard);
    },
    [router]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    router.push(ROUTES.home);
  }, [router]);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateUser,
    }),
    [state, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
