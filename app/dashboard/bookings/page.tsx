"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Calendar, Users, DollarSign, User, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookingService } from "@/services/booking.service";
import type { Booking } from "@/types";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to view your bookings.");
      setIsLoading(false);
      return;
    }

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await bookingService.getPassengerBookings(token);
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updated = await bookingService.cancelBooking(id, token);
      
      // Update local state status
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking.");
    }
  };

  const formatDeparture = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const STATUS_BADGES = {
    pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    accepted: "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-50",
    rejected: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Bookings</h1>
        <p className="mt-1 text-neutral-500">
          Track your upcoming and past ride bookings
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">
              No bookings yet
            </p>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
              Search for rides on the home page to book your first trip.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const sched = formatDeparture(booking.rideDetails.departureTime);
            return (
              <Card key={booking.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  {/* Status & Total Price */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`capitalize ${STATUS_BADGES[booking.status]}`}>
                      {booking.status}
                    </Badge>
                    <span className="text-lg font-bold text-neutral-950">
                      ${booking.totalPrice}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">From</p>
                        <p className="text-sm font-semibold text-neutral-900">{booking.rideDetails.origin.address}</p>
                        <p className="text-xs text-neutral-500">{booking.rideDetails.origin.city}</p>
                      </div>
                    </div>
                    <div className="h-3 border-l border-dashed border-neutral-300 ml-2"></div>
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">To</p>
                        <p className="text-sm font-semibold text-neutral-900">{booking.rideDetails.destination.address}</p>
                        <p className="text-xs text-neutral-500">{booking.rideDetails.destination.city}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  {/* Date, Driver, Seats */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{sched.date} at {sched.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">Driver: {booking.rideDetails.driverName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                      <Users className="size-3.5 text-neutral-400" />
                      Seats booked: <strong className="text-neutral-900">{booking.seatsBooked}</strong>
                    </span>

                    {["pending", "accepted"].includes(booking.status) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 px-2 flex gap-1 items-center"
                      >
                        <XCircle className="size-3.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
