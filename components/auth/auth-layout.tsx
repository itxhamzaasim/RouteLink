import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { ROUTES } from "@/lib/constants";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  alternateText,
  alternateHref,
  alternateLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-neutral-950 lg:block">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-600/40 via-neutral-950 to-neutral-950"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="light" />
          <div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                RouteLink
              </h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                A secure campus and corporate ride-sharing platform designed for students and professionals in Lahore. Commute sustainably, share transport expenses, and travel safely.
              </p>
              <p className="text-xs text-neutral-400 font-medium pt-2">
                Developed by Muhammad Hamza Asim as a Final Year Project for the Department of Software Engineering.
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} RouteLink
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-neutral-600">{subtitle}</p>
          </div>

          {children}

          <p className="mt-8 text-center text-sm text-neutral-600">
            {alternateText}{" "}
            <Link
              href={alternateHref}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {alternateLabel}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-neutral-400">
            By continuing, you agree to RouteLink&apos;s{" "}
            <Link href="#" className="underline hover:text-neutral-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-neutral-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
