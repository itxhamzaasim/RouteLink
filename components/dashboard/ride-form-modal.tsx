"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { rideService } from "@/services/ride.service";
import { useAuthContext } from "@/components/providers/auth-provider";
import type { Ride } from "@/types";

interface RideFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ride: Ride | null;
  onSuccess: () => void;
}

export function RideFormModal({
  open,
  onOpenChange,
  ride,
  onSuccess,
}: RideFormModalProps) {
  const { user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    originAddress: "",
    originCity: "",
    destinationAddress: "",
    destinationCity: "",
    date: "",
    time: "",
    availableSeats: 3,
    pricePerSeat: 15,
    vehicleMake: "",
    vehicleModel: "",
    vehicleLicense: "",
    vehicleColor: "",
  });

  // Populate data when editing
  useEffect(() => {
    if (ride) {
      const departureDate = new Date(ride.departureTime);
      const yyyy = departureDate.getFullYear();
      const mm = String(departureDate.getMonth() + 1).padStart(2, "0");
      const dd = String(departureDate.getDate()).padStart(2, "0");
      const hours = String(departureDate.getHours()).padStart(2, "0");
      const minutes = String(departureDate.getMinutes()).padStart(2, "0");

      setFormData({
        originAddress: ride.origin.address,
        originCity: ride.origin.city,
        destinationAddress: ride.destination.address,
        destinationCity: ride.destination.city,
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hours}:${minutes}`,
        availableSeats: ride.availableSeats,
        pricePerSeat: ride.pricePerSeat,
        vehicleMake: ride.vehicleDetails.make,
        vehicleModel: ride.vehicleDetails.model,
        vehicleLicense: ride.vehicleDetails.licensePlate,
        vehicleColor: ride.vehicleDetails.color || "",
      });
    } else {
      setFormData({
        originAddress: "",
        originCity: "",
        destinationAddress: "",
        destinationCity: "",
        date: "",
        time: "",
        availableSeats: 3,
        pricePerSeat: 15,
        vehicleMake: "",
        vehicleModel: "",
        vehicleLicense: "",
        vehicleColor: "",
      });
    }
    setError("");
    setValidationErrors({});
  }, [ride, open]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.originAddress.trim()) errs.originAddress = "Source address is required";
    if (!formData.originCity.trim()) errs.originCity = "Source city is required";
    if (!formData.destinationAddress.trim()) errs.destinationAddress = "Destination address is required";
    if (!formData.destinationCity.trim()) errs.destinationCity = "Destination city is required";
    if (!formData.date) errs.date = "Departure date is required";
    if (!formData.time) errs.time = "Departure time is required";
    if (formData.availableSeats <= 0) errs.availableSeats = "Must offer at least 1 seat";
    if (formData.pricePerSeat < 0) errs.pricePerSeat = "Price cannot be negative";
    if (!formData.vehicleMake.trim()) errs.vehicleMake = "Car make is required";
    if (!formData.vehicleModel.trim()) errs.vehicleModel = "Car model is required";
    if (!formData.vehicleLicense.trim()) errs.vehicleLicense = "License plate is required";

    // Date check
    if (formData.date && formData.time) {
      const departure = new Date(`${formData.date}T${formData.time}`);
      if (departure.getTime() <= Date.now()) {
        errs.date = "Departure must be in the future";
      }
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Retrieve access token
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Session expired. Please log in again.");
      return;
    }

    let token = "";
    try {
      token = JSON.parse(rawAuth).accessToken;
    } catch {
      setError("Authentication credentials missing.");
      return;
    }

    setIsLoading(true);
    setError("");

    const departureTime = new Date(`${formData.date}T${formData.time}`).toISOString();

    const payload = {
      origin: {
        address: formData.originAddress,
        city: formData.originCity,
      },
      destination: {
        address: formData.destinationAddress,
        city: formData.destinationCity,
      },
      departureTime,
      availableSeats: Number(formData.availableSeats),
      pricePerSeat: Number(formData.pricePerSeat),
      vehicleDetails: {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        licensePlate: formData.vehicleLicense,
        color: formData.vehicleColor,
      },
    };

    try {
      if (ride) {
        // Update mode
        await rideService.updateRide(ride.id, payload, token);
      } else {
        // Create mode
        await rideService.createRide(payload, token);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check inputs and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{ride ? "Edit Offered Ride" : "Offer a Ride"}</SheetTitle>
          <SheetDescription>
            {ride
              ? "Update details of your route or vehicle settings."
              : "Post details of your trip and configure seats for passengers."}
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mx-4 my-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-8">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Route Details
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="originAddress">Source Address</Label>
                <Input
                  id="originAddress"
                  placeholder="e.g. 100 Main St"
                  value={formData.originAddress}
                  onChange={(e) => handleChange("originAddress", e.target.value)}
                  className="h-10"
                />
                {validationErrors.originAddress && (
                  <p className="text-xs text-red-600">{validationErrors.originAddress}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="originCity">Source City</Label>
                <Input
                  id="originCity"
                  placeholder="e.g. San Francisco"
                  value={formData.originCity}
                  onChange={(e) => handleChange("originCity", e.target.value)}
                  className="h-10"
                />
                {validationErrors.originCity && (
                  <p className="text-xs text-red-600">{validationErrors.originCity}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input
                  id="destinationAddress"
                  placeholder="e.g. 500 University Ave"
                  value={formData.destinationAddress}
                  onChange={(e) => handleChange("destinationAddress", e.target.value)}
                  className="h-10"
                />
                {validationErrors.destinationAddress && (
                  <p className="text-xs text-red-600">{validationErrors.destinationAddress}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="destinationCity">Destination City</Label>
                <Input
                  id="destinationCity"
                  placeholder="e.g. Berkeley"
                  value={formData.destinationCity}
                  onChange={(e) => handleChange("destinationCity", e.target.value)}
                  className="h-10"
                />
                {validationErrors.destinationCity && (
                  <p className="text-xs text-red-600">{validationErrors.destinationCity}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Schedule & Pricing
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="date">Departure Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="h-10 text-neutral-900"
                />
                {validationErrors.date && (
                  <p className="text-xs text-red-600">{validationErrors.date}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="time">Departure Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className="h-10 text-neutral-900"
                />
                {validationErrors.time && (
                  <p className="text-xs text-red-600">{validationErrors.time}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="availableSeats">Available Seats</Label>
                <Input
                  id="availableSeats"
                  type="number"
                  min={1}
                  max={8}
                  value={formData.availableSeats}
                  onChange={(e) => handleChange("availableSeats", parseInt(e.target.value, 10) || 0)}
                  className="h-10"
                />
                {validationErrors.availableSeats && (
                  <p className="text-xs text-red-600">{validationErrors.availableSeats}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="pricePerSeat">Price per Seat ($)</Label>
                <Input
                  id="pricePerSeat"
                  type="number"
                  min={0}
                  value={formData.pricePerSeat}
                  onChange={(e) => handleChange("pricePerSeat", parseInt(e.target.value, 10) || 0)}
                  className="h-10"
                />
                {validationErrors.pricePerSeat && (
                  <p className="text-xs text-red-600">{validationErrors.pricePerSeat}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Vehicle Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vehicleMake">Car Make</Label>
                <Input
                  id="vehicleMake"
                  placeholder="e.g. Toyota"
                  value={formData.vehicleMake}
                  onChange={(e) => handleChange("vehicleMake", e.target.value)}
                  className="h-10"
                />
                {validationErrors.vehicleMake && (
                  <p className="text-xs text-red-600">{validationErrors.vehicleMake}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="vehicleModel">Car Model</Label>
                <Input
                  id="vehicleModel"
                  placeholder="e.g. Prius"
                  value={formData.vehicleModel}
                  onChange={(e) => handleChange("vehicleModel", e.target.value)}
                  className="h-10"
                />
                {validationErrors.vehicleModel && (
                  <p className="text-xs text-red-600">{validationErrors.vehicleModel}</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="vehicleLicense">License Plate</Label>
                <Input
                  id="vehicleLicense"
                  placeholder="e.g. 7XYZ123"
                  value={formData.vehicleLicense}
                  onChange={(e) => handleChange("vehicleLicense", e.target.value)}
                  className="h-10"
                />
                {validationErrors.vehicleLicense && (
                  <p className="text-xs text-red-600">{validationErrors.vehicleLicense}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="vehicleColor">Color (Optional)</Label>
                <Input
                  id="vehicleColor"
                  placeholder="e.g. Silver"
                  value={formData.vehicleColor}
                  onChange={(e) => handleChange("vehicleColor", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {ride ? "Saving changes..." : "Creating ride..."}
              </>
            ) : (
              ride ? "Save changes" : "Create Ride"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
