import Link from "next/link";
import { MapPin } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

export function Logo({
  className,
  showText = true,
  variant = "dark",
}: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5 font-semibold tracking-tight", className)}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl",
          variant === "light"
            ? "bg-white text-brand-600"
            : "bg-brand-600 text-white"
        )}
      >
        <MapPin className="size-5" strokeWidth={2.5} />
      </span>
      {showText && (
        <span
          className={cn(
            "text-xl",
            variant === "light" ? "text-white" : "text-foreground"
          )}
        >
          {APP_NAME}
        </span>
      )}
    </Link>
  );
}
