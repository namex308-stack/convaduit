import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { SkipToContent } from "@/components/layout/skip-link";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { LogosStrip } from "@/components/sections/logos-strip";
import { WhyLoseSales } from "@/components/sections/why-lose-sales";
import { ProductPreview } from "@/components/sections/product-preview";
import { Features } from "@/components/sections/features";
import { DecisionEngine } from "@/components/sections/decision-engine";
import { ComparisonTable } from "@/components/sections/comparison-table";
import { Methodology } from "@/components/sections/methodology";
import { SecurityBand } from "@/components/sections/security-band";
import { TrustResources } from "@/components/sections/trust-resources";
import { CTA } from "@/components/sections/cta";
import { ScrollProgress } from "@/components/common/scroll-progress";
import { Skeleton } from "@/components/ui/skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { publicPageMetadata } from "@/lib/seo/page-metadata";
import { buildHomeJsonLdGraph } from "@/lib/seo/structured-data";
import {
  SITE_DEFAULT_TITLE,
  SITE_DESCRIPTION,
} from "@/lib/seo/site-copy";
import { ROUTES } from "@/lib/routes";

const homeMeta = publicPageMetadata({
  title: SITE_DEFAULT_TITLE,
  description: SITE_DESCRIPTION,
  path: ROUTES.home,
});

export const metadata: Metadata = {
  ...homeMeta,
  // Composed `%s · ConvAudit` would repeat the brand; keep the ≤60 SERP title.
  title: { absolute: SITE_DEFAULT_TITLE },
};

function SectionSkeleton() {
  return (
    <div className="py-20 sm:py-24" aria-hidden>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-10 w-2/3 max-w-xl rounded-lg" />
        <Skeleton className="h-6 w-1/2 max-w-md rounded-lg" />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

const ConceptExplainer = dynamic(
  () => import("@/components/sections/concept-explainer").then((m) => ({ default: m.ConceptExplainer })),
  { loading: () => <SectionSkeleton /> }
);
const Pricing = dynamic(
  () => import("@/components/sections/pricing").then((m) => ({ default: m.Pricing })),
  { loading: () => <SectionSkeleton /> }
);
const FAQ = dynamic(
  () => import("@/components/sections/faq").then((m) => ({ default: m.FAQ })),
  { loading: () => <SectionSkeleton /> }
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <JsonLd data={buildHomeJsonLdGraph()} />
      <SkipToContent />
      <ScrollProgress />
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col pt-16">
        <Hero />
        <LogosStrip />
        <WhyLoseSales />
        <ConceptExplainer />
        <ProductPreview />
        <Features />
        <DecisionEngine />
        <ComparisonTable />
        <Methodology />
        <SecurityBand />
        <TrustResources />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
