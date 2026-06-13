"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Ride Management", href: "/admin/rides", icon: Car },
  { label: "System Reports", href: "/admin/reports", icon: FileText },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 lg:flex">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1 p-4">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/10"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Return App Link */}
      <div className="border-t border-neutral-800 p-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all duration-200"
        >
          <ArrowLeft className="size-5" />
          Return to App
        </Link>
      </div>
    </aside>
  );
}
