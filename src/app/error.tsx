"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home as HomeIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 500 Error boundary.
 *
 * Catches unexpected runtime errors and shows a friendly error page
 * instead of the default Next.js stack trace. Includes:
 *  - Error message (in production) or details (in development)
 *  - "Try again" button (calls reset() to re-render the route)
 *  - "Back to home" link
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console — in production this would go to an error tracking service.
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center sm:px-6 lg:px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <p className="mt-6 text-5xl font-bold tracking-tight text-muted-foreground/30 sm:text-6xl">
        500
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again,
        or return to the home page.
      </p>

      {/* Show error digest in production, full message in development */}
      {process.env.NODE_ENV === "development" && (
        <pre className="mt-6 max-w-full overflow-x-auto rounded-lg border bg-muted/30 p-3 text-left text-xs text-muted-foreground">
          {error.message}
          {error.digest && `\n\nDigest: ${error.digest}`}
        </pre>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <HomeIcon className="mr-1.5 h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}
