import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CRAWLABLE_START_AUDIT_HREF } from "@/lib/marketing-hrefs";
import { cn } from "@/lib/utils";

type StartAuditCtaProps = {
  children: ReactNode;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
};

/**
 * Guest “start audit” control. Uses a real href so the click always navigates
 * even if the Supabase browser client hangs. Signed-in users hitting /auth are
 * redirected by middleware.
 */
export function StartAuditCta({
  children,
  className,
  size = "lg",
  variant = "default",
}: StartAuditCtaProps) {
  return (
    <Button size={size} variant={variant} asChild className={cn(className)}>
      <Link href={CRAWLABLE_START_AUDIT_HREF}>{children}</Link>
    </Button>
  );
}
