"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Settings,
  Ticket,
  User,
  ShieldCheck,
  MessageSquare,
  MessageSquareMore,
  Search,
  History,
  Star,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";
import { messageService } from "@/services/message.service";
import { notificationService } from "@/services/notification.service";
import { bookingService } from "@/services/booking.service";

const ICON_MAP = {
  LayoutDashboard,
  Car,
  Ticket,
  User,
  Settings,
  ShieldCheck,
  MessageSquare,
  MessageSquareMore,
  Search,
  History,
  Star,
  Bell,
} as const;


export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const [unreadDMs, setUnreadDMs] = useState(0);
  const [unreadCommunity, setUnreadCommunity] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadOffers, setUnreadOffers] = useState(0);

  const fetchUnreadCounts = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const lastCommunitySeen = localStorage.getItem("routelink-last-community-visit");
      
      const promises: Promise<any>[] = [
        messageService.getUnreadCounts(lastCommunitySeen, token),
        notificationService.getNotifications(token),
      ];
      if (user.role === "driver") {
        promises.push(bookingService.getDriverBookings(token));
      }

      const results = await Promise.all(promises);
      const data = results[0];
      const notifs = results[1];

      setUnreadDMs(data.unreadDMsCount);
      setUnreadCommunity(data.unreadCommunityCount);
      setUnreadNotifications(notifs.filter((n: any) => !n.isRead).length);

      if (user.role === "driver" && results[2]) {
        const pendingCount = results[2].filter((b: any) => b.status === "pending").length;
        setUnreadOffers(pendingCount);
      } else {
        setUnreadOffers(0);
      }
    } catch (err) {
      console.error("Failed to fetch unread counts in sidebar:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  const navItems: Array<{ label: string; href: string; icon: string }> = [];
  DASHBOARD_NAV.forEach((item) => {
    let label: string = item.label;
    let href: string = item.href;

    if (item.href === "/dashboard/rides" && user?.role === "passenger") {
      label = "My Commute Bookings";
    }
    if (item.href === "/dashboard/search") {
      if (user?.role === "passenger") {
        label = "Available Rides";
      } else {
        label = "Requested Rides";
        href = "/dashboard/requested-rides";
      }
    }
    navItems.push({ label, href, icon: item.icon });

    if (item.label === "Activity Feed" && user?.role === "driver") {
      navItems.push({
        label: "Requested Offers",
        href: "/dashboard/requested-offers",
        icon: "Ticket",
      });
    }
  });

  if (user?.role === "admin") {
    navItems.push({
      label: "Admin Panel",
      href: "/admin",
      icon: "ShieldCheck",
    });
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-white lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          const hasDot = 
            (item.label === "Messages" && unreadDMs > 0) ||
            (item.label === "Community" && unreadCommunity > 0) ||
            (item.label === "Activity Feed" && unreadNotifications > 0) ||
            (item.label === "Requested Offers" && unreadOffers > 0);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5" />
                {item.label}
              </div>
              {hasDot && (
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse mr-1.5 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


