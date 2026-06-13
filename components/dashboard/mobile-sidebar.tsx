"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Settings,
  Ticket,
  User,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
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

const ICON_MAP = {
  LayoutDashboard,
  Car,
  Ticket,
  User,
  Settings,
} as const;

interface DashboardMobileNavProps {
  trigger: ReactElement;
}

export function DashboardMobileNav({ trigger }: DashboardMobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger render={trigger} nativeButton={false} />
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav className="space-y-1 p-4">
          {DASHBOARD_NAV.map((item) => {
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
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
