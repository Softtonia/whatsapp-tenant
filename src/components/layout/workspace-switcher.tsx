"use client";

import { useState } from "react";
import { useActiveTenant, useAvailableTenants } from "@/lib/tenant/hooks";
import { useWorkspacesQuery, useSwitchWorkspaceMutation } from "@/features/auth/hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { Building2, Check, ChevronsUpDown, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Tenant } from "@/types/tenant";

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

export function WorkspaceSwitcher({ isCollapsed = false }: WorkspaceSwitcherProps) {
  const { activeTenant } = useActiveTenant();
  const availableTenants = useAvailableTenants();
  const isTenantLoading = useTenantStore((s) => s.isLoading);
  const [isOpen, setIsOpen] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Sync authorized workspaces from server state
  useWorkspacesQuery();
  const switchWorkspaceMutation = useSwitchWorkspaceMutation();

  const handleSelectWorkspace = async (tenant: Tenant) => {
    if (activeTenant?.id === tenant.id) {
      setIsOpen(false);
      return;
    }

    setSwitchError(null);
    try {
      await switchWorkspaceMutation.mutateAsync(tenant.id);
      setIsOpen(false);
    } catch {
      setSwitchError("Failed to switch workspace. Please check your permissions.");
    }
  };

  const isSwitching = switchWorkspaceMutation.isPending || isTenantLoading;

  if (isCollapsed) {
    return (
      <div className="relative flex justify-center py-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="size-9 rounded-xl border-border/80 bg-background hover:bg-muted relative"
          title={`Active Workspace: ${activeTenant?.name}`}
          aria-label={`Active Workspace: ${activeTenant?.name}`}
          aria-expanded={isOpen}
        >
          {isSwitching ? (
            <Loader2 className="size-4 animate-spin text-primary" />
          ) : (
            <Building2 className="size-4 text-primary" />
          )}
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-12 top-0 w-64 rounded-xl border border-border bg-card p-1 shadow-lg z-50 text-foreground animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                Workspaces / Branches
              </div>
              {switchError && (
                <div className="p-2 text-[11px] text-destructive bg-destructive/10 rounded m-1">
                  {switchError}
                </div>
              )}
              <div className="py-1 space-y-1">
                {availableTenants.map((t) => {
                  const isSelected = activeTenant?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      disabled={isSwitching}
                      onClick={() => handleSelectWorkspace(t)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-left transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{t.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {t.default_phone_number || `ID: ${t.id}`}
                        </span>
                      </div>
                      {isSelected && <Check className="size-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full text-left">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="w-full flex items-center justify-between border-border/80 bg-card hover:bg-muted/80 h-10 px-3 rounded-xl text-xs font-semibold"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {isSwitching ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Building2 className="size-3.5" />
            )}
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="font-bold truncate text-foreground leading-tight">
              {isSwitching ? "Switching workspace..." : (activeTenant?.name || "Select Workspace")}
            </span>
            <span className="text-[10px] text-muted-foreground font-normal truncate">
              {activeTenant?.default_phone_number || `Tenant #${activeTenant?.id}`}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="size-3.5 text-muted-foreground shrink-0 opacity-60 ml-2" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-full rounded-xl border border-border bg-card p-1 shadow-xl z-50 text-foreground animate-in fade-in-0 zoom-in-95">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 flex items-center justify-between">
              <span>Authorized Workspaces</span>
              <span className="text-[9px] lowercase bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
                {availableTenants.length} available
              </span>
            </div>

            {switchError && (
              <div className="p-2 text-[11px] text-destructive bg-destructive/10 rounded m-1">
                {switchError}
              </div>
            )}

            <div className="py-1 space-y-1 max-h-56 overflow-y-auto">
              {availableTenants.map((t) => {
                const isSelected = activeTenant?.id === t.id;
                return (
                  <button
                    key={t.id}
                    disabled={isSwitching}
                    onClick={() => handleSelectWorkspace(t)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{t.name}</span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {t.default_phone_number || `Tenant ID: #${t.id}`}
                      </span>
                    </div>
                    {isSelected && <Check className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border/60 pt-1 mt-1">
              <Link
                href="/organization-setup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                <PlusCircle className="size-3.5" />
                <span>Create New Workspace</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
