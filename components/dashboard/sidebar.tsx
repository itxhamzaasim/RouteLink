"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Settings,
  Ticket,
  User,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/components/providers/auth-provider";

const ICON_MAP = {
  LayoutDashboard,
  Car,
  Ticket,
  User,
  Settings,
  ShieldCheck,
} as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  const navItems: { label: string; href: string; icon: string }[] = [...DASHBOARD_NAV];
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

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-900">Go Pro</p>
          <p className="mt-1 text-xs text-brand-700">
            Unlock priority booking and zero service fees.
          </p>
          <button
            type="button"
            className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Learn more &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
}
