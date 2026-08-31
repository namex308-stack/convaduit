# Landing page UI report

ConvAudit’s marketing homepage was elevated to a cleaner premium SaaS presentation without changing brand identity, core copy, URLs, SEO/JSON-LD, pricing, backend, or product behavior.

## Improved sections

Section order is now a conversion-oriented narrative. Existing sections were kept; none were deleted.

| Order | Section | Role |
| --- | --- | --- |
| 1 | Hero | Value + ConvAudit name + real product visual + primary/secondary CTAs |
| 2 | Platforms (`#platforms`) | Honest trust: supported platforms, not fake clients |
| 3 | Why stores lose sales | Problem |
| 4 | How it works (`#how`) | Solution |
| 5 | Product preview | Proof (real app screenshots) |
| 6 | Features | What the report covers |
| 7 | Decision engine | How findings are prioritized |
| 8 | Comparison | Proof vs DIY / agency |
| 9 | Methodology | How scoring works |
| 10 | Security | Trust |
| 11 | Resources | Trust / documentation |
| 12 | Pricing | Plans (unchanged) |
| 13 | FAQ | Objections |
| 14 | Final CTA | Close |

Trust now sits before pricing. Primary CTAs appear only at logical points: hero, how-it-works (compact), product preview, pricing, FAQ, and the closing band. Mid-funnel CTAs were removed from the problem, features, and decision sections (copy keys kept).

## Reused components

No new UI library was added. Work stayed on the existing design system:

- `Container`, `Section`, `SectionHeader`, `SurfaceCard` — shared layout, type scale, and card language
- New helpers in the **same** design-system file (not duplicate page components): `IconWell`, `AppFrame`
- Existing `Button`, `StartAuditCta`, `Logo`, `Marquee`, `Accordion`
- Real product images already in `/public/product/` (`audit-new.png`, `dashboard.png`)
- Concept explainer, pricing, FAQ remain the existing components with visual/a11y polish

`HowItWorks` and `PainPoints` were left unused; they were not reintroduced.

## UI changes

### Hero

- ConvAudit stays in the visible H1; headline/subheadline/CTA strings were not rewritten.
- Two-line visual hierarchy: brand/problem line, then the orange solution line.
- Split layout from `lg`: copy + CTAs beside a real product screenshot (start-audit screen), not a fake scored mockup.
- Trust chips use existing honest signals only (no card, transparent method, supported platforms).
- Pillar chips label conversion / SEO / GEO / trust without invented numbers.
- GEO honesty note and “no sample scores” disclaimer remain visible.

### Navbar

- Same destinations: Product, How it works, Methodology, Security, Pricing.
- Primary “start free audit” CTA is now visible on the homepage (desktop) as well as other marketing pages.
- Mobile menu: overlay, scroll lock, focus move to first item, Tab cycle, Escape to close, `inert` + `aria-hidden` when closed, `aria-controls`.
- Skip-to-content link → `#main-content`.
- Theme control reserves space before mount to reduce layout shift.

### Cards and type

- Shared radius (`rounded-xl`), border, padding, shadow, and hover on `SurfaceCard`.
- Icon wells aligned across problem, features, decision, methodology, security, and trust cards.
- Section titles stepped down slightly (`text-2xl` → `lg:text-4xl`) so long Arabic copy reads as technical, not poster-sized.
- Body copy uses `text-sm sm:text-base` to reduce visual weight without dropping information.

### Other

- Platforms: static row when `prefers-reduced-motion`; marquee only when motion is allowed.
- Comparison uses a semantic `<table>` with horizontal scroll on small screens (page itself does not overflow).
- Closing CTA dropped the shine/dot ornaments; one elevated card + one CTA.
- Pricing cards match the same radius/border language; plan prices and checkout logic were not changed.

## Responsiveness

Checked in the in-IDE browser (RTL):

| Width | Result |
| --- | --- |
| **375px** | No page horizontal overflow. H1 centered. Hero CTAs in the first viewport (~498px). Hamburger usable. Comparison table scrolls internally (`min-width` 40rem) while `document` overflow stays 0. No heading clipping. |
| **768px** | Stacked hero (`lg` split starts at 1024). `sm` CTA row and 4-up pillar chips. Card grids go 2 columns where defined. |
| **1024px+** | Split hero, desktop nav, homepage CTA in the header. Hero height ~717px so the product frame shares the first screen. |
| **1440px** | Same split; no overflow. |

Not observed: page-level horizontal scroll, overlapping sections, broken card grids, or an unusable mobile nav.

`html, body { overflow-x: clip }` is a last-line guard; the comparison table is the only wide element and is contained.

## Accessibility

- Skip link, `main#main-content` on home and marketing shell.
- Nav: `aria-expanded`, `aria-controls`, overlay close label, focus trap, Escape, `inert` when closed.
- Buttons vs links: CTAs remain real `Link`s (`StartAuditCta` / hero `Button asChild`).
- Concept steps: `type="button"`, `aria-pressed`, `aria-controls`, `aria-live="polite"` on the visual panel.
- Comparison: `<table>`, `scope="col"` / `scope="row"`, caption.
- Focus rings on nav, trust resource cards, pricing interval, and concept steps.
- `prefers-reduced-motion`: CSS animation utilities off; marquee replaced by a static list; concept autoplay stops; pricing enter animation skipped; scroll-progress hidden.
- Contrast kept on existing primary orange / muted text tokens; no new gray-on-gray treatments.

## Performance

- Hero stays a Server Component; LCP is `next/image` with `priority` on a ~57KB PNG.
- Removed hero `DotPattern` + shiny text, CTA `ShineBorder` + `DotPattern`, and concept `FloatingOrbs` (less client paint / gradient work).
- No new animation libraries. Framer Motion only where it already existed (concept, pricing), gated with `useReducedMotion`.
- Pricing / FAQ / concept remain dynamically imported on the home page.
- Section spacing uses CSS only; no extra client wrappers for reveal-on-scroll.

## Tests / build

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass — 93 files, 538 tests |
| `npm run build` | Pass (Next.js 16.3.1 / Turbopack) |

Metadata, JSON-LD (`buildHomeJsonLdGraph`), sitemap, and heading-alignment tests were not changed. Homepage H1 still starts with `ConvAudit` and the existing Arabic value line.

## Out of scope (intentionally not done)

- Backend, APIs, Supabase, billing amounts, plan features
- SEO titles, descriptions, robots, JSON-LD
- Core copy rewrite or new URLs
- Fabricated logos, certificates, customer counts, or sample scores
- Copying Linear / Vercel / Stripe layout chrome (orange ConvAudit identity kept)
