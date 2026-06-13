"use client";

import { useEffect, useState, useCallback } from "react";
import { RecentRides } from "@/components/dashboard/recent-rides";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Check, X, Bell, User, Clock, Loader2, ArrowRight } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { notificationService } from "@/services/notification.service";
import { useAuthContext } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import type { Booking, Notification } from "@/types";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  const [requests, setRequests] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;

      // Only load driver bookings if the user is a driver or admin
      if (user?.role === "driver" || user?.role === "admin") {
        const reqData = await bookingService.getDriverBookings(token);
        setRequests(reqData);
      }
      setIsLoadingRequests(false);

      const notifData = await notificationService.getNotifications(token);
      setNotifications(notifData);
      setIsLoadingNotifications(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard statistics.");
      setIsLoadingRequests(false);
      setIsLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const STATUS_COLORS = {
    pending: "text-amber-700 bg-amber-50 border-amber-200",
    accepted: "text-brand-700 bg-brand-50 border-brand-200",
    rejected: "text-red-700 bg-red-50 border-red-200",
    cancelled: "text-neutral-600 bg-neutral-100 border-neutral-200",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-neutral-500">
            Welcome back, {user?.firstName}! Here&apos;s an overview of your activity.
          </p>
        </div>
        {user?.role === "driver" && (
          <Button
            onClick={() => router.push(ROUTES.dashboardRides)}
            className="h-10 bg-brand-600 text-white hover:bg-brand-700"
          >
            <Plus className="size-4" />
            Offer a ride
          </Button>
        )}
      </div>

      <StatsCards />

      {/* Grid: Driver requests vs activity log */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {user?.role === "driver" && (
            <Card className="border-neutral-200 shadow-sm">
              <div className="border-b px-5 py-4 flex justify-between items-center bg-white rounded-t-2xl">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Incoming Ride Requests
                </h2>
                <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                  {pendingRequests.length} pending
                </Badge>
              </div>
              <CardContent className="p-0">
                {isLoadingRequests ? (
                  <div className="flex h-36 items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-neutral-400" />
                  </div>
                ) : requests.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 text-sm">
                    No requests received yet for your rides.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-neutral-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">{req.passengerName}</span>
                            <Badge variant="outline" className={`text-xs ${STATUS_COLORS[req.status]}`}>
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500">
                            Route: <strong className="text-neutral-800">{req.rideDetails.origin.city} &rarr; {req.rideDetails.destination.city}</strong>
                          </p>
                          <p className="text-xs text-neutral-400">
                            Booked {req.seatsBooked} seat(s) &middot; Total Price: Rs. {req.totalPrice}
                          </p>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleAccept(req.id)}
                              size="sm"
                              className="h-9 px-3 bg-brand-600 hover:bg-brand-700 text-white flex gap-1 items-center"
                            >
                              <Check className="size-4" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleReject(req.id)}
                              size="sm"
                              variant="ghost"
                              className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border border-neutral-100"
                            >
                              <X className="size-4" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <RecentRides />
        </div>

        {/* Live Notification / Activity Log Feed */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2 text-neutral-900 pb-2 border-b">
            <Bell className="size-4 text-brand-600" />
            <h2 className="text-lg font-semibold">Activity Log</h2>
          </div>

          {isLoadingNotifications ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-neutral-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center text-neutral-400 text-xs">
              No recent notifications or updates.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                    notif.isRead
                      ? "bg-neutral-50/50 border-neutral-100 text-neutral-600"
                      : "bg-brand-50/30 border-brand-100 text-neutral-900 shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="font-semibold text-xs">{notif.title}</p>
                    {!notif.isRead && (
                      <span className="size-1.5 shrink-0 rounded-full bg-brand-600 mt-1" />
                    )}
                  </div>
                  <p className="text-xs mt-1 text-neutral-500 leading-normal">{notif.message}</p>
                  <p className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
