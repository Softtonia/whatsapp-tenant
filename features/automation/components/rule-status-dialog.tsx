"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import type { AutomationRule } from "@/types/automation";

interface RuleStatusDialogProps {
  rule: AutomationRule | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function RuleStatusDialog({
  rule,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: RuleStatusDialogProps) {
  if (!rule) return null;

  const willActivate = !rule.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                willActivate
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {willActivate ? (
                <Zap className="size-5" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {willActivate ? "Activate Automation Rule?" : "Pause Automation Rule?"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                {rule.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3 text-xs">
          {willActivate ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-amber-700 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" />
                Live Messaging Impact Warning
              </p>
              <p className="leading-relaxed">
                Activating this rule will immediately start evaluating all incoming
                WhatsApp events for trigger: <strong>{rule.trigger_type}</strong>.
                Matched contacts will receive automated messages or reassignment.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-muted/40 border border-border/70 rounded-xl text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Safe to pause</p>
              <p className="leading-relaxed">
                Automated messages and tag triggers will be suspended for this rule.
                Existing conversations and human agents will remain unaffected.
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
            <span className="font-semibold text-foreground block">
              Rule Actions ({rule.actions.length}):
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              {rule.actions.map((act, i) => (
                <li key={i} className="font-mono text-[11px]">
                  {act.type}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
            variant={willActivate ? "default" : "secondary"}
            className="font-semibold text-xs"
          >
            {isPending
              ? "Updating..."
              : willActivate
              ? "Confirm & Activate Rule"
              : "Pause Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
