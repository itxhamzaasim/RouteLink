"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { rideService } from "@/services/ride.service";
import { bookingService } from "@/services/booking.service";
import { notificationService } from "@/services/notification.service";
import { LahoreMap, LAHORE_NODES, type MapNode } from "@/components/dashboard/lahore-map";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Check, X, Bell, User, Clock, Loader2, ArrowRight, 
  MapPin, ShieldAlert, Calendar, DollarSign, Car, Star, CheckCircle2 
} from "lucide-react";
import type { Booking, Ride, Notification } from "@/types";

export default function DashboardPage() {
  const { user, updateUser, logout } = useAuthContext();
  const router = useRouter();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [driverRides, setDriverRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Passenger selection states
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // Rider creation states
  const [startNode, setStartNode] = useState<MapNode | null>(null);
  const [destNode, setDestNode] = useState<MapNode | null>(null);
  const [departureTime, setDepartureTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState("4");
  const [pricePerSeat, setPricePerSeat] = useState("500");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("Standard");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [rideSuccess, setRideSuccess] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Populate vehicle details from user profile
  useEffect(() => {
    if (user) {
      setVehicleMake(user.vehicleType || "");
      setVehiclePlate(user.vehicleRegistration || "");
    }
  }, [user]);

  // Load dashboard data based on role
  const loadDashboardData = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      
      if (user.role === "driver" && user.isDriverApproved) {
        // Driver specific data
        const [dBookings, dRides] = await Promise.all([
          bookingService.getDriverBookings(token),
          rideService.getDriverRides(token)
        ]);
        setRequests(dBookings);
        setDriverRides(dRides);
      } else if (user.role === "passenger") {
        // Passenger specific data
        const [ridesResponse, pBookings] = await Promise.all([
          rideService.searchRides({}, token),
          bookingService.getPassengerBookings(token)
        ]);
        setActiveRides(ridesResponse.rides);
        setRequests(pBookings);
      }

      // Load activity notifications
      const notifs = await notificationService.getNotifications(token);
      setNotifications(notifs);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync dashboard data.");
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle passenger booking request
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRide) return;

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsBooking(true);
    setBookingSuccess("");
    setError("");

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.createBooking(selectedRide.id, seatsToBook, token);
      setBookingSuccess("Your booking request has been submitted successfully!");
      setSelectedRide(null);
      // Reload lists
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to book seat.");
    } finally {
      setIsBooking(false);
    }
  };

  // Handle rider posting new ride
  const handlePostRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startNode || !destNode) {
      setError("Please select both a Start point and a Destination on the Lahore map.");
      return;
    }

    if (!departureTime) {
      setError("Please pick a departure time.");
      return;
    }

    if (!vehicleMake || !vehiclePlate) {
      setError("Please provide your vehicle details.");
      return;
    }

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsPosting(true);
    setRideSuccess("");
    setError("");

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const payload = {
        origin: {
          address: startNode.name,
          city: startNode.name
        },
        destination: {
          address: destNode.name,
          city: destNode.name
        },
        departureTime: departureTime,
        availableSeats: Number(availableSeats),
        pricePerSeat: Number(pricePerSeat),
        vehicleDetails: {
          make: vehicleMake,
          model: vehicleModel,
          licensePlate: vehiclePlate
        }
      };

      await rideService.createRide(payload, token);
      setRideSuccess("Ride posted successfully!");
      setStartNode(null);
      setDestNode(null);
      setDepartureTime("");
      await loadDashboardData();
    } catch (err: any) {
      setError(err.message || "Failed to post ride.");
    } finally {
      setIsPosting(false);
    }
  };

  // Accept booking
  const handleAccept = async (id: string) => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.acceptBooking(id, token);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
      );
    } catch (err: any) {
      alert(err.message || "Failed to accept booking.");
    }
  };

  // Reject booking
  const handleReject = async (id: string) => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await bookingService.rejectBooking(id, token);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
    } catch (err: any) {
      alert(err.message || "Failed to decline booking.");
    }
  };

  // Switch role to passenger immediately (for pending riders)
  const handleSwitchToPassenger = async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    setIsSwitching(true);
    try {
      const token = JSON.parse(rawAuth).accessToken;
      const updatedUser = await authService.switchRole("passenger", token);
      updateUser(updatedUser);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to switch role.");
    } finally {
      setIsSwitching(false);
    }
  };

  // Select start/destination nodes on the map
  const handleSelectNode = (type: "start" | "dest", node: MapNode | null) => {
    if (type === "start") {
      setStartNode(node);
    } else {
      setDestNode(node);
    }
    setError("");
  };

  // Mark notification read
  const handleMarkRead = async (id: string) => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await notificationService.markAsRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Unverified Driver screen blocking
  if (user?.role === "driver" && !user?.isDriverApproved) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50/50 p-8 shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-4">
            <Clock className="size-7 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-amber-900">Your account is under review.</h2>
          <p className="mt-2 text-sm text-amber-700 leading-relaxed">
            Please wait for admin verification. The RouteLink admin team is verifying your registration details and vehicle photos. Once approved, you will gain full driver access.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              onClick={handleSwitchToPassenger}
              disabled={isSwitching}
              className="w-full bg-brand-600 text-white hover:bg-brand-700 h-11 text-sm font-semibold rounded-xl"
            >
              {isSwitching ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Switching Mode...
                </>
              ) : (
                "Switch to Passenger Mode"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="w-full border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 h-11 text-sm font-semibold rounded-xl"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const STATUS_COLORS = {
    pending: "text-amber-700 bg-amber-50 border-amber-200",
    accepted: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rejected: "text-red-700 bg-red-50 border-red-200",
    cancelled: "text-neutral-600 bg-neutral-100 border-neutral-200",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
            {user?.role === "driver" ? "Rider Workspace" : "Commute Workspace"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Welcome back, <span className="font-semibold text-neutral-800">{user?.firstName}</span>! Switch roles or post new routes at any time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-brand-100 hover:bg-brand-100 text-brand-800 font-semibold px-3 py-1 rounded-full text-xs capitalize border border-brand-200">
            {user?.role} Account
          </Badge>
          {user?.isDriverApproved && (
            <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full text-xs border border-emerald-200">
              Verified Driver
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Redesigned Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Map & Main Column */}
        <div className="xl:col-span-2 space-y-6">
          {user?.role === "driver" ? (
            /* DRIVER VIEW */
            <div className="space-y-6">
              {/* SVG Map Selection instructions */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                <h2 className="text-sm font-bold text-neutral-800 mb-1 flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-500" />
                  Step 1: Select Your Route On The Lahore Map
                </h2>
                <p className="text-xs text-neutral-500 leading-normal">
                  Click any node to set your starting hub, and another node to mark your destination. Click the nodes again to reset.
                </p>
                <div className="mt-3">
                  <LahoreMap 
                    startNodeId={startNode?.id} 
                    destNodeId={destNode?.id} 
                    onSelectNode={handleSelectNode}
                  />
                </div>
              </div>

              {/* Driver Posted Rides list */}
              <Card className="border-neutral-200 shadow-sm">
                <div className="border-b px-5 py-4 flex justify-between items-center bg-white rounded-t-2xl">
                  <h2 className="text-base font-bold text-neutral-900">
                    My Posted Routes
                  </h2>
                  <Badge variant="outline" className="bg-neutral-50 border-neutral-200">
                    {driverRides.length} active
                  </Badge>
                </div>
                <CardContent className="p-0 divide-y divide-neutral-100">
                  {isLoading ? (
                    <div className="flex h-24 items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-neutral-400" />
                    </div>
                  ) : driverRides.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500 text-xs">
                      You haven&apos;t posted any routes yet today. Select nodes above to post.
                    </div>
                  ) : (
                    driverRides.map((ride) => (
                      <div key={ride.id} className="p-4 hover:bg-neutral-50/50 transition-colors text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                            <span>{ride.origin.city}</span>
                            <ArrowRight className="size-3 text-neutral-400" />
                            <span>{ride.destination.city}</span>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {ride.availableSeats} seats left
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-neutral-800">
                            Rs. {ride.pricePerSeat} / Seat
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="size-3" />
                            {ride.vehicleDetails.make} ({ride.vehicleDetails.licensePlate})
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* PASSENGER VIEW */
            <div className="space-y-6">
              {/* Interactive map for passenger */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
                <h2 className="text-sm font-bold text-neutral-800 mb-1 flex items-center gap-2">
                  <MapPin className="size-4 text-brand-500" />
                  Interactive Commute Feed
                </h2>
                <p className="text-xs text-neutral-500 leading-normal">
                  Click on any glowing route vector line on the map to inspect driver schedules and make booking requests.
                </p>
                <div className="mt-3">
                  <LahoreMap 
                    activeRoutes={activeRides.map((ride) => ({
                      id: ride.id,
                      originCity: ride.origin.city,
                      destinationCity: ride.destination.city,
                      driverName: ride.driverName,
                      onSelect: () => setSelectedRide(ride)
                    }))}
                    interactive={false}
                  />
                </div>
              </div>

              {/* Ride Booking Detail Modal Overlay / Sidebar detail Card */}
              {selectedRide && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50/20 p-5 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Selected Route Booking</span>
                      <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2 mt-0.5">
                        {selectedRide.origin.city} <ArrowRight className="size-4 text-brand-500" /> {selectedRide.destination.city}
                      </h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedRide(null)}
                      className="size-7 p-0 rounded-full hover:bg-neutral-200 text-neutral-500"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 text-xs bg-white p-4 rounded-xl border border-neutral-200">
                    <div className="space-y-1">
                      <div className="text-neutral-400">Driver</div>
                      <div className="font-semibold text-neutral-800 flex items-center gap-1">
                        <User className="size-3.5 text-neutral-600" />
                        {selectedRide.driverName}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-neutral-400">Price</div>
                      <div className="font-extrabold text-emerald-600">Rs. {selectedRide.pricePerSeat} / Seat</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-neutral-400">Departure Time</div>
                      <div className="font-semibold text-neutral-800 flex items-center gap-1">
                        <Clock className="size-3.5 text-neutral-600" />
                        {new Date(selectedRide.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreateBooking} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="seatsToBook" className="text-xs font-semibold text-neutral-700">How many seats do you need?</Label>
                      <Input
                        id="seatsToBook"
                        type="number"
                        min="1"
                        max={selectedRide.availableSeats}
                        value={seatsToBook}
                        onChange={(e) => setSeatsToBook(Math.max(1, Number(e.target.value)))}
                        className="h-10 bg-white"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isBooking}
                      className="h-10 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                    >
                      {isBooking ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-1.5" />
                          Submitting...
                        </>
                      ) : (
                        "Request Booking"
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {bookingSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>{bookingSuccess}</span>
                </div>
              )}

              {/* Passenger Rides Available List */}
              <Card className="border-neutral-200 shadow-sm">
                <div className="border-b px-5 py-4 flex justify-between items-center bg-white rounded-t-2xl">
                  <h2 className="text-base font-bold text-neutral-900">
                    Available Rides in Lahore
                  </h2>
                  <Badge variant="outline" className="bg-brand-50 border-brand-200 text-brand-700">
                    {activeRides.length} commutes
                  </Badge>
                </div>
                <CardContent className="p-0 divide-y divide-neutral-100">
                  {isLoading ? (
                    <div className="flex h-24 items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-neutral-400" />
                    </div>
                  ) : activeRides.length === 0 ? (
                    <div className="py-8 text-center text-neutral-500 text-xs">
                      No active rides posted. Check back later or verify your search details.
                    </div>
                  ) : (
                    activeRides.map((ride) => (
                      <div key={ride.id} className="flex justify-between items-center p-4 hover:bg-neutral-50/50 transition-colors text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                            <span>{ride.origin.city}</span>
                            <ArrowRight className="size-3 text-neutral-400" />
                            <span>{ride.destination.city}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-neutral-500 text-[11px]">
                            <span>Driver: {ride.driverName}</span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-0.5 text-amber-500">
                              <Star className="size-3 fill-amber-500 text-amber-500" />
                              {ride.driverRating.toFixed(1)}
                            </span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-1 text-neutral-700 font-medium">
                              Rs. {ride.pricePerSeat} / Seat
                            </span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setSelectedRide(ride)}
                          size="sm"
                          variant="outline" 
                          className="h-8 text-xs font-semibold rounded-lg hover:bg-neutral-100"
                        >
                          Book Now
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar Controls & Forms */}
        <div className="space-y-6">
          {/* RIDER FORM: Post Route Form */}
          {user?.role === "driver" && (
            <Card className="border-neutral-200 shadow-sm">
              <div className="border-b px-5 py-4 bg-white rounded-t-2xl">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Plus className="size-4 text-brand-600" />
                  Post a Daily Route
                </h2>
              </div>
              <CardContent className="p-5">
                {rideSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 flex items-center gap-1.5 mb-4">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>{rideSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePostRide} className="space-y-4">
                  {/* Selected Nodes readout */}
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 font-medium">Start Node:</span>
                      <span className={startNode ? "text-emerald-600 font-bold" : "text-neutral-400 italic"}>
                        {startNode ? startNode.name : "Click map node"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-neutral-100 pt-2">
                      <span className="text-neutral-400 font-medium">Destination:</span>
                      <span className={destNode ? "text-red-600 font-bold" : "text-neutral-400 italic"}>
                        {destNode ? destNode.name : "Click map node"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departureTime" className="text-xs font-semibold text-neutral-700">Departure Date & Time</Label>
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="h-10 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="availableSeats" className="text-xs font-semibold text-neutral-700">Seats</Label>
                      <Input
                        id="availableSeats"
                        type="number"
                        min="1"
                        max="8"
                        value={availableSeats}
                        onChange={(e) => setAvailableSeats(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerSeat" className="text-xs font-semibold text-neutral-700">Price (Rs.)</Label>
                      <Input
                        id="pricePerSeat"
                        type="number"
                        min="0"
                        value={pricePerSeat}
                        onChange={(e) => setPricePerSeat(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <div className="text-xs font-bold text-neutral-800">Confirm Vehicle Details</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="vehicleMake" className="text-[10px] text-neutral-500">Vehicle Make</Label>
                        <Input
                          id="vehicleMake"
                          placeholder="e.g. Civic"
                          value={vehicleMake}
                          onChange={(e) => setVehicleMake(e.target.value)}
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehiclePlate" className="text-[10px] text-neutral-500">Registration Plate</Label>
                        <Input
                          id="vehiclePlate"
                          placeholder="e.g. LEB-4932"
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value)}
                          className="h-9 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isPosting} 
                    className="w-full h-11 bg-brand-600 text-white hover:bg-brand-700 rounded-xl font-bold text-xs"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                        Posting Route...
                      </>
                    ) : (
                      "Post Route"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ACTIVE BOOKINGS / REQUESTS CARD */}
          <Card className="border-neutral-200 shadow-sm">
            <div className="border-b px-5 py-4 flex justify-between items-center bg-white rounded-t-2xl">
              <h2 className="text-sm font-bold text-neutral-900">
                {user?.role === "driver" ? "Incoming Ride Requests" : "My Commute Bookings"}
              </h2>
            </div>
            <CardContent className="p-0 divide-y divide-neutral-100">
              {isLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-neutral-400" />
                </div>
              ) : requests.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 text-xs">
                  {user?.role === "driver" ? "No incoming passenger bookings." : "You haven't requested any rides yet."}
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-4 hover:bg-neutral-50/50 transition-colors space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-neutral-900 capitalize">
                          {user?.role === "driver" ? req.passengerName : req.rideDetails.driverName}
                        </div>
                        <div className="text-neutral-500 text-[10px] mt-0.5">
                          Route: {req.rideDetails.origin.city} &rarr; {req.rideDetails.destination.city}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-semibold ${STATUS_COLORS[req.status]}`}>
                        {req.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-neutral-400">
                      <div>
                        {req.seatsBooked} seat(s) &middot; Rs. {req.totalPrice}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(req.rideDetails.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {user?.role === "driver" && req.status === "pending" && (
                      <div className="flex gap-2 pt-1.5">
                        <Button
                          onClick={() => handleAccept(req.id)}
                          size="sm"
                          className="h-8 flex-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1"
                        >
                          <Check className="size-3" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleReject(req.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border border-neutral-100 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1"
                        >
                          <X className="size-3" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity Log / Feed */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-neutral-900 pb-2 border-b">
              <Bell className="size-4 text-brand-600" />
              <h2 className="text-sm font-bold">Activity Feed</h2>
            </div>
            {isLoading ? (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="size-4 animate-spin text-neutral-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center text-neutral-400 text-xs">
                No new updates or alerts.
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer relative ${
                      notif.isRead
                        ? "bg-neutral-50/50 border-neutral-100 text-neutral-600"
                        : "bg-brand-50/30 border-brand-100 text-neutral-900 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-[11px]">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="size-1.5 shrink-0 rounded-full bg-brand-600 mt-1" />
                      )}
                    </div>
                    <p className="text-neutral-500 leading-normal mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
