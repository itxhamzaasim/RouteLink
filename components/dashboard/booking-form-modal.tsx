"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, Users, MapPin, DollarSign, ArrowRight } from "lucide-react";
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
import { bookingService } from "@/services/booking.service";
import type { Ride } from "@/types";

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ride: Ride | null;
  onSuccess: () => void;
}

export function BookingFormModal({
  open,
  onOpenChange,
  ride,
  onSuccess,
}: BookingFormModalProps) {
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSeatsBooked(1);
    setError("");
  }, [ride, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ride) return;

    if (seatsBooked <= 0 || seatsBooked > ride.availableSeats) {
      setError(`Please request between 1 and ${ride.availableSeats} seat(s).`);
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to submit a request.");
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

    try {
      await bookingService.createBooking(ride.id, seatsBooked, token);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDeparture = (isoString?: string) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Request Seats</SheetTitle>
          <SheetDescription>
            Submit a request to join this carpool. The driver will review and confirm your seats.
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="mx-4 my-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {ride && (
          <form onSubmit={handleSubmit} className="space-y-6 px-4 pb-8 pt-4">
            {/* Trip summary */}
            <div className="bg-neutral-50 rounded-xl p-4 space-y-3 text-sm text-neutral-600 border border-neutral-100">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-semibold text-neutral-900 truncate">Driver: {ride.driverName}</span>
                <span className="text-xs text-neutral-400">Rating: {ride.driverRating.toFixed(1)} ★</span>
              </div>
              <div className="flex gap-2">
                <MapPin className="size-4 text-brand-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-400">Route</p>
                  <p className="font-medium text-neutral-900">{ride.origin.city} &rarr; {ride.destination.city}</p>
                  <p className="text-xs text-neutral-500">{ride.origin.address} &middot; {ride.destination.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-neutral-400" />
                <span>{formatDeparture(ride.departureTime)}</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="seatsBooked">How many seats do you want?</Label>
                <div className="relative">
                  <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="seatsBooked"
                    type="number"
                    min={1}
                    max={ride.availableSeats}
                    value={seatsBooked}
                    onChange={(e) => setSeatsBooked(Math.min(ride.availableSeats, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="h-11 pl-10 text-neutral-900"
                  />
                </div>
                <span className="text-xs text-neutral-400">Maximum available seats: {ride.availableSeats}</span>
              </div>

              {/* Price Calculation summary */}
              <div className="flex items-center justify-between bg-brand-50/20 border border-brand-100 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-brand-800 uppercase font-bold tracking-wider">Estimated Cost</p>
                  <p className="text-2xl font-black text-brand-900 mt-0.5">Rs. {seatsBooked * ride.pricePerSeat}</p>
                </div>
                <span className="text-xs text-brand-600 font-medium">Rs. {ride.pricePerSeat} / seat</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  Send Request
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
