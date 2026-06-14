"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, MapPin, Calendar, Users, MessageSquare, Check, X, XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/providers/auth-provider";
import { bookingService } from "@/services/booking.service";
import type { Booking } from "@/types";

const BOOKING_STATUS_BADGES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-brand-50 text-brand-700 border-brand-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export default function RequestedOffersPage() {
  const { user, isLoading: authLoading } = useAuthContext();
  const router = useRouter();
  
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to manage your requested offers.");
      setIsLoading(false);
      return;
    }

    const token = JSON.parse(rawAuth).accessToken;
    setIsLoading(true);
    setError("");

    try {
      const data = await bookingService.getDriverBookings(token);
      setIncomingBookings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch incoming requested offers.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/dashboard/requested-offers");
      } else if (user.role !== "driver") {
        router.push("/dashboard");
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router, fetchData]);

  const handleAcceptBooking = async (id: string) => {
    if (!confirm("Are you sure you want to accept this passenger's booking request?")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.acceptBooking(id, token);
      alert("Successfully accepted booking request!");
      fetchData(); // Reload to update available seats and other passenger counts
    } catch (err: any) {
      alert(err.message || "Failed to accept booking request.");
    }
  };

  const handleRejectBooking = async (id: string) => {
    if (!confirm("Are you sure you want to decline this passenger's booking request?")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.rejectBooking(id, token);
      alert("Successfully declined booking request.");
      setIncomingBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "rejected" as const } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to decline booking request.");
    }
  };

  const handleContactPassenger = (booking: Booking) => {
    const autoMsg = "Hi, I have accepted your commute booking request!";
    router.push(
      `/dashboard/messages?userId=${booking.passengerId}&name=${encodeURIComponent(
        booking.passengerName
      )}&role=passenger&autoMessage=${encodeURIComponent(autoMsg)}`
    );
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Card className="border-red-200 bg-red-50 text-center py-10">
          <CardContent className="text-red-700 font-medium">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Requested Offers</h1>
        <p className="mt-1 text-neutral-500 text-sm">
          Review and respond to ride requests made by passengers on your posted commutes.
        </p>
      </div>

      {incomingBookings.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">No requested offers yet</p>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
              When passengers request to join your offered rides, their requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {incomingBookings.map((booking) => {
            const sched = formatDateTime(booking.rideDetails.departureTime);
            return (
              <Card key={booking.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-neutral-900 text-sm truncate max-w-[150px]">{booking.passengerName}</p>
                      <span className="text-[10px] text-neutral-400 block">Commuter Request</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-neutral-900">
                        Rs. {booking.totalPrice}
                      </span>
                      <span className="text-[10px] text-neutral-400 block">{booking.seatsBooked} seat(s)</span>
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">From</p>
                        <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{booking.rideDetails.origin.address}</p>
                      </div>
                    </div>
                    <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">To</p>
                        <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{booking.rideDetails.destination.address}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-neutral-400" />
                      <span>Departure: {sched.date} at {sched.time}</span>
                    </div>
                    <Badge variant="outline" className={`capitalize ${BOOKING_STATUS_BADGES[booking.status] || ""}`}>
                      {booking.status}
                    </Badge>
                  </div>

                  {/* Booking actions */}
                  <div className="pt-2">
                    {booking.status === "pending" && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptBooking(booking.id)}
                          className="bg-brand-600 hover:bg-brand-700 text-white w-full text-xs h-9 cursor-pointer flex gap-1 items-center justify-center"
                        >
                          <Check className="size-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectBooking(booking.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-xs h-9 cursor-pointer flex gap-1 items-center justify-center"
                        >
                          <X className="size-4" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {booking.status === "accepted" && (
                      <Button
                        size="sm"
                        onClick={() => handleContactPassenger(booking)}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white w-full text-xs h-9 cursor-pointer flex gap-2 items-center justify-center"
                      >
                        <MessageSquare className="size-4" />
                        Contact Passenger
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
