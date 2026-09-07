"use client";

import * as React from "react";

function onIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 2000);
  return () => window.clearTimeout(id);
}

/** Analytics after first paint + idle so gtag / Vercel scripts cannot contend with LCP. */
export function DeferredThirdParties() {
  const [nodes, setNodes] = React.useState<React.ReactNode>(null);

  React.useEffect(
    () =>
      onIdle(() => {
        void Promise.all([
          import("@vercel/analytics/next"),
          import("@vercel/speed-insights/next"),
          import("@/components/analytics/deferred-google-analytics"),
        ]).then(([analytics, speed, ga]) => {
          const Analytics = analytics.Analytics;
          const SpeedInsights = speed.SpeedInsights;
          const DeferredGoogleAnalytics = ga.DeferredGoogleAnalytics;
          setNodes(
            <>
              <Analytics />
              <SpeedInsights />
              <DeferredGoogleAnalytics />
            </>
          );
        });
      }),
    []
  );

  return nodes;
}
