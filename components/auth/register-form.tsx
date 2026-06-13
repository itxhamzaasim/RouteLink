"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateRegister } from "@/lib/validations/auth";
import type { RegisterCredentials } from "@/types";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const { register } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "passenger",
    acceptTerms: false,
  });

  const handleChange = <K extends keyof RegisterCredentials>(
    field: K,
    value: RegisterCredentials[K]
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRegister(credentials);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      await register(credentials);
    } catch {
      setFormError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            placeholder="Alex"
            value={credentials.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            aria-invalid={!!errors.firstName}
            className="h-11"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            placeholder="Rivera"
            value={credentials.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            aria-invalid={!!errors.lastName}
            className="h-11"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={credentials.email}
          onChange={(e) => handleChange("email", e.target.value)}
          aria-invalid={!!errors.email}
          className="h-11"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          value={credentials.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          aria-invalid={!!errors.phone}
          className="h-11"
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>I want to</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["passenger", "driver"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleChange("role", role)}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors",
                credentials.role === role
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              )}
            >
              {role === "passenger" ? "Find rides" : "Offer rides"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={credentials.password}
            onChange={(e) => handleChange("password", e.target.value)}
            aria-invalid={!!errors.password}
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={credentials.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          aria-invalid={!!errors.confirmPassword}
          className="h-11"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="acceptTerms"
          type="checkbox"
          checked={credentials.acceptTerms}
          onChange={(e) => handleChange("acceptTerms", e.target.checked)}
          className="mt-1 size-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-600"
        />
        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed text-neutral-600">
          I agree to the Terms of Service and Privacy Policy
        </Label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600">{errors.acceptTerms}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full bg-brand-600 text-white hover:bg-brand-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
