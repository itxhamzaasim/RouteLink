"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Car,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookingFormModal } from "@/components/dashboard/booking-form-modal";
import { rideService } from "@/services/ride.service";
import type { Ride } from "@/types";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search parameters in state (for form bindings)
  const [inputs, setInputs] = useState({
    originCity: searchParams.get("originCity") || "",
    destinationCity: searchParams.get("destinationCity") || "",
    date: searchParams.get("date") || "",
    seats: Number(searchParams.get("seats") || 1),
  });

  // Queries, filters, and list states
  const [rides, setRides] = useState<Ride[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    pages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Booking Modal States
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingRide, setBookingRide] = useState<Ride | null>(null);

  // Synchronize URL parameters with inputs on URL change
  useEffect(() => {
    setInputs({
      originCity: searchParams.get("originCity") || "",
      destinationCity: searchParams.get("destinationCity") || "",
      date: searchParams.get("date") || "",
      seats: Number(searchParams.get("seats") || 1),
    });
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const rawAuth = localStorage.getItem("routelink-auth");
      if (!rawAuth) {
        setIsAuthenticated(false);
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  const loadSearchResults = useCallback(async () => {
    if (isAuthenticated === null || !isAuthenticated) return;
    setIsLoading(true);
    setError("");

    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    let token = "";
    try {
      token = JSON.parse(rawAuth).accessToken;
    } catch {
      return;
    }

    try {
      const queryParams = {
        originCity: searchParams.get("originCity") || undefined,
        destinationCity: searchParams.get("destinationCity") || undefined,
        date: searchParams.get("date") || undefined,
        seats: Number(searchParams.get("seats") || 1),
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 6,
      };

      const data = await rideService.searchRides(queryParams, token);
      setRides(data.rides);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching rides.");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, sortBy, sortOrder, currentPage, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSearchResults();
    }
  }, [loadSearchResults, isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (inputs.originCity) query.append("originCity", inputs.originCity);
    if (inputs.destinationCity) query.append("destinationCity", inputs.destinationCity);
    if (inputs.date) query.append("date", inputs.date);
    if (inputs.seats) query.append("seats", String(inputs.seats));

    setCurrentPage(1); // Reset to page 1 on new query
    router.push(`/rides?${query.toString()}`);
  };

  const handleSort = (field: "date" | "price") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const formatDeparture = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const handleRequestBooking = (ride: Ride) => {
    setBookingRide(ride);
    setBookingOpen(true);
  };

  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Refine Search Widget */}
      <form
        onSubmit={handleSearchSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end"
      >
        <div className="space-y-1">
          <Label htmlFor="originCity" className="text-neutral-500">From (City)</Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-600" />
            <Input
              id="originCity"
              placeholder="e.g. DHA Lahore or Gulberg"
              value={inputs.originCity}
              onChange={(e) => setInputs((p) => ({ ...p, originCity: e.target.value }))}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="destinationCity" className="text-neutral-500">To (City)</Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="destinationCity"
              placeholder="e.g. Johar Town or Model Town"
              value={inputs.destinationCity}
              onChange={(e) => setInputs((p) => ({ ...p, destinationCity: e.target.value }))}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50"
            />
          </div>
        </div>


        <div className="space-y-1">
          <Label htmlFor="date" className="text-neutral-500">Date</Label>
          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="date"
              type="date"
              value={inputs.date}
              onChange={(e) => setInputs((p) => ({ ...p, date: e.target.value }))}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50 text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="seats" className="text-neutral-500">Seats Needed</Label>
          <div className="relative">
            <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="seats"
              type="number"
              min={1}
              max={8}
              value={inputs.seats}
              onChange={(e) => setInputs((p) => ({ ...p, seats: parseInt(e.target.value, 10) || 1 }))}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50"
            />
          </div>
        </div>

        <Button type="submit" className="h-10 bg-neutral-900 hover:bg-neutral-800 text-white w-full">
          <Search className="size-4" />
          Update Search
        </Button>
      </form>

      {/* Sorting & Heading Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Available Rides</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Found {pagination.total} matching ride{pagination.total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Sort by:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("date")}
            className={`h-8 border px-3 text-xs flex gap-1 ${
              sortBy === "date" ? "bg-brand-50 border-brand-200 text-brand-700" : "border-neutral-200 text-neutral-600"
            }`}
          >
            Departure Time
            {sortBy === "date" && <ArrowUpDown className="size-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort("price")}
            className={`h-8 border px-3 text-xs flex gap-1 ${
              sortBy === "price" ? "bg-brand-50 border-brand-200 text-brand-700" : "border-neutral-200 text-neutral-600"
            }`}
          >
            Price per Seat
            {sortBy === "price" && <ArrowUpDown className="size-3" />}
          </Button>
        </div>
      </div>

      {/* Loading & Lists */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-10 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 text-center py-10">
          <CardContent className="text-red-700">{error}</CardContent>
        </Card>
      ) : rides.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <p className="text-lg font-medium text-neutral-900">No matching rides found</p>
            <p className="max-w-md text-sm text-neutral-500">
              Try adjusting your starting/ending cities, searching for a different date, or reducing seats request.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rides.map((ride) => {
              const schedule = formatDeparture(ride.departureTime);
              return (
                <Card key={ride.id} className="border-neutral-200 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Driver details & Cost */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-neutral-900 truncate max-w-[140px]">{ride.driverName}</p>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <Star className="size-3.5 fill-amber-500" />
                          <span>{ride.driverRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-neutral-950">Rs. {ride.pricePerSeat}</span>
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
                        <span className="truncate">{schedule.date} at {schedule.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="size-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{ride.vehicleDetails.make} {ride.vehicleDetails.model}</span>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-neutral-500">
                        Seats available: <strong className="text-neutral-900">{ride.availableSeats}</strong>
                      </span>
                      <Button
                        size="sm"
                        className="bg-brand-600 hover:bg-brand-700 text-white text-xs h-9 px-4"
                        onClick={() => handleRequestBooking(ride)}
                      >
                        Request Ride
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 border-t pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <span className="text-xs text-neutral-500 font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.pages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          )}
        </div>
      )}

      <BookingFormModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        ride={bookingRide}
        onSuccess={() => {
          loadSearchResults();
          alert("Your booking request has been submitted successfully to the driver! Track it under Bookings.");
        }}
      />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-10 animate-spin text-neutral-400" />
          </div>
        }>
          <SearchResultsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
