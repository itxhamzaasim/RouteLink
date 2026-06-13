"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HeaderProps {
  variant?: "transparent" | "solid";
}

export function Header({ variant = "solid" }: HeaderProps) {
  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors",
        isTransparent
          ? "border-white/10 bg-black/20 backdrop-blur-md"
          : "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo variant={isTransparent ? "light" : "dark"} />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:opacity-80",
                isTransparent ? "text-white/90" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "h-10 px-4",
              isTransparent && "text-white hover:bg-white/10 hover:text-white"
            )}
            render={<Link href={ROUTES.login} />}
          >
            Log in
          </Button>
          <Button
            size="lg"
            className="h-10 bg-brand-600 px-5 text-white hover:bg-brand-700"
            render={<Link href={ROUTES.register} />}
          >
            Sign up
          </Button>
        </div>

        <MobileNav
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                isTransparent && "text-white hover:bg-white/10"
              )}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          }
          variant={isTransparent ? "light" : "dark"}
        />
      </div>
    </header>
  );
}
