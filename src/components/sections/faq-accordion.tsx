"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion({
  items,
}: {
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-[var(--shadow-card)]"
    >
      {items.map((item, i) => (
        <AccordionItem
          key={item.question}
          value={`item-${i}`}
          className="border-border/50 px-5 last:border-b-0"
        >
          <AccordionTrigger className="text-start font-display font-semibold text-sm sm:text-base hover:no-underline py-5 hover:text-primary transition-colors">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
