import {
  Car,
  CreditCard,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: CreditCard,
    title: "Affordable fares",
    description:
      "Split costs with other passengers and save up to 75% compared to traditional transport.",
  },
  {
    icon: Shield,
    title: "Verified community",
    description:
      "Every member is verified with ID checks, ratings, and reviews for peace of mind.",
  },
  {
    icon: Zap,
    title: "Instant booking",
    description:
      "Find and book rides in seconds. Real-time availability and instant confirmations.",
  },
  {
    icon: Car,
    title: "Flexible routes",
    description:
      "Drivers set their own routes and schedules. Travel on your terms.",
  },
  {
    icon: Users,
    title: "Social travel",
    description:
      "Meet like-minded travelers, reduce your carbon footprint, and make the journey fun.",
  },
  {
    icon: Star,
    title: "Top-rated drivers",
    description:
      "Browse driver profiles, ratings, and vehicle details before you book.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="offer" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Why RouteLink
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Ride sharing made simple
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Everything you need for safe, affordable, and convenient shared travel.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
