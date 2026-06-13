"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { DashboardMobileNav } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";

export function DashboardHeader() {
  const { user } = useAuthContext();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "RL";

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


