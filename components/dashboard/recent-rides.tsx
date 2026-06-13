import { ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RECENT_RIDES = [
  {
    id: "1",
    origin: "Downtown SF",
    destination: "San Jose",
    date: "Today, 5:30 PM",
    driver: "Marcus Chen",
    price: 18,
    seats: 2,
    status: "confirmed" as const,
  },
  {
    id: "2",
    origin: "Oakland",
    destination: "Sacramento",
    date: "Tomorrow, 8:00 AM",
    driver: "Elena Rodriguez",
    price: 22,
    seats: 1,
    status: "pending" as const,
  },
  {
    id: "3",
    origin: "Berkeley",
    destination: "Palo Alto",
    date: "Jun 12, 6:15 PM",
    driver: "James Park",
    price: 15,
    seats: 3,
    status: "completed" as const,
  },
] as const;

const STATUS_STYLES = {
  confirmed: "bg-brand-50 text-brand-700",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-neutral-100 text-neutral-600",
} as const;

export function RecentRides() {
  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent rides</CardTitle>
        <Button variant="ghost" size="sm" className="text-brand-600">
          View all
          <ArrowRight className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {RECENT_RIDES.map((ride) => (
          <div
            key={ride.id}
            className="flex flex-col gap-3 rounded-xl border border-neutral-100 p-4 transition-colors hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <MapPin className="size-4 text-neutral-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">
                  {ride.origin} &rarr; {ride.destination}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {ride.date} &middot; {ride.driver}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:shrink-0">
              <Badge className={STATUS_STYLES[ride.status]}>{ride.status}</Badge>
              <span className="text-sm font-semibold text-neutral-900">
                ${ride.price}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
