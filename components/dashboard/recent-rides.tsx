"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { rideService } from "@/services/ride.service";
import type { Ride } from "@/types";

const STATUS_STYLES = {
  scheduled: "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-50",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  completed: "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100",
  cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
} as const;

export function RecentRides() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentRides = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setIsLoading(false);
      return;
    }

    try {
      const token = JSON.parse(rawAuth).accessToken;
      // Fetch latest 5 rides
      const response = await rideService.searchRides({ limit: 5, sortBy: "date", sortOrder: "desc" }, token);
      setRides(response.rides);
    } catch (error) {
      console.error("Error loading recent rides:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentRides();
  }, [fetchRecentRides]);

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent rides</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-brand-600"
          onClick={() => router.push("/rides")}
        >
          View all
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-36 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-neutral-400" />
          </div>
        ) : rides.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            No rides available yet.
          </div>
        ) : (
          rides.map((ride) => (
            <div
              key={ride.id}
              className="flex flex-col gap-3 rounded-xl border border-neutral-100 p-4 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <MapPin className="size-4 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">
                    {ride.origin.city} &rarr; {ride.destination.city}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {formatDateTime(ride.departureTime)} &middot; {ride.driverName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:shrink-0">
                <Badge variant="outline" className={STATUS_STYLES[ride.status] || STATUS_STYLES.scheduled}>
                  {ride.status.replace("_", " ")}
                </Badge>
                <span className="text-sm font-semibold text-neutral-900">
                  Rs. {ride.pricePerSeat}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
