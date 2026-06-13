"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Calendar, Users, DollarSign, User, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/providers/auth-provider";
import { historyService } from "@/services/history.service";
import type { Ride, Booking, RideRequest } from "@/types";

export default function HistoryPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"primary" | "secondary">("primary");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // States to hold history
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);

  const isPassenger = user?.role === "passenger";

  const loadHistory = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to view history.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await historyService.getHistory(token);
      
      if (isPassenger) {
        setBookings(data.bookings || []);
        setRequests(data.requests || []);
      } else {
        setRides(data.rides || []);
        setRequests(data.requests || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isPassenger]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const formatDeparture = (isoString: string | Date) => {
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
    scheduled: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Ride History</h1>
        <p className="mt-1 text-neutral-500">
          View all your completed or past commute activity
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("primary")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "primary"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {isPassenger ? "Booked Rides" : "Offered Rides"}
        </button>
        <button
          onClick={() => setActiveTab("secondary")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "secondary"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {isPassenger ? "My Requests" : "Served Requests"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : (
        <>
          {/* Active Tab rendering */}
          {activeTab === "primary" ? (
            isPassenger ? (
              // PASSENGER BOOKED RIDES HISTORY
              bookings.length === 0 ? (
                <Card className="border-dashed border-neutral-300">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-lg font-medium text-neutral-900">No past bookings found</p>
                    <p className="mt-2 max-w-sm text-sm text-neutral-500">
                      Your past bookings will appear here once the scheduled trip departure time passes.
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
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`capitalize ${STATUS_BADGES[booking.status]}`}>
                              {booking.status}
                            </Badge>
                            <span className="text-lg font-bold text-neutral-950">
                              Rs. {booking.totalPrice}
                            </span>
                          </div>

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
                            <span className="text-[10px] text-neutral-400 font-medium">Trip Completed</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            ) : (
              // DRIVER/ADMIN OFFERED RIDES HISTORY
              rides.length === 0 ? (
                <Card className="border-dashed border-neutral-300">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-lg font-medium text-neutral-900">No past offered rides found</p>
                    <p className="mt-2 max-w-sm text-sm text-neutral-500">
                      Rides you have offered in the past will show up here after the trip departure time.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {rides.map((ride) => {
                    const sched = formatDeparture(ride.departureTime);
                    return (
                      <Card key={ride.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`capitalize ${STATUS_BADGES[ride.status === "scheduled" ? "completed" : ride.status]}`}>
                              {ride.status === "scheduled" ? "completed" : ride.status}
                            </Badge>
                            <span className="text-lg font-bold text-neutral-950">
                              Rs. {ride.pricePerSeat} <span className="text-[10px] font-normal text-neutral-500">/ seat</span>
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                              <div>
                                <p className="text-xs text-neutral-400">From</p>
                                <p className="text-sm font-semibold text-neutral-900">{ride.origin.address}</p>
                                <p className="text-xs text-neutral-500">{ride.origin.city}</p>
                              </div>
                            </div>
                            <div className="h-3 border-l border-dashed border-neutral-300 ml-2"></div>
                            <div className="flex items-start gap-2">
                              <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                              <div>
                                <p className="text-xs text-neutral-400">To</p>
                                <p className="text-sm font-semibold text-neutral-900">{ride.destination.address}</p>
                                <p className="text-xs text-neutral-500">{ride.destination.city}</p>
                              </div>
                            </div>
                          </div>

                          <hr className="border-neutral-100" />

                          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate">{sched.date} at {sched.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="size-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate">Vehicle: {ride.vehicleDetails.make}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <Users className="size-3.5 text-neutral-400" />
                              Capacity: <strong className="text-neutral-900">{ride.availableSeats} seats</strong>
                            </span>
                            <span className="text-[10px] text-neutral-400 font-medium">Trip Completed</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )
            )
          ) : (
            // SECONDARY TAB: PASSENGER REQUESTS OR DRIVER SERVED REQUESTS
            requests.length === 0 ? (
              <Card className="border-dashed border-neutral-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-medium text-neutral-900">No past requests found</p>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    {isPassenger
                      ? "Custom ride requests you posted in the past will show up here after the trip departure time passes."
                      : "Passenger ride requests you served in the past will show up here after the trip time passes."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => {
                  const sched = formatDeparture(request.departureTime);
                  return (
                    <Card key={request.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`capitalize ${STATUS_BADGES[request.status]}`}>
                            {request.status}
                          </Badge>
                          <span className="text-lg font-bold text-neutral-950">
                            Rs. {request.proposedPrice}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">From</p>
                              <p className="text-sm font-semibold text-neutral-900">{request.origin.address}</p>
                              <p className="text-xs text-neutral-500">{request.origin.city}</p>
                            </div>
                          </div>
                          <div className="h-3 border-l border-dashed border-neutral-300 ml-2"></div>
                          <div className="flex items-start gap-2">
                            <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">To</p>
                              <p className="text-sm font-semibold text-neutral-900">{request.destination.address}</p>
                              <p className="text-xs text-neutral-500">{request.destination.city}</p>
                            </div>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{sched.date} at {sched.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="size-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">
                              {isPassenger ? "Self" : `Passenger: ${request.passengerName}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Users className="size-3.5 text-neutral-400" />
                            Seats needed: <strong className="text-neutral-900">{request.seatsNeeded}</strong>
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">Expired/Trip Time Passed</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
