import { Zap } from "lucide-react";
import { PageShell, PageHeader, PageContent } from "@/components/app/page-shell";
import { Pricing } from "@/components/sections/pricing";
import { getServerTranslate } from "@/lib/locale/server-t";

export default async function PricingPage() {
  const t = await getServerTranslate();

  return (
    <PageShell>
      <PageHeader title={t("pricing.title")} subtitle={t("pricing.subtitle")} icon={<Zap />} />
      <PageContent>
        <Pricing variant="page" />
      </PageContent>
    </PageShell>
  );
}
