import type { User } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: "passenger" | "driver";
  acceptTerms: boolean;
  vehicleType?: string;
  vehicleRegistration?: string;
  vehiclePhotos?: string[];
  drivingLicense?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_EXISTS"
  | "SESSION_EXPIRED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}
