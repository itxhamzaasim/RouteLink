"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, Search } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";

export function DashboardHeader() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-600" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-neutral-900 text-sm text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-neutral-900 sm:block">
              {user?.firstName} {user?.lastName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs font-normal text-neutral-500">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === "admin" && (
              <>
                <DropdownMenuItem
                  onClick={() => router.push("/admin")}
                  className="font-semibold text-brand-600 focus:text-brand-700 cursor-pointer px-3 py-2 text-sm"
                >
                  Admin Portal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => router.push(ROUTES.dashboardProfile)}
              className="text-neutral-700 focus:text-neutral-900 cursor-pointer px-3 py-2 text-sm"
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(ROUTES.dashboardSettings)}
              className="text-neutral-700 focus:text-neutral-900 cursor-pointer px-3 py-2 text-sm"
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-red-650 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 px-3 py-2 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
