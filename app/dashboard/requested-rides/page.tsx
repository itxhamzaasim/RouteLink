"use client";

import { useCallback, useEffect, useState } from "react";
import { MapPin, Calendar, Users, Search, Loader2, Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/providers/auth-provider";
import { rideService } from "@/services/ride.service";
import type { RideRequest } from "@/types";

export default function RequestedRidesPage() {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search filter bindings
  const [searchOrigin, setSearchOrigin] = useState("");
  const [searchDest, setSearchDest] = useState("");
  const [filterSeats, setFilterSeats] = useState("");

  const loadRequests = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to view requested rides.");
      setIsLoading(false);
      return;
    }

    const token = JSON.parse(rawAuth).accessToken;
    setIsLoading(true);
    setError("");

    try {
      const data = await rideService.getRideRequests(token);
      setRequests(data);
      setFilteredRequests(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch passenger requests.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Apply local filtering
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let result = [...requests];

    if (searchOrigin.trim()) {
      const q = searchOrigin.toLowerCase();
      result = result.filter(
        (r) =>
          r.origin.address.toLowerCase().includes(q) ||
          r.origin.city.toLowerCase().includes(q)
      );
    }

    if (searchDest.trim()) {
      const q = searchDest.toLowerCase();
      result = result.filter(
        (r) =>
          r.destination.address.toLowerCase().includes(q) ||
          r.destination.city.toLowerCase().includes(q)
      );
    }

    if (filterSeats) {
      const seats = parseInt(filterSeats, 10);
      if (!isNaN(seats)) {
        result = result.filter((r) => r.seatsNeeded >= seats);
      }
    }

    setFilteredRequests(result);
  };

  const handleResetFilters = () => {
    setSearchOrigin("");
    setSearchDest("");
    setFilterSeats("");
    setFilteredRequests(requests);
  };

  const handleAcceptRequest = async (id: string) => {
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
      // Reload lists
      loadRequests();
    } catch (err: any) {
      alert(err.message || "Failed to accept ride request.");
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Requested Rides</h1>
        <p className="mt-1 text-neutral-500 text-sm">
          Search and accept commute requests posted by Lahore passengers
        </p>
      </div>

      {/* Search Filter Form */}
      <form
        onSubmit={handleFilterSubmit}
        className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end"
      >
        <div className="space-y-1">
          <Label htmlFor="searchOrigin" className="text-xs text-neutral-500 font-semibold">From (Address)</Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-600" />
            <Input
              id="searchOrigin"
              placeholder="e.g. LUMS Campus"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="searchDest" className="text-xs text-neutral-500 font-semibold">To (Address)</Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="searchDest"
              placeholder="e.g. DHA Phase 5"
              value={searchDest}
              onChange={(e) => setSearchDest(e.target.value)}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filterSeats" className="text-xs text-neutral-500 font-semibold">Seats Needed (Min)</Label>
          <div className="relative">
            <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="filterSeats"
              type="number"
              min={1}
              max={8}
              placeholder="e.g. 1"
              value={filterSeats}
              onChange={(e) => setFilterSeats(e.target.value)}
              className="h-10 pl-9 border-neutral-200 bg-neutral-50 text-xs"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="h-10 bg-neutral-950 hover:bg-neutral-800 text-white flex-1 text-xs font-semibold cursor-pointer">
            <Search className="size-4 mr-1" />
            Filter
          </Button>
          {(searchOrigin || searchDest || filterSeats) && (
            <Button
              type="button"
              onClick={handleResetFilters}
              variant="outline"
              className="h-10 border-neutral-200 hover:bg-neutral-50 text-xs font-semibold cursor-pointer"
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {/* Request list */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <Loader2 className="size-8 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-neutral-900">No requested commutes found</p>
            <p className="mt-2 max-w-sm text-sm text-neutral-500">
              There are no pending passenger route requests matching your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => {
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

                  {/* Accept Action */}
                  <div className="pt-2">
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-brand-600 hover:bg-brand-700 text-white w-full text-xs h-9 cursor-pointer flex gap-1 items-center justify-center"
                      >
                        <Check className="size-4" />
                        Accept Request
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
