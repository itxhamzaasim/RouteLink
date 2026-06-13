"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { authService } from "@/services";
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";

export function useAuth() {
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
      return session;
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
      return session;
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

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refresh: hydrate,
  };
}
