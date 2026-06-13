"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RideSearchParams } from "@/types";

export function SearchWidget() {
  const router = useRouter();
  const [params, setParams] = useState<RideSearchParams>({
    origin: "",
    destination: "",
    date: "",
    passengers: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (params.origin) query.append("originCity", params.origin);
    if (params.destination) query.append("destinationCity", params.destination);
    if (params.date) query.append("date", params.date);
    if (params.passengers) query.append("seats", String(params.passengers));

    router.push(`/rides?${query.toString()}`);
  };

  return (
    <form
      id="search"
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/10 bg-white p-4 shadow-2xl shadow-black/20 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">
          Where are you going?
        </h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Find a ride
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="origin" className="text-neutral-600">
            From
          </Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brand-600" />
            <Input
              id="origin"
              placeholder="City or address"
              value={params.origin}
              onChange={(e) =>
                setParams((p) => ({ ...p, origin: e.target.value }))
              }
              className="h-12 border-neutral-200 bg-neutral-50 pl-10 text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="destination" className="text-neutral-600">
            To
          </Label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="destination"
              placeholder="Destination"
              value={params.destination}
              onChange={(e) =>
                setParams((p) => ({ ...p, destination: e.target.value }))
              }
              className="h-12 border-neutral-200 bg-neutral-50 pl-10 text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date" className="text-neutral-600">
            Date
          </Label>
          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="date"
              type="date"
              value={params.date}
              onChange={(e) =>
                setParams((p) => ({ ...p, date: e.target.value }))
              }
              className="h-12 border-neutral-200 bg-neutral-50 pl-10 text-neutral-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="passengers" className="text-neutral-600">
            Passengers
          </Label>
          <div className="relative">
            <Users className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="passengers"
              type="number"
              min={1}
              max={8}
              value={params.passengers}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  passengers: parseInt(e.target.value, 10) || 1,
                }))
              }
              className="h-12 border-neutral-200 bg-neutral-50 pl-10 text-neutral-900"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-5 h-12 w-full bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto sm:px-8"
      >
        Search rides
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
