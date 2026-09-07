"use client";

import * as React from "react";

function onIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 1500);
  return () => window.clearTimeout(id);
}

export function DeferredToaster() {
  const [Toaster, setToaster] = React.useState<React.ComponentType<{
    position: "top-center";
    richColors: boolean;
    closeButton: boolean;
  }> | null>(null);

  React.useEffect(
    () =>
      onIdle(() => {
        void import("@/components/ui/sonner").then((mod) => {
          setToaster(() => mod.Toaster);
        });
      }),
    []
  );

  if (!Toaster) return null;

  return <Toaster position="top-center" richColors closeButton />;
}
