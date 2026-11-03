"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime errors to an error reporting service
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6 shadow-xs">
        <AlertCircle className="size-7" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-destructive">
          Application Error
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred while rendering this page. Our team has been notified.
        </p>
        {error.message && (
          <div className="mt-3 p-3 rounded-lg bg-muted text-[11px] font-mono text-muted-foreground text-left overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          size="sm"
          className="gap-2 h-9 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="size-4" />
          <span>Try Again</span>
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold">
            <Home className="size-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

