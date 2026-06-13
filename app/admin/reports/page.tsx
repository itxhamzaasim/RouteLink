"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { Loader2, Search, Calendar, MapPin, DollarSign, Activity } from "lucide-react";
import type { Booking } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const loadBookings = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await adminService.getBookings(token);
      setBookings(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load system reports.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Search filter
  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.passengerName.toLowerCase().includes(query) ||
      b.rideDetails.driverName.toLowerCase().includes(query) ||
      b.rideDetails.origin.city.toLowerCase().includes(query) ||
      b.rideDetails.destination.city.toLowerCase().includes(query) ||
      b.status.toLowerCase().includes(query)
    );
  });

  // Calculate totals
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length;

  const STATUS_COLORS = {
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    accepted: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
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
        <h3 className="font-semibold">Error Loading Reports</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          System Reports & Activity Logs
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Audit system usage, passenger requests, state transitions, and ride bookings.
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <div className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-4">
          <div className="text-neutral-450 text-[10px] uppercase font-semibold tracking-wider">Total Booking Logs</div>
          <div className="text-xl font-bold text-neutral-100 mt-1">{totalCount}</div>
        </div>

        {/* Pending Approval */}
        <div className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-4">
          <div className="text-neutral-450 text-[10px] uppercase font-semibold tracking-wider">Pending Decisions</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{pendingCount}</div>
        </div>

        {/* Confirmed Trips */}
        <div className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-4">
          <div className="text-neutral-450 text-[10px] uppercase font-semibold tracking-wider">Confirmed Bookings</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{acceptedCount}</div>
        </div>

        {/* Cancelled/Rejected */}
        <div className="rounded-xl border border-neutral-850 bg-neutral-900/50 p-4">
          <div className="text-neutral-450 text-[10px] uppercase font-semibold tracking-wider">Cancelled / Rejected</div>
          <div className="text-xl font-bold text-neutral-400 mt-1">{cancelledCount}</div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search by passenger, driver, city, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">Passenger</th>
                <th className="px-6 py-4">Route Details</th>
                <th className="px-6 py-4">Driver Name</th>
                <th className="px-6 py-4">Seats & Cost</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Requested Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="text-neutral-300 hover:bg-neutral-850/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-neutral-200">
                    {b.passengerName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-200">
                        <MapPin className="size-3 text-red-400" />
                        <span>{b.rideDetails.origin.city}</span>
                        <span className="text-neutral-500">&rarr;</span>
                        <span>{b.rideDetails.destination.city}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {b.rideDetails.driverName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5 text-xs">
                      <div className="text-neutral-200 font-medium">{b.seatsBooked} seat(s)</div>
                      <div className="flex items-center text-[10px] text-neutral-500">
                        <DollarSign className="size-3 text-neutral-500" />
                        <span>${b.totalPrice} total</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider capitalize ${STATUS_COLORS[b.status] || "bg-neutral-800 text-neutral-400"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Calendar className="size-3.5 text-neutral-600" />
                      <span>
                        {new Date(b.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 text-sm">
                    No booking logs matching search filters found.
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
