"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Loader2, Check, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/providers/auth-provider";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types";

export default function ActivityPage() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (showIndicator = true) => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) {
      setError("Please log in to view activity feed.");
      setIsLoading(false);
      return;
    }

    const token = JSON.parse(rawAuth).accessToken;
    if (showIndicator) {
      if (notifications.length === 0) setIsLoading(true);
      else setIsRefreshing(true);
    }
    setError("");

    try {
      const data = await notificationService.getNotifications(token);
      // Sort: unread first, then newest first
      const sorted = data.sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotifications(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch activity feed.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, notifications.length]);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await notificationService.markAsRead(id, token);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    const token = JSON.parse(rawAuth).accessToken;
    try {
      // Mark all unread as read in parallel
      await Promise.all(
        unread.map((n) => notificationService.markAsRead(n.id, token))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="size-6 text-brand-600 animate-in fade-in" />
            Activity Feed
          </h1>
          <p className="mt-1 text-neutral-500 text-sm">
            Stay updated with your commute statuses, requests, and notifications
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-9 border-neutral-200 hover:bg-neutral-50 cursor-pointer"
            >
              <Check className="size-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchNotifications(true)}
            disabled={isRefreshing}
            className="size-9 border-neutral-200 hover:bg-neutral-50 cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin text-brand-600" : "text-neutral-500"}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <Loader2 className="size-8 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center text-red-700">{error}</CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="border-dashed border-neutral-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="size-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Bell className="size-6" />
            </div>
            <p className="text-lg font-medium text-neutral-950">No notifications yet</p>
            <p className="max-w-xs text-sm text-neutral-500 leading-normal">
              You will receive notifications here when you request rides, when drivers accept them, or when commuters book seats.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            return (
              <Card
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                className={`transition-all border-neutral-200 hover:shadow-xs cursor-pointer ${
                  notif.isRead
                    ? "bg-white/60 text-neutral-600 border-neutral-200"
                    : "bg-brand-50/20 border-brand-200 text-neutral-950 font-medium"
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                  <div
                    className={`size-10 rounded-full shrink-0 flex items-center justify-center ${
                      notif.isRead
                        ? "bg-neutral-100 text-neutral-500"
                        : "bg-brand-100 text-brand-700 animate-pulse"
                    }`}
                  >
                    <Bell className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate">{notif.title}</p>
                      <span className="text-[10px] text-neutral-400 font-normal shrink-0">
                        {formatDateTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    {!notif.isRead && (
                      <div className="pt-1">
                        <Badge className="bg-brand-600 hover:bg-brand-600 text-white font-semibold text-[9px] px-2 py-0.5 rounded-full">
                          New Alert
                        </Badge>
                      </div>
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
