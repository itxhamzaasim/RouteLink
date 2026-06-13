"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";
import { DashboardMobileNav } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types";

export function DashboardHeader() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "RL";

  const fetchNotifications = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const data = await notificationService.getNotifications(token);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications in header:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    if (typeof window === "undefined") return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      await notificationService.markAsRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      <DashboardMobileNav
        trigger={
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
          </Button>
        }
      />

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search rides, bookings..."
          className="h-10 border-neutral-200 bg-neutral-50 pl-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative cursor-pointer">
                <Bell className="size-5 text-neutral-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-600" />
                )}
              </Button>
            }
          />
          <DropdownMenuContent

            align="end"
            className="w-80 p-2 space-y-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-[99]"
          >
            <DropdownMenuLabel className="font-semibold px-2 py-1 text-sm text-neutral-900 border-b border-neutral-100 flex justify-between items-center bg-white">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </DropdownMenuLabel>
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-3 rounded-lg border border-transparent transition-all cursor-pointer select-none outline-none flex flex-col gap-0.5 items-start ${
                    notif.isRead
                      ? "bg-neutral-50/50 text-neutral-600"
                      : "bg-brand-50/10 text-neutral-900 font-medium hover:bg-brand-50/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <span className="text-xs font-bold leading-normal truncate max-w-[200px]">
                      {notif.title}
                    </span>
                    {!notif.isRead && (
                      <span className="size-1.5 rounded-full bg-brand-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed text-left w-full">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-neutral-400 mt-1 block">
                    {new Date(notif.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href={ROUTES.dashboardProfile}
          className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-600 hover:opacity-85 transition-opacity"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-neutral-900 text-sm text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-neutral-900 sm:block">
            {user?.firstName} {user?.lastName}
          </span>
        </Link>
      </div>
    </header>
  );
}

