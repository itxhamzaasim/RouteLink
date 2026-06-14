"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MapPin,
  Calendar,
  Car,
  Trash2,
  Edit2,
  Loader2,
  Star,
  MessageSquare,
  Users,
  Check,
  X,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RideFormModal } from "@/components/dashboard/ride-form-modal";
import { BookingFormModal } from "@/components/dashboard/booking-form-modal";
import { RideRequestModal } from "@/components/dashboard/ride-request-modal";
import { useAuthContext } from "@/components/providers/auth-provider";
import { rideService } from "@/services/ride.service";
import { bookingService } from "@/services/booking.service";
import type { Ride, RideRequest, Booking } from "@/types";

export default function RidesPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<string>("");
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);

  // Booking Modal States for passenger account
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRide, setBookingRide] = useState<Ride | null>(null);

  // Ride Request Modal States
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RideRequest | null>(null);

  // Initialize role-specific tabs
  useEffect(() => {
    if (user) {
      setActiveTab(user.role === "passenger" ? "bookings" : "offers");
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    if (typeof window === "undefined" || !user || !activeTab) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to manage your rides.");
      setIsLoading(false);
      return;
    }

    const token = JSON.parse(rawAuth).accessToken;
    setIsLoading(true);
    setError("");

    try {
      if (user.role === "passenger") {
        if (activeTab === "bookings") {
          const data = await bookingService.getPassengerBookings(token);
          setBookings(data);
        } else if (activeTab === "requests") {
          const data = await rideService.getRideRequests(token);
          // Show only passenger's own requests
          setRequests(data.filter((r) => r.passengerId === user.id));
        }
      } else {
        if (activeTab === "offers") {
          const data = await rideService.getDriverRides(token);
          setRides(data);
        } else if (activeTab === "accepted-requests") {
          const data = await rideService.getRideRequests(token, true);
          setRequests(data);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

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
      alert("Ride deleted successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to delete ride.");
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this ride request?")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await rideService.deleteRideRequest(id, token);
      alert("Ride request cancelled successfully.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel ride request.");
    }
  };

  const handleAcceptGeneralRequest = async (id: string) => {
    if (!confirm("Are you sure you want to accept this passenger's ride request? You will be assigned as their driver.")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await rideService.acceptRideRequest(id, token);
      alert("Successfully accepted passenger ride request! You are now their driver.");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to accept ride request.");
    }
  };

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
      setIncomingBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "accepted" as const } : b))
      );
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

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.cancelBooking(id, token);
      alert("Booking cancelled successfully.");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking.");
    }
  };

  const handleContactPassenger = (booking: Booking) => {
    const autoMsg = "Hi, I have accepted your commute booking!";
    router.push(
      `/dashboard/messages?userId=${booking.passengerId}&name=${encodeURIComponent(
        booking.passengerName
      )}&role=passenger&autoMessage=${encodeURIComponent(autoMsg)}`
    );
  };

  const handleContactPassengerForRequest = (request: RideRequest) => {
    const autoMsg = "Hi, I have accepted your ride request!";
    router.push(
      `/dashboard/messages?userId=${request.passengerId}&name=${encodeURIComponent(
        request.passengerName
      )}&role=passenger&autoMessage=${encodeURIComponent(autoMsg)}`
    );
  };

  const handleContactDriverForRequest = (request: RideRequest) => {
    if (!request.driverId) return;
    const autoMsg = "Hi, I would like to coordinate for our accepted ride request!";
    router.push(
      `/dashboard/messages?userId=${request.driverId}&name=${encodeURIComponent(
        "Driver Partner"
      )}&role=driver&autoMessage=${encodeURIComponent(autoMsg)}`
    );
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const RIDE_STATUS_BADGES = {
    scheduled: "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-50",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    completed: "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100",
    cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  } as const;

  const BOOKING_STATUS_BADGES = {
    pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
    accepted: "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-50",
    rejected: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    cancelled: "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100",
  } as const;

  const isPassenger = user?.role === "passenger";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isPassenger ? "My Commute Bookings" : "Rides"}
          </h1>
          <p className="mt-1 text-neutral-500 text-sm">
            {isPassenger
              ? "Track your commute bookings and general route requests"
              : "Offer routes, manage commute requests, and find passengers"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPassenger ? (
            <Button
              onClick={() => {
                setEditingRequest(null);
                setRequestModalOpen(true);
              }}
              className="bg-brand-600 text-white hover:bg-brand-700 h-10 cursor-pointer animate-in fade-in"
            >
              <Plus className="size-4 mr-1 shrink-0" />
              Request a Route
            </Button>
          ) : (
            activeTab === "offers" && (
              <Button
                onClick={handleCreate}
                className="bg-brand-600 text-white hover:bg-brand-700 h-10 animate-in fade-in"
              >
                <Plus className="size-4 mr-1 shrink-0" />
                New Ride
              </Button>
            )
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-neutral-200">
        {isPassenger ? (
          <>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "bookings"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Commute Bookings
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "requests"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              My Route Requests
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "offers"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              My Offers
            </button>
            <button
              onClick={() => setActiveTab("accepted-requests")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "accepted-requests"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Accepted Requests
            </button>
          </>
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
      ) : (
        <>
          {/* RIDES LIST (for drivers) */}
          {activeTab === "offers" && !isPassenger && (
            rides.length === 0 ? (
              <Card className="border-dashed border-neutral-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-medium text-neutral-900">No rides offered yet</p>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    Start earning by offering rides on routes you already travel.
                  </p>
                  <Button onClick={handleCreate} className="mt-6 bg-neutral-950 text-white hover:bg-neutral-800">
                    Offer your first ride
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rides.map((ride) => {
                  const sched = formatDateTime(ride.departureTime);
                  return (
                    <Card key={ride.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`capitalize ${RIDE_STATUS_BADGES[ride.status] || ""}`}>
                            {ride.status.replace("_", " ")}
                          </Badge>
                          <span className="text-lg font-bold text-neutral-900">
                            Rs. {ride.pricePerSeat} <span className="text-xs font-normal text-neutral-500">/ seat</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">From</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{ride.origin.address}</p>
                            </div>
                          </div>
                          <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">To</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{ride.destination.address}</p>
                            </div>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                            <span>{sched.date} at {sched.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Car className="size-3.5 text-neutral-400 shrink-0" />
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
            )
          )}

          {/* COMMUTE BOOKINGS LIST (for passengers) */}
          {activeTab === "bookings" && isPassenger && (
            bookings.length === 0 ? (
              <Card className="border-dashed border-neutral-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-medium text-neutral-900">No commute bookings yet</p>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    Search for driver offers and request commute bookings to see them here.
                  </p>
                  <Button onClick={() => router.push("/dashboard/search")} className="mt-6 bg-brand-600 text-white hover:bg-brand-700">
                    Search Rides
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bookings.map((booking) => {
                  const sched = formatDateTime(booking.rideDetails.departureTime);
                  return (
                    <Card key={booking.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`capitalize ${BOOKING_STATUS_BADGES[booking.status] || ""}`}>
                            {booking.status}
                          </Badge>
                          <span className="text-lg font-bold text-neutral-900">
                            Rs. {booking.totalPrice}
                          </span>
                        </div>

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

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{sched.date} at {sched.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="truncate text-neutral-600">Driver: {booking.rideDetails.driverName}</span>
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 px-2 flex gap-1 items-center cursor-pointer"
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
            )
          )}

          {/* ACCEPTED PASSENGER REQUESTS (for drivers) */}
          {activeTab === "accepted-requests" && !isPassenger && (
            requests.length === 0 ? (
              <Card className="border-dashed border-neutral-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-medium text-neutral-900">No accepted passenger requests yet</p>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    Browse pending requests in Requested Rides and offer them a ride. They will show up here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => {
                  const sched = formatDateTime(request.departureTime);
                  return (
                    <Card key={request.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-neutral-900 truncate max-w-[150px]">
                              {request.passengerName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                              <Star className="size-3.5 fill-amber-500" />
                              <span>{request.passengerRating?.toFixed(1) || "5.0"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-neutral-900">Rs. {request.proposedPrice}</span>
                            <span className="text-[10px] text-neutral-400 block">proposed fare</span>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">From</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{request.origin.address}</p>
                            </div>
                          </div>
                          <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">To</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{request.destination.address}</p>
                            </div>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                            <span>Departure: <strong>{sched.date} at {sched.time}</strong></span>
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center">
                            Seats Needed: <strong className="text-neutral-900 ml-1">{request.seatsNeeded}</strong>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className="bg-brand-50 text-brand-700 border-brand-200 capitalize"
                            >
                              {request.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleContactPassengerForRequest(request)}
                            className="bg-neutral-950 hover:bg-neutral-800 text-white w-full text-xs h-9 cursor-pointer flex gap-2 items-center justify-center"
                          >
                            <MessageSquare className="size-4" />
                            Contact Passenger
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          )}

          {/* GENERAL ROUTE REQUESTS (both passenger and driver) */}
          {activeTab === "requests" && (
            requests.length === 0 ? (
              <Card className="border-dashed border-neutral-300">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-medium text-neutral-900">
                    {isPassenger ? "You haven't requested any routes yet" : "No passenger requests available"}
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-neutral-500">
                    {isPassenger
                      ? "Create route requests to inform drivers of your commute path."
                      : "Check back later for passenger route requests in Lahore."}
                  </p>
                  {isPassenger && (
                    <Button onClick={() => setRequestModalOpen(true)} className="mt-6 bg-brand-600 text-white hover:bg-brand-700">
                      Request a Route
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => {
                  const sched = formatDateTime(request.departureTime);
                  return (
                    <Card key={request.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-neutral-900 truncate max-w-[150px]">
                              {request.passengerName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                              <Star className="size-3.5 fill-amber-500" />
                              <span>{request.passengerRating?.toFixed(1) || "5.0"}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-neutral-900">Rs. {request.proposedPrice}</span>
                            <span className="text-[10px] text-neutral-400 block">proposed fare</span>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-brand-600 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">From</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{request.origin.address}</p>
                            </div>
                          </div>
                          <div className="h-4 border-l border-dashed border-neutral-300 ml-2"></div>
                          <div className="flex items-start gap-2.5">
                            <MapPin className="size-4 mt-0.5 text-neutral-400 shrink-0" />
                            <div>
                              <p className="text-xs text-neutral-400">To</p>
                              <p className="text-sm font-semibold text-neutral-950 truncate max-w-[200px]">{request.destination.address}</p>
                            </div>
                          </div>
                        </div>

                        <hr className="border-neutral-100" />

                        <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-1.5 col-span-2">
                            <Calendar className="size-3.5 text-neutral-400 shrink-0" />
                            <span>Departure: <strong>{sched.date} at {sched.time}</strong></span>
                          </div>
                          <div className="text-xs text-neutral-500 flex items-center">
                            Seats Needed: <strong className="text-neutral-900 ml-1">{request.seatsNeeded}</strong>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                request.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : request.status === "accepted"
                                  ? "bg-brand-50 text-brand-700 border-brand-200"
                                  : "bg-neutral-100 text-neutral-600 border-neutral-200"
                              }`}
                            >
                              {request.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Accept or Cancel Action */}
                        <div className="pt-2">
                          {isPassenger ? (
                            <>
                              {request.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelRequest(request.id)}
                                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-xs h-9 cursor-pointer"
                                >
                                  Cancel Request
                                </Button>
                              )}
                              {request.status === "accepted" && request.driverId && (
                                <Button
                                  size="sm"
                                  onClick={() => handleContactDriverForRequest(request)}
                                  className="bg-neutral-950 hover:bg-neutral-800 text-white w-full text-xs h-9 cursor-pointer flex gap-2 items-center justify-center"
                                >
                                  <MessageSquare className="size-4" />
                                  Contact Driver
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              {request.status === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptGeneralRequest(request.id)}
                                  className="bg-brand-600 hover:bg-brand-700 text-white w-full text-xs h-9 cursor-pointer"
                                >
                                  Accept Request
                                </Button>
                              )}
                              {request.status === "accepted" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleContactPassengerForRequest(request)}
                                  className="bg-neutral-950 hover:bg-neutral-800 text-white w-full text-xs h-9 cursor-pointer flex gap-2 items-center justify-center"
                                >
                                  <MessageSquare className="size-4" />
                                  Contact Passenger
                                </Button>
                              )}
                            </>
                          )}
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

      {/* Driver ride form modal */}
      <RideFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ride={editingRide}
        onSuccess={fetchData}
      />

      {/* Passenger booking form modal */}
      <BookingFormModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        ride={bookingRide}
        onSuccess={fetchData}
      />

      {/* RideRequestModal */}
      <RideRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        request={editingRequest}
        onSuccess={fetchData}
      />
    </div>
  );
}
