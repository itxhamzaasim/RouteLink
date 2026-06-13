import { Car, DollarSign, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  {
    label: "Total trips",
    value: "24",
    change: "+3 this month",
    icon: Car,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Earnings saved",
    value: "$186",
    change: "vs. solo rides",
    icon: DollarSign,
    color: "text-brand-600 bg-brand-50",
  },
  {
    label: "Your rating",
    value: "4.9",
    change: "12 reviews",
    icon: Star,
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Connections",
    value: "18",
    change: "fellow travelers",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
  },
] as const;

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label} className="border-neutral-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-400">{stat.change}</p>
              </div>
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
