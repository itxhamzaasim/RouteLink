"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateRegister } from "@/lib/validations/auth";
import type { RegisterCredentials } from "@/types";
import { cn } from "@/lib/utils";

const compressImage = (file: File, maxW: number = 500, maxH: number = 500): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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
    vehicleType: "",
    vehicleRegistration: "",
    drivingLicense: "",
    avatarUrl: "",
  });
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState("");
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        setRedirectTo(redirect);
      }
    }
  }, []);

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
      const payload = {
        ...credentials,
        vehiclePhotos: vehiclePhotoUrl.trim() ? [vehiclePhotoUrl.trim()] : [],
      };
      await register(payload, redirectTo);
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
            placeholder="Hamza"
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
            placeholder="Asim"
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
          placeholder="+92 300 1234567"
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

      {credentials.role === "driver" && (
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4">
          <h3 className="font-semibold text-neutral-800 text-sm">Driver Profile & Vehicle Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="avatarFile">Profile Photo</Label>
            <div className="flex items-center gap-3">
              {credentials.avatarUrl ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={credentials.avatarUrl}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange("avatarUrl", "")}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 shadow-xs scale-75"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="size-12 shrink-0 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <Input
                id="avatarFile"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 300, 300);
                      handleChange("avatarUrl", compressed);
                    } catch (err) {
                      console.error("Failed to compress avatar image:", err);
                    }
                  }
                }}
                className="h-11 bg-white text-xs pt-2.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Input
                id="vehicleType"
                placeholder="e.g., Honda Civic, Toyota Corolla"
                value={credentials.vehicleType || ""}
                onChange={(e) => handleChange("vehicleType", e.target.value)}
                aria-invalid={!!errors.vehicleType}
                className="h-11 bg-white"
              />
              {errors.vehicleType && (
                <p className="text-sm text-red-600">{errors.vehicleType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleRegistration">Registration Number</Label>
              <Input
                id="vehicleRegistration"
                placeholder="e.g., LEB-1234"
                value={credentials.vehicleRegistration || ""}
                onChange={(e) => handleChange("vehicleRegistration", e.target.value)}
                aria-invalid={!!errors.vehicleRegistration}
                className="h-11 bg-white"
              />
              {errors.vehicleRegistration && (
                <p className="text-sm text-red-600">{errors.vehicleRegistration}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehiclePhotoFile">Vehicle Photo</Label>
            <div className="flex items-center gap-3">
              {vehiclePhotoUrl ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehiclePhotoUrl}
                    alt="Vehicle preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setVehiclePhotoUrl("")}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 shadow-xs scale-75"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="size-12 shrink-0 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <Input
                id="vehiclePhotoFile"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 500, 500);
                      setVehiclePhotoUrl(compressed);
                    } catch (err) {
                      console.error("Failed to compress vehicle image:", err);
                    }
                  }
                }}
                className="h-11 bg-white text-xs pt-2.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drivingLicenseFile">Driving License (Optional)</Label>
            <div className="flex items-center gap-3">
              {credentials.drivingLicense ? (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={credentials.drivingLicense}
                    alt="License preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange("drivingLicense", "")}
                    className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600 shadow-xs scale-75"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="size-12 shrink-0 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
              <Input
                id="drivingLicenseFile"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 500, 500);
                      handleChange("drivingLicense", compressed);
                    } catch (err) {
                      console.error("Failed to compress license image:", err);
                    }
                  }
                }}
                className="h-11 bg-white text-xs pt-2.5"
              />
            </div>
          </div>
        </div>
      )}

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
