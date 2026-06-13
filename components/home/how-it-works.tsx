import { Search, UserCheck, CarFront } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Search your route",
    description:
      "Enter your departure and destination. Browse available rides that match your schedule.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Choose your driver",
    description:
      "Compare profiles, ratings, and prices. Pick the ride that works best for you.",
  },
  {
    step: "03",
    icon: CarFront,
    title: "Hit the road",
    description:
      "Meet at the pickup point, enjoy the ride, and pay securely through the app.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Three steps to your next ride
          </h2>
        </div>

        <div className="relative mt-16">
          <div
            className="absolute top-24 right-0 left-0 hidden h-0.5 bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block"
            aria-hidden
          />

          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg">
                  <item.icon className="size-7" />
                </div>
                <span className="mt-6 block text-sm font-bold text-brand-600">
                  Step {item.step}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
