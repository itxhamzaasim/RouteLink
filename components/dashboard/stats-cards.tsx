"use client";

import { useEffect, useState, useCallback } from "react";
import { Car, DollarSign, Star, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthContext } from "@/components/providers/auth-provider";
import { rideService } from "@/services/ride.service";
import { bookingService } from "@/services/booking.service";

export function StatsCards() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<{ label: string; value: string; change: string; icon: any; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setIsLoading(false);
      return;
    }

    try {
      const token = JSON.parse(rawAuth).accessToken;

      if (user.role === "driver" || user.role === "admin") {
        // Driver stats
        const rides = await rideService.getDriverRides(token);
        const bookings = await bookingService.getDriverBookings(token);

        const totalTrips = rides.length;
        const acceptedBookings = bookings.filter((b) => b.status === "accepted");
        const totalEarnings = acceptedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        // Unique passenger connections
        const uniquePassengers = new Set(acceptedBookings.map((b) => b.passengerId));
        const connectionsCount = uniquePassengers.size;

        setStats([
          {
            label: "Total Rides Offered",
            value: String(totalTrips),
            change: "all scheduled rides",
            icon: Car,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Earnings",
            value: `Rs. ${totalEarnings}`,
            change: `${acceptedBookings.length} bookings accepted`,
            icon: DollarSign,
            color: "text-brand-600 bg-brand-50",
          },
          {
            label: "Driver Rating",
            value: "5.0",
            change: "verified profile",
            icon: Star,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Passenger Connections",
            value: String(connectionsCount),
            change: "unique riders",
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
        ]);
      } else {
        // Passenger stats
        const bookings = await bookingService.getPassengerBookings(token);
        const acceptedBookings = bookings.filter((b) => b.status === "accepted");
        
        const totalTrips = acceptedBookings.length;
        const totalSpendings = acceptedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        
        // Unique driver connections
        const uniqueDrivers = new Set(acceptedBookings.map((b) => b.rideDetails.driverName));
        const connectionsCount = uniqueDrivers.size;

        setStats([
          {
            label: "Total Trips Taken",
            value: String(totalTrips),
            change: "confirmed bookings",
            icon: Car,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Total Spendings",
            value: `Rs. ${totalSpendings}`,
            change: `${bookings.length} requests made`,
            icon: DollarSign,
            color: "text-brand-600 bg-brand-50",
          },
          {
            label: "Passenger Rating",
            value: "5.0",
            change: "verified traveler",
            icon: Star,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Driver Connections",
            value: String(connectionsCount),
            change: "fellow travelers",
            icon: Users,
            color: "text-purple-600 bg-purple-50",
          },
        ]);
      }
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-neutral-200 shadow-sm animate-pulse">
            <CardContent className="p-5 flex items-center justify-center h-24">
              <Loader2 className="size-5 animate-spin text-neutral-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-neutral-200 shadow-sm animate-in fade-in zoom-in duration-200">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{stat.change}</p>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
