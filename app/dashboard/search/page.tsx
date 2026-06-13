"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SearchResultsContent } from "@/app/rides/page";

export default function DashboardSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-neutral-400" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
