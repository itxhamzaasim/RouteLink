"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService, AdminStats } from "@/services/admin.service";
import { LineChart, BarChart } from "@/components/admin/charts";
import { Users, Car, MapPin, Ticket, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await adminService.getStats(token);
      setStats(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard statistics.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
        <h3 className="font-semibold">Error Loading Statistics</h3>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
          System Overview
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Real-time metrics and administration controls for RouteLink.
        </p>
      </div>

      {/* Widgets grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Users */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Users
            </CardTitle>
            <Users className="size-4 text-brand-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{stats?.totalUsers}</div>
            <p className="mt-1 text-[10px] text-neutral-500">Registered accounts</p>
          </CardContent>
        </Card>

        {/* Total Drivers */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Drivers
            </CardTitle>
            <ShieldCheck className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{stats?.totalDrivers}</div>
            <p className="mt-1 text-[10px] text-neutral-500">Offering ride services</p>
          </CardContent>
        </Card>

        {/* Total Passengers */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Passengers
            </CardTitle>
            <Users className="size-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{stats?.totalPassengers}</div>
            <p className="mt-1 text-[10px] text-neutral-500">Active commuters</p>
          </CardContent>
        </Card>

        {/* Total Rides */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Total Rides
            </CardTitle>
            <Car className="size-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{stats?.totalRides}</div>
            <p className="mt-1 text-[10px] text-neutral-500">Trips scheduled</p>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card className="border-neutral-800 bg-neutral-900/50 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Pending Requests
            </CardTitle>
            <Ticket className="size-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-100">{stats?.activeRequests}</div>
            <p className="mt-1 text-[10px] text-neutral-500">Requests needing approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-6 md:grid-cols-2">
        <LineChart data={stats?.usersTrend || []} title="User Registration Trend (Last 7 Days)" />
        <BarChart data={stats?.ridesTrend || []} title="Rides Created Trend (Last 7 Days)" />
      </div>

      {/* Recents split layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent users list */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <Users className="size-4 text-brand-400" />
            Recently Registered Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-850 text-neutral-400 font-semibold">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Email</th>
                  <th className="py-2.5">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {stats?.recentUsers.map((u) => (
                  <tr key={u.id} className="text-neutral-300">
                    <td className="py-3 font-medium text-neutral-200">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3 capitalize">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.role === "admin"
                            ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                            : u.role === "driver"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats?.recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-neutral-500">
                      No recent registrations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent rides list */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <Car className="size-4 text-brand-400" />
            Recently Created Rides
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-850 text-neutral-400 font-semibold">
                  <th className="py-2.5">Route</th>
                  <th className="py-2.5">Driver</th>
                  <th className="py-2.5">Departure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {stats?.recentRides.map((r) => (
                  <tr key={r.id} className="text-neutral-300">
                    <td className="py-3 flex items-center gap-1 text-neutral-200 font-medium">
                      <span>{r.origin.city}</span>
                      <span className="text-neutral-500">&rarr;</span>
                      <span>{r.destination.city}</span>
                    </td>
                    <td className="py-3">{r.driverName}</td>
                    <td className="py-3">
                      {new Date(r.departureTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {stats?.recentRides.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-neutral-500">
                      No rides created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
