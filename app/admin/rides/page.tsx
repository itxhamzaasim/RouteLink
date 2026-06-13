"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { Loader2, Search, Trash2, Calendar, MapPin, DollarSign, Users } from "lucide-react";
import type { Ride } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const loadRides = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await adminService.getRides(token);
      setRides(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load ride listings.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const handleDeleteRide = async (rideId: string) => {
    if (typeof window === "undefined") return;
    if (!window.confirm("Are you sure you want to permanently cancel and delete this ride? All passenger bookings for this ride will also be deleted. This action cannot be undone.")) return;

    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await adminService.deleteRide(rideId, token);
      setRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (err: any) {
      alert(err.message || "Failed to delete ride listing.");
    }
  };

  // Filter logic
  const filteredRides = rides.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.origin.city.toLowerCase().includes(query) ||
      r.origin.address.toLowerCase().includes(query) ||
      r.destination.city.toLowerCase().includes(query) ||
      r.destination.address.toLowerCase().includes(query) ||
      r.driverName.toLowerCase().includes(query) ||
      r.vehicleDetails.make.toLowerCase().includes(query) ||
      r.vehicleDetails.model.toLowerCase().includes(query) ||
      r.vehicleDetails.licensePlate.toLowerCase().includes(query)
    );
  });

  const STATUS_COLORS = {
    scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    in_progress: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cancelled: "bg-neutral-800 text-neutral-400 border border-neutral-700",
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-red-400">
        <h3 className="font-semibold">Error Loading Rides</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          Ride Management
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Inspect offered carpools, check route details, and cancel listings if they violate system terms.
        </p>
      </div>

      {/* Filter panel */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search by city, address, driver, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Rides Table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Departure</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Pricing & Seats</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredRides.map((r) => (
                <tr key={r.id} className="text-neutral-300 hover:bg-neutral-850/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-200">
                    <div>
                      <div>{r.driverName}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Rating: {r.driverRating.toFixed(1)} ★</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5 max-w-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 text-red-400 shrink-0" />
                        <span className="truncate" title={r.origin.address}>
                          <strong className="text-neutral-200">{r.origin.city}</strong> ({r.origin.address})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 text-emerald-400 shrink-0" />
                        <span className="truncate" title={r.destination.address}>
                          <strong className="text-neutral-200">{r.destination.city}</strong> ({r.destination.address})
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="size-3.5 text-neutral-500" />
                      <span>
                        {new Date(r.departureTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div>
                      <div className="text-neutral-200">
                        {r.vehicleDetails.color} {r.vehicleDetails.make} {r.vehicleDetails.model}
                      </div>
                      <div className="text-neutral-500 mt-0.5 font-mono tracking-wider">
                        {r.vehicleDetails.licensePlate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-0.5 text-xs text-neutral-200 font-semibold">
                        <DollarSign className="size-3 text-neutral-400" />
                        <span>{r.pricePerSeat} / seat</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                        <Users className="size-3" />
                        <span>{r.availableSeats} seat(s) available</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${STATUS_COLORS[r.status] || "bg-neutral-800 text-neutral-400"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleDeleteRide(r.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-950/20 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredRides.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    No rides matching search filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
