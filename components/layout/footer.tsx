import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { APP_TAGLINE, ROUTES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  Product: [
    { label: "Find a ride", href: "#search" },
    { label: "Offer a ride", href: "#offer" },
    { label: "How it works", href: "#how-it-works" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "Help center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookies", href: "#" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              {APP_TAGLINE} Connect with drivers and passengers across your city
              and beyond.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-neutral-800" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} RouteLink. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href={ROUTES.login}
              className="text-neutral-400 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href={ROUTES.register}
              className="text-neutral-400 transition-colors hover:text-white"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
