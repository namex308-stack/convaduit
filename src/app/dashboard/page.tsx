import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell, PageContent } from "@/components/app/page-shell";
import { DashboardSkeleton } from "@/components/app/dashboard-skeleton";
import { DashboardPanel } from "@/components/app/dashboard-panel";
import { getAuthUser } from "@/lib/auth/get-user";
import { getDashboardForUser } from "@/lib/db/workspace-stats";
import { ROUTES } from "@/lib/routes";

async function DashboardLoader() {
  const user = await getAuthUser();
  if (!user) redirect(ROUTES.auth);
  const dashboard = await getDashboardForUser(user.id);
  return <DashboardPanel initial={dashboard} />;
}

export default function DashboardPage() {
  return (
    <PageShell>
      <PageContent className="space-y-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardLoader />
        </Suspense>
      </PageContent>
    </PageShell>
  );
}
