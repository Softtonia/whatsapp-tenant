"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace Route Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/[0.03] text-foreground max-w-2xl mx-auto my-12">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="size-6" />
      </div>

      <h3 className="text-base font-bold text-foreground">
        Failed to load workspace module
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-md leading-relaxed">
        An error occurred while loading this section of the WhatsApp CRM. You can retry the request or navigate to another view.
      </p>

      {error.message && (
        <div className="mt-3 p-3 rounded-lg bg-card border border-border text-[11px] font-mono text-muted-foreground max-w-lg overflow-x-auto text-left">
          {error.message}
        </div>
      )}

      <Button
        onClick={() => reset()}
        size="sm"
        className="mt-6 gap-2 text-xs font-semibold shadow-xs"
      >
        <RefreshCw className="size-3.5" />
        <span>Reload Module</span>
      </Button>
    </div>
  );
}

