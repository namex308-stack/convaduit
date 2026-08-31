import { Check, X, Minus, Building2, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { translate as t } from "@/lib/i18n";
import { Container, IconWell, Section, SectionHeader } from "@/components/design-system/section";

const COLS = [
  { key: "diy", nameKey: "compTable.diy", icon: User, tone: "muted" },
  { key: "agency", nameKey: "compTable.agency", icon: Building2, tone: "muted" },
  { key: "ConvAudit", nameKey: "compTable.ConvAudit", icon: Sparkles, tone: "brand" },
] as const;

type Cell = { v: "yes" | "no" | "partial"; textKey?: "compTable.daysWeeks" | "compTable.weeks" | "compTable.seconds" | "compTable.freeTime" | "compTable.costAgency" | "compTable.from0" | "compTable.manual" | "compTable.extraCost" | "compTable.retainer" | "compTable.onYou" | "compTable.varies" };

const ROWS: { labelKey: "compTable.row1" | "compTable.row2" | "compTable.row3" | "compTable.row4" | "compTable.row5" | "compTable.row6" | "compTable.row7" | "compTable.row8"; cells: Record<string, Cell> }[] = [
  {
    labelKey: "compTable.row1",
    cells: { diy: { v: "no", textKey: "compTable.daysWeeks" }, agency: { v: "partial", textKey: "compTable.weeks" }, ConvAudit: { v: "yes", textKey: "compTable.seconds" } },
  },
  {
    labelKey: "compTable.row2",
    cells: { diy: { v: "partial", textKey: "compTable.freeTime" }, agency: { v: "no", textKey: "compTable.costAgency" }, ConvAudit: { v: "yes", textKey: "compTable.from0" } },
  },
  {
    labelKey: "compTable.row3",
    cells: { diy: { v: "no" }, agency: { v: "no" }, ConvAudit: { v: "yes" } },
  },
  {
    labelKey: "compTable.row4",
    cells: { diy: { v: "partial", textKey: "compTable.manual" }, agency: { v: "yes" }, ConvAudit: { v: "yes" } },
  },
  {
    labelKey: "compTable.row5",
    cells: { diy: { v: "no" }, agency: { v: "partial", textKey: "compTable.extraCost" }, ConvAudit: { v: "yes" } },
  },
  {
    labelKey: "compTable.row6",
    cells: { diy: { v: "no" }, agency: { v: "partial", textKey: "compTable.retainer" }, ConvAudit: { v: "yes" } },
  },
  {
    labelKey: "compTable.row7",
    cells: { diy: { v: "partial", textKey: "compTable.manual" }, agency: { v: "yes" }, ConvAudit: { v: "yes" } },
  },
  {
    labelKey: "compTable.row8",
    cells: { diy: { v: "partial", textKey: "compTable.onYou" }, agency: { v: "partial", textKey: "compTable.varies" }, ConvAudit: { v: "yes" } },
  },
] as const;

function ComparisonValue({ cell, brand }: { cell: Cell; brand?: boolean }) {
  return (
    <span className="flex flex-col items-center justify-center gap-1 min-w-0">
      <CellIcon v={cell.v} brand={brand} />
      {cell.textKey ? (
        <span
          className={cn(
            "text-[10px] sm:text-xs leading-snug text-pretty",
            cell.v === "yes" ? "text-primary font-medium" : "text-muted-foreground"
          )}
        >
          {t(cell.textKey)}
        </span>
      ) : null}
    </span>
  );
}

export function ComparisonTable() {
  return (
    <Section>
      <Container className="max-w-5xl overflow-x-hidden">
        <SectionHeader
          align="center"
          eyebrow={t("compTable.eyebrow")}
          title={t("compTable.title")}
          description={t("compTable.subtitle")}
          className="mb-10 sm:mb-12"
        />

        {/* Mobile: stacked criterion cards — full data, no page overflow */}
        <ul className="md:hidden space-y-3">
          {ROWS.map((row) => (
            <li
              key={row.labelKey}
              className="rounded-xl border border-border/50 bg-card p-3.5 shadow-[var(--shadow-card)]"
            >
              <p className="text-sm font-semibold text-foreground text-pretty mb-3">
                {t(row.labelKey)}
              </p>
              <ul className="grid grid-cols-3 gap-1.5">
                {COLS.map((c) => {
                  const cell = row.cells[c.key];
                  return (
                    <li
                      key={c.key}
                      className={cn(
                        "flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-1 py-2 text-center",
                        c.tone === "brand" && "bg-primary/5"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-semibold leading-tight text-pretty",
                          c.tone === "brand" ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {t(c.nameKey)}
                      </span>
                      <ComparisonValue cell={cell} brand={c.tone === "brand"} />
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="hidden md:block rounded-xl border border-border/50 bg-card overflow-hidden shadow-[var(--shadow-card)]">
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">{t("compTable.title")}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[28%] p-4 lg:p-5 text-start font-medium" />
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "p-4 lg:p-5 border-s border-border/50 text-center font-medium",
                      c.tone === "brand" && "bg-primary/5"
                    )}
                  >
                    <span className="flex flex-col items-center justify-center gap-1.5">
                      <IconWell
                        className={cn(
                          "size-9 rounded-xl",
                          c.tone === "brand" ? "gradient-brand text-white bg-transparent" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <c.icon className="size-4" aria-hidden />
                      </IconWell>
                      <span
                        className={cn(
                          "text-xs lg:text-sm font-semibold text-pretty",
                          c.tone === "brand" && "text-primary"
                        )}
                      >
                        {t(c.nameKey)}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.labelKey}
                  className={cn("border-t border-border/50", i % 2 === 1 && "bg-muted/20")}
                >
                  <th
                    scope="row"
                    className="p-3.5 lg:p-4 text-start text-xs lg:text-sm font-medium text-foreground/80 text-pretty"
                  >
                    {t(row.labelKey)}
                  </th>
                  {COLS.map((c) => {
                    const cell = row.cells[c.key];
                    return (
                      <td
                        key={c.key}
                        className={cn(
                          "p-3.5 lg:p-4 border-s border-border/50 text-center",
                          c.tone === "brand" && "bg-primary/5"
                        )}
                      >
                        <ComparisonValue cell={cell} brand={c.tone === "brand"} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

function CellIcon({ v, brand }: { v: Cell["v"]; brand?: boolean }) {
  if (v === "yes") {
    return (
      <span
        className={cn(
          "size-6 rounded-full grid place-items-center",
          brand ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    );
  }
  if (v === "no") {
    return (
      <span className="size-6 rounded-full bg-rose-500/10 grid place-items-center text-rose-500">
        <X className="size-3.5" strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span className="size-6 rounded-full bg-brand/10 grid place-items-center text-brand">
      <Minus className="size-3.5" strokeWidth={2.5} />
    </span>
  );
}
