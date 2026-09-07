import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Hover lift only — never hides content or changes first-paint markup. */
export function MotionLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-full min-w-0 transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}
