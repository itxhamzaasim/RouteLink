"use client";

import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

interface MobileNavProps {
  trigger: ReactElement;
  variant?: "light" | "dark";
}

export function MobileNav({ trigger, variant = "dark" }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger render={trigger} nativeButton={false} />
      <SheetContent side="right" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Logo variant="dark" />
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-3 border-t pt-6">
          <Button
            variant="outline"
            size="lg"
            className="h-11 w-full"
            render={<Link href={ROUTES.login} />}
          >
            Log in
          </Button>
          <Button
            size="lg"
            className={cn(
              "h-11 w-full bg-brand-600 text-white hover:bg-brand-700",
              variant === "light" && ""
            )}
            render={<Link href={ROUTES.register} />}
          >
            Sign up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
