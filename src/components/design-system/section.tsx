import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  tone = "default",
  children,
  ...props
}: React.ComponentProps<"section"> & {
  tone?: "default" | "muted" | "bordered";
}) {
  return (
    <section
      className={cn(
        "scroll-mt-24 py-14 sm:py-20 lg:py-28",
        tone === "muted" && "bg-muted/25 border-y border-border/40",
        tone === "bordered" && "border-y border-border/40",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleId,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto flex flex-col items-center text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="inline-flex items-center rounded-full border border-primary/15 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={titleId}
        className={cn(
          "font-display text-[1.65rem] sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight text-balance text-foreground leading-[1.25]",
          eyebrow ? "mt-4" : undefined
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 sm:mt-4 text-sm sm:text-[0.95rem] text-muted-foreground leading-relaxed text-pretty max-w-xl">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function IconWell({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "size-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 ring-1 ring-primary/10",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function SurfaceCard({
  className,
  children,
  accent,
  ...props
}: React.ComponentProps<"div"> & { accent?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]",
        "transition-[box-shadow,border-color,transform] duration-200 motion-reduce:transition-none",
        "hover:-translate-y-px hover:border-border hover:shadow-[var(--shadow-card-hover)]",
        "focus-within:ring-2 focus-within:ring-ring/40",
        className
      )}
      {...props}
    >
      {accent ? (
        <span
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: accent }}
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  );
}

export function BentoPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-border/50 overflow-hidden shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function BentoCell({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col bg-card p-5 sm:p-6",
        "transition-colors duration-200 motion-reduce:transition-none",
        "hover:bg-muted/35",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AppFrame({
  label,
  meta,
  footer,
  className,
  children,
}: {
  label?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-card overflow-hidden ring-1 ring-foreground/[0.04] shadow-[var(--shadow-elevated)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1 shrink-0" aria-hidden>
            <span className="size-2 rounded-full bg-muted-foreground/35" />
            <span className="size-2 rounded-full bg-muted-foreground/35" />
            <span className="size-2 rounded-full bg-muted-foreground/35" />
          </div>
          {label ? (
            <div className="text-[11px] sm:text-xs font-medium text-muted-foreground truncate">
              {label}
            </div>
          ) : null}
        </div>
        {meta ? (
          <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-primary shrink-0">
            {meta}
          </div>
        ) : null}
      </div>
      <div className="relative bg-muted/20">{children}</div>
      {footer ? (
        <div className="border-t border-border/50 bg-card/80 px-3 sm:px-4 py-2.5">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
