import { AUTH_COOKIE_NAME, AUTH_STORAGE_KEY } from "@/lib/constants";
import type {
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types";
import { apiClient } from "./api-client";

/**
 * Auth service layer — swap mock implementations for real API calls
 * when the backend is ready.
 */
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_MOCK_AUTH !== "false";

function createMockUser(partial: Partial<User> & Pick<User, "email">): User {
  return {
    id: crypto.randomUUID(),
    firstName: partial.firstName ?? "Demo",
    lastName: partial.lastName ?? "User",
    email: partial.email,
    phone: partial.phone,
    role: partial.role ?? "passenger",
    isVerified: true,
    createdAt: new Date().toISOString(),
    avatarUrl: partial.avatarUrl,
  };
}

function persistSession(session: AuthSession): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  document.cookie = `${AUTH_COOKIE_NAME}=${session.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

function clearSession(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 800));

      const session: AuthSession = {
        user: createMockUser({
          email: credentials.email,
          firstName: "Alex",
          lastName: "Rivera",
          role: "passenger",
        }),
        accessToken: `mock-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      persistSession(session);
      return session;
    }

    const session = await apiClient<AuthSession>("/auth/login", {
      method: "POST",
      body: credentials,
    });

    persistSession(session);
    return session;
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    if (USE_MOCK_AUTH) {
      await new Promise((r) => setTimeout(r, 1000));

      const session: AuthSession = {
        user: createMockUser({
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phone: credentials.phone,
          role: credentials.role,
        }),
        accessToken: `mock-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      persistSession(session);
      return session;
    }

    const session = await apiClient<AuthSession>("/auth/register", {
      method: "POST",
      body: credentials,
    });

    persistSession(session);
    return session;
  },

  async logout(): Promise<void> {
    if (!USE_MOCK_AUTH) {
      await apiClient("/auth/logout", { method: "POST" }).catch(() => {});
    }

    clearSession();
  },

  getStoredSession(): AuthSession | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = this.getStoredSession();
    if (!session) return null;

    if (USE_MOCK_AUTH) {
      return session.user;
    }

    try {
      const user = await apiClient<User>("/auth/me", {
        token: session.accessToken,
      });
      return user;
    } catch (error) {
      clearSession();
      throw error;
    }
  },
};
