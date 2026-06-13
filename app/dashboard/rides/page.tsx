"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, MapPin, Calendar, Car, Trash2, Edit2, Loader2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RideFormModal } from "@/components/dashboard/ride-form-modal";
import { BookingFormModal } from "@/components/dashboard/booking-form-modal";
import { useAuthContext } from "@/components/providers/auth-provider";
import { rideService } from "@/services/ride.service";
import type { Ride } from "@/types";

export default function RidesPage() {
  const { user } = useAuthContext();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);

  // Booking Modal States for passenger account
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRide, setBookingRide] = useState<Ride | null>(null);

  const fetchRides = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to manage your rides.");
      setIsLoading(false);
      return;
    }

    try {
      const token = JSON.parse(rawAuth).accessToken;
      if (user.role === "passenger") {
        // Fetch all available rides offered by drivers
        const data = await rideService.searchRides({}, token);
        setRides(data.rides);
      } else {
        // Drivers fetch their own rides
        const data = await rideService.getDriverRides(token);
        setRides(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch rides.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  const handleCreate = () => {
    setEditingRide(null);
    setModalOpen(true);
  };

  const handleEdit = (ride: Ride) => {
    setEditingRide(ride);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ride? This action cannot be undone.")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await rideService.deleteRide(id, token);
      setRides((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete ride.");
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const STATUS_BADGES = {
    scheduled: "bg-brand-50 text-brand-700 hover:bg-brand-50 border-brand-200",
    in_progress: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
    completed: "bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-neutral-200",
    cancelled: "bg-red-50 text-red-700 hover:bg-red-50 border-red-200",
  } as const;

  const handleRequestBooking = (ride: Ride) => {
    setBookingRide(ride);
    setBookingOpen(true);
  };

  const isPassenger = user?.role === "passenger";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isPassenger ? "Available Rides" : "My Rides"}
          </h1>
          <p className="mt-1 text-neutral-500">
            {isPassenger
              ? "Find and request rides offered by drivers"
              : "Rides you've offered as a driver"}
          </p>
        </div>
        {!isPassenger && (
          <Button
            onClick={handleCreate}
            className="bg-brand-600 text-white hover:bg-brand-700 h-10"
          >
            <Plus className="size-4 animate-in fade-in" />
            New ride
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : rides.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">
              {isPassenger ? "No rides available right now" : "No rides offered yet"}
            </p>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
              {isPassenger
                ? "Check back later for available driver commute offers in Lahore."
                : "Start earning by offering rides on routes you already travel."}
            </p>
            {!isPassenger && (
              <Button
                onClick={handleCreate}
                className="mt-6 bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Offer your first ride
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => {
            const sched = formatDateTime(ride.departureTime);
            
            if (isPassenger) {
              return (
                <Card key={ride.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                    <div className="space-y-4">
                      {/* Driver Details & Cost */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-neutral-900 truncate max-w-[140px]">{ride.driverName}</p>
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                            <Star className="size-3.5 fill-amber-500" />
                            <span>{ride.driverRating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-neutral-900">Rs. {ride.pricePerSeat}</span>
                          <span className="text-xs text-neutral-500 block">per seat</span>
                        </div>
                      </div>

                      <hr className="border-neutral-100" />

                      {/* Route Details */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                          <div>
                            <p className="text-xs text-neutral-400">From</p>
                            <p className="text-sm font-semibold text-neutral-950 truncate">{ride.origin.address}</p>
                            <p className="text-xs text-neutral-500">{ride.origin.city}</p>
                          </div>
                        </div>
                        <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                        <div className="flex items-start gap-2.5">
                          <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                          <div>
                            <p className="text-xs text-neutral-400">To</p>
                            <p className="text-sm font-semibold text-neutral-950 truncate">{ride.destination.address}</p>
                            <p className="text-xs text-neutral-500">{ride.destination.city}</p>
                          </div>
                        </div>
                      </div>

                      <hr className="border-neutral-100" />

                      {/* Schedule & Car details */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{sched.date} at {sched.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Car className="size-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{ride.vehicleDetails.make} {ride.vehicleDetails.model}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking request action */}
                    <div className="flex items-center justify-between pt-4 mt-auto border-t border-neutral-100">
                      <span className="text-xs text-neutral-500">
                        Seats: <strong className="text-neutral-900">{ride.availableSeats}</strong>
                      </span>
                      <Button
                        size="sm"
                        className="bg-brand-600 hover:bg-brand-700 text-white text-xs h-9 px-4 cursor-pointer"
                        onClick={() => handleRequestBooking(ride)}
                      >
                        Request Ride
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Driver view card
            return (
              <Card key={ride.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <CardContent className="p-5 space-y-4">
                  {/* Status & Price */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`capitalize ${STATUS_BADGES[ride.status]}`}>
                      {ride.status.replace("_", " ")}
                    </Badge>
                    <span className="text-lg font-bold text-neutral-900">
                      Rs. {ride.pricePerSeat} <span className="text-xs font-normal text-neutral-500">/ seat</span>
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">From</p>
                        <p className="text-sm font-semibold text-neutral-950">{ride.origin.address}</p>
                        <p className="text-xs text-neutral-500">{ride.origin.city}</p>
                      </div>
                    </div>
                    <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-400">To</p>
                        <p className="text-sm font-semibold text-neutral-950">{ride.destination.address}</p>
                        <p className="text-xs text-neutral-500">{ride.destination.city}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-neutral-100" />

                  {/* Date & Car Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-neutral-400" />
                      <span>{sched.date} at {sched.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="size-3.5 text-neutral-400" />
                      <span className="truncate">{ride.vehicleDetails.make} {ride.vehicleDetails.model}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-neutral-500">
                      Seats Available: <strong className="text-neutral-900">{ride.availableSeats}</strong>
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEdit(ride)}
                        title="Edit Ride"
                        className="text-neutral-500 hover:text-neutral-950"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(ride.id)}
                        title="Delete Ride"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Driver ride form modal */}
      <RideFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ride={editingRide}
        onSuccess={fetchRides}
      />

      {/* Passenger booking form modal */}
      <BookingFormModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        ride={bookingRide}
        onSuccess={() => {
          fetchRides();
          alert("Your booking request has been submitted successfully to the driver! Track it under Bookings.");
        }}
      />
    </div>
  );
}
