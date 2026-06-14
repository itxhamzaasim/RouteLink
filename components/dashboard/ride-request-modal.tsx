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
import type { RideRequest } from "@/types";

interface RideRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RideRequest | null;
  onSuccess: () => void;
}

export function RideRequestModal({
  open,
  onOpenChange,
  request,
  onSuccess,
}: RideRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getTodayStr = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    originAddress: "",
    originCity: "Lahore",
    destinationAddress: "",
    destinationCity: "Lahore",
    date: getTodayStr(),
    time: "",
    seatsNeeded: 1,
    proposedPrice: 100,
  });

  // Populate data when editing
  useEffect(() => {
    if (request) {
      const departureDate = new Date(request.departureTime);
      const yyyy = departureDate.getFullYear();
      const mm = String(departureDate.getMonth() + 1).padStart(2, "0");
      const dd = String(departureDate.getDate()).padStart(2, "0");
      const hours = String(departureDate.getHours()).padStart(2, "0");
      const minutes = String(departureDate.getMinutes()).padStart(2, "0");

      setFormData({
        originAddress: request.origin.address,
        originCity: request.origin.city,
        destinationAddress: request.destination.address,
        destinationCity: request.destination.city,
        date: `${yyyy}-${mm}-${dd}`,
        time: `${hours}:${minutes}`,
        seatsNeeded: request.seatsNeeded,
        proposedPrice: request.proposedPrice,
      });
    } else {
      setFormData({
        originAddress: "",
        originCity: "Lahore",
        destinationAddress: "",
        destinationCity: "Lahore",
        date: getTodayStr(),
        time: "",
        seatsNeeded: 1,
        proposedPrice: 100,
      });
    }
    setError("");
    setValidationErrors({});
  }, [request, open]);

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
    if (!formData.time) errs.time = "Departure time is required";
    if (formData.seatsNeeded <= 0) errs.seatsNeeded = "Must request at least 1 seat";
    if (formData.proposedPrice < 0) errs.proposedPrice = "Proposed fare cannot be negative";

    // Date check
    if (formData.date && formData.time) {
      const departure = new Date(`${formData.date}T${formData.time}`);
      if (departure.getTime() <= Date.now()) {
        errs.time = "Departure time must be in the future";
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
      seatsNeeded: Number(formData.seatsNeeded),
      proposedPrice: Number(formData.proposedPrice),
    };

    try {
      await rideService.createRideRequest(payload, token);
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
          <SheetTitle>Request a Ride</SheetTitle>
          <SheetDescription>
            Post your requested commute route and proposed seat fare for drivers to see.
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
                  placeholder="e.g. Sector H, DHA Phase 6"
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
                  placeholder="e.g. Lahore"
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
                  placeholder="e.g. Sector Y, Johar Town"
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
                  placeholder="e.g. Lahore"
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
              Schedule & Proposed Price
            </h3>

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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="seatsNeeded">Seats Needed</Label>
                <Input
                  id="seatsNeeded"
                  type="number"
                  min={1}
                  max={8}
                  value={formData.seatsNeeded}
                  onChange={(e) => handleChange("seatsNeeded", parseInt(e.target.value, 10) || 0)}
                  className="h-10"
                />
                {validationErrors.seatsNeeded && (
                  <p className="text-xs text-red-600">{validationErrors.seatsNeeded}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="proposedPrice">Proposed Price (Rs.)</Label>
                <Input
                  id="proposedPrice"
                  type="number"
                  min={0}
                  value={formData.proposedPrice}
                  onChange={(e) => handleChange("proposedPrice", parseInt(e.target.value, 10) || 0)}
                  className="h-10"
                />
                {validationErrors.proposedPrice && (
                  <p className="text-xs text-red-600">{validationErrors.proposedPrice}</p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting request...
              </>
            ) : (
              "Submit Ride Request"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
