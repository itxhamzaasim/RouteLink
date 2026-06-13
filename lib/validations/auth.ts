import type { LoginCredentials, RegisterCredentials } from "@/types";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(credentials: LoginCredentials): ValidationResult {
  const errors: Record<string, string> = {};

  if (!credentials.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!credentials.password) {
    errors.password = "Password is required";
  } else if (credentials.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(
  credentials: RegisterCredentials
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!credentials.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!credentials.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!credentials.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!credentials.phone.trim()) {
    errors.phone = "Phone number is required";
  }

  if (!credentials.password) {
    errors.password = "Password is required";
  } else if (credentials.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (credentials.password !== credentials.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (credentials.role === "driver") {
    if (!credentials.vehicleType?.trim()) {
      errors.vehicleType = "Vehicle type is required for drivers";
    }
    if (!credentials.vehicleRegistration?.trim()) {
      errors.vehicleRegistration = "Vehicle registration number is required";
    }
  }

  if (!credentials.acceptTerms) {
    errors.acceptTerms = "You must accept the terms and conditions";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
