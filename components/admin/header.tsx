"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, User as UserIcon, Car, LayoutDashboard, Users, FileText } from "lucide-react";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Ride Management", href: "/admin/rides", icon: Car },
  { label: "System Reports", href: "/admin/reports", icon: FileText },
] as const;

export function AdminHeader() {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "AD";

  // Determine current active page label
  const activeNavItem = ADMIN_NAV.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );
  const pageTitle = activeNavItem ? activeNavItem.label : "Admin Portal";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6">
      {/* Mobile Nav Menu */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white lg:hidden">
              <Menu className="size-5" />
            </Button>
          }
          nativeButton={false}
        />
        <SheetContent side="left" className="w-72 bg-neutral-950 text-neutral-100 border-r border-neutral-800 p-0">
          <SheetHeader className="border-b border-neutral-800 p-4">
            <SheetTitle className="sr-only">Admin Portal Navigation</SheetTitle>
            <div className="flex items-center gap-2">
              <Logo />
              <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </SheetHeader>

          <nav className="space-y-1 p-4">
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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
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
        </SheetContent>
      </Sheet>

      {/* Page Title Display */}
      <h2 className="hidden text-base font-semibold text-neutral-100 sm:block">
        {pageTitle}
      </h2>

      {/* Right Profiles dropdown */}
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Avatar className="size-9 border border-neutral-800">
              <AvatarFallback className="bg-brand-600 text-sm font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-neutral-300 sm:block">
              {user?.firstName} {user?.lastName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-neutral-900 text-neutral-100 border-neutral-800">
            <DropdownMenuLabel className="text-neutral-400">
              <p className="font-semibold text-neutral-100">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs font-normal text-neutral-400 mt-0.5">
                {user?.email}
              </p>
              <p className="mt-1.5">
                <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-brand-400 uppercase tracking-wider">
                  {user?.role}
                </span>
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-850" />
            <DropdownMenuItem className="p-0">
              <Link href="/dashboard" className="flex w-full items-center px-3 py-2 text-sm text-neutral-300 focus:text-white select-none">
                Go to Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-850" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="text-red-400 focus:bg-red-950/20 focus:text-red-400 cursor-pointer"
            >
              <LogOut className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
