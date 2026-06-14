"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, CheckCircle2, ShieldAlert, AlertTriangle, 
  SwitchCamera, Sparkles, User, Car, ShieldCheck 
} from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    title: "Notifications",
    items: [
      { id: "reminders", label: "Ride reminders", description: "Get notified before your trips" },
      { id: "updates", label: "Booking updates", description: "Status changes on your bookings" },
      { id: "marketing", label: "Marketing emails", description: "Promotions and news from RouteLink" },
    ],
  },
  {
    title: "Privacy",
    items: [
      { id: "show_profile", label: "Show profile to drivers", description: "Let drivers see your profile" },
      { id: "share_history", label: "Share ride history", description: "Display past trips on profile" },
    ],
  },
] as const;

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

export default function SettingsPage() {
  const { user, updateUser } = useAuthContext();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Driver apply state
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");

  // Switch role state
  const [isSwitching, setIsSwitching] = useState(false);

  // Load defaults
  useEffect(() => {
    if (user) {
      setVehicleType(user.vehicleType || "");
      setVehicleRegistration(user.vehicleRegistration || "");
      if (user.vehiclePhotos && user.vehiclePhotos.length > 0) {
        setVehiclePhotoUrl(user.vehiclePhotos[0]);
      }
      setDrivingLicense(user.drivingLicense || "");
    }
  }, [user]);

  const handleApplyRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType.trim() || !vehicleRegistration.trim()) {
      setError("Please fill out both vehicle type and registration number.");
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsLoading(true);
    setSuccess("");
    setError("");

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updatedUser = await authService.applyRider({
        vehicleType: vehicleType.trim(),
        vehicleRegistration: vehicleRegistration.trim(),
        vehiclePhotos: vehiclePhotoUrl.trim() ? [vehiclePhotoUrl.trim()] : [],
        drivingLicense: drivingLicense.trim(),
      }, token);

      updateUser(updatedUser);
      setSuccess("Your rider application has been submitted successfully for verification.");
    } catch (err: any) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchRole = async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsSwitching(true);
    setError("");
    setSuccess("");

    const newRole = user.role === "passenger" ? "driver" : "passenger";

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updatedUser = await authService.switchRole(newRole, token);
      updateUser(updatedUser);
      setSuccess(`Switched to ${newRole === "passenger" ? "Passenger Mode" : "Rider Mode"} successfully!`);
    } catch (err: any) {
      setError(err.message || "Failed to toggle role.");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">Account Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your driver verification status, toggle user roles, and customize alert preferences.
        </p>
      </div>

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <ShieldAlert className="size-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ROLE CONTROLS CARD */}
      <Card className="border-neutral-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-neutral-50/50 border-b">
          <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <SwitchCamera className="size-4 text-brand-600" />
            Mode & Role Toggle
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-neutral-100 text-xs">
            <div>
              <span className="text-neutral-400 font-medium">Currently Using:</span>
              <div className="text-sm font-extrabold text-neutral-950 capitalize flex items-center gap-1.5 mt-0.5">
                {user?.role === "driver" ? (
                  <>
                    <Car className="size-4 text-emerald-600" />
                    Rider Mode (Driver)
                  </>
                ) : (
                  <>
                    <User className="size-4 text-brand-600" />
                    Passenger Mode
                  </>
                )}
              </div>
            </div>
            {user?.isDriverApproved && (
              <Button
                onClick={handleSwitchRole}
                disabled={isSwitching}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg h-9 px-4 text-xs font-semibold"
              >
                {isSwitching ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Switching...
                  </>
                ) : (
                  "Switch Mode"
                )}
              </Button>
            )}
          </div>

          {/* APPLICATION STATUS DISPLAY */}
          {user?.role === "passenger" && (
            <>
              {user.driverApplicationStatus === "pending" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold">
                    <AlertTriangle className="size-4 text-amber-600" />
                    Rider Status: Pending Verification
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    You have submitted a driver application. The admin team is currently reviewing your profile photo, vehicle credentials, and registration numbers. We will verify your account shortly.
                  </p>
                </div>
              )}

              {user.driverApplicationStatus === "rejected" && (
                <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-red-800 font-bold">
                    <ShieldAlert className="size-4 text-red-600" />
                    Rider Status: Application Rejected
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Unfortunately, your driver application details did not meet our verification criteria. You may correct your details and re-apply using the form below.
                  </p>
                </div>
              )}

              {(user.driverApplicationStatus === "none" || user.driverApplicationStatus === "rejected" || !user.driverApplicationStatus) && (
                <form onSubmit={handleApplyRider} className="border-t border-neutral-100 pt-4 space-y-4">
                  <div className="text-sm font-bold text-neutral-950 flex items-center gap-1.5">
                    <Sparkles className="size-4 text-amber-500 fill-amber-500" />
                    Become a Rider (Driver)
                  </div>
                  <p className="text-xs text-neutral-500 leading-normal">
                    Register your vehicle details and documents to offer rides and earn on RouteLink Lahore.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="vehicleType" className="text-xs font-semibold text-neutral-700">Vehicle Type / Model</Label>
                      <Input
                        id="vehicleType"
                        placeholder="e.g. Honda Civic 2022"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="vehicleRegistration" className="text-xs font-semibold text-neutral-700">Registration Number</Label>
                      <Input
                        id="vehicleRegistration"
                        placeholder="e.g. LEB-4932"
                        value={vehicleRegistration}
                        onChange={(e) => setVehicleRegistration(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="vehiclePhotoFile" className="text-xs font-semibold text-neutral-700">Vehicle Photo</Label>
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
                        className="h-10 bg-white text-xs pt-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drivingLicenseFile" className="text-xs font-semibold text-neutral-700">Driving License Image (Optional)</Label>
                    <div className="flex items-center gap-3">
                      {drivingLicense ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={drivingLicense}
                            alt="License preview"
                            className="size-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setDrivingLicense("")}
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
                              setDrivingLicense(compressed);
                            } catch (err) {
                              console.error("Failed to compress license image:", err);
                            }
                          }
                        }}
                        className="h-10 bg-white text-xs pt-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 text-white hover:bg-brand-700 h-10 rounded-xl text-xs font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                        Submitting Application...
                      </>
                    ) : (
                      "Apply for Rider Access"
                    )}
                  </Button>
                </form>
              )}
            </>
          )}

          {user?.role === "driver" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 text-xs flex gap-2.5 items-start">
              <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-emerald-900 font-bold">Rider Account Verified</div>
                <p className="text-neutral-600 leading-normal mt-0.5">
                  Your registration status is fully active. You can switch to Passenger Mode above to find commutes, or switch to Rider Mode to post routes on the map.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MOCK PREFERENCES SECTIONS */}
      {SETTINGS_SECTIONS.map((section) => (
        <Card key={section.title} className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-neutral-900">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <Label htmlFor={item.id} className="text-xs font-bold text-neutral-800">{item.label}</Label>
                  <p className="text-xs text-neutral-500">{item.description}</p>
                </div>
                <input
                  id={item.id}
                  type="checkbox"
                  defaultChecked
                  className="size-4 rounded border-neutral-300 text-brand-600"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* DANGER ZONE */}
      <Card className="border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-neutral-500 leading-normal">
            Permanently delete your commuter account and discard all your ride history. This process is immediate and irreversible.
          </p>
          <Button variant="destructive" className="mt-4 h-10 px-5 text-xs font-semibold rounded-xl bg-red-650 hover:bg-red-750">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
