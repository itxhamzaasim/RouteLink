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
import { useAuthContext } from "@/components/providers/auth-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";
import { messageService } from "@/services/message.service";

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


interface DashboardMobileNavProps {
  trigger: ReactElement;
}

export function DashboardMobileNav({ trigger }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const [unreadDMs, setUnreadDMs] = useState(0);
  const [unreadCommunity, setUnreadCommunity] = useState(0);

  const fetchUnreadCounts = useCallback(async () => {
    if (typeof window === "undefined" || !user) return;
    const rawAuth = localStorage.getItem("routelink-auth");
    if (!rawAuth) return;

    try {
      const token = JSON.parse(rawAuth).accessToken;
      const lastCommunitySeen = localStorage.getItem("routelink-last-community-visit");
      const data = await messageService.getUnreadCounts(lastCommunitySeen, token);
      setUnreadDMs(data.unreadDMsCount);
      setUnreadCommunity(data.unreadCommunityCount);
    } catch (err) {
      console.error("Failed to fetch unread counts in mobile sidebar:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  const navItems: Array<{ label: string; href: string; icon: string }> = DASHBOARD_NAV.map((item) => {
    if (item.href === "/dashboard/rides" && user?.role === "passenger") {
      return { label: "My Commute Bookings", href: item.href, icon: item.icon };
    }
    if (item.href === "/dashboard/search") {
      if (user?.role === "passenger") {
        return { label: "Available Rides", href: item.href, icon: item.icon };
      } else {
        return { label: "Requested Rides", href: "/dashboard/requested-rides", icon: item.icon };
      }
    }
    return {
      label: item.label,
      href: item.href,
      icon: item.icon,
    };
  });
  if (user?.role === "admin") {
    navItems.push({
      label: "Admin Panel",
      href: "/admin",
      icon: "ShieldCheck",
    });
  }

  return (
    <Sheet>
      <SheetTrigger render={trigger} nativeButton={false} />
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const hasDot = 
              (item.label === "Messages" && unreadDMs > 0) ||
              (item.label === "Community" && unreadCommunity > 0);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-5" />
                  {item.label}
                </div>
                {hasDot && (
                  <Star className="size-4 text-emerald-500 fill-emerald-500 animate-pulse mr-1" />
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

