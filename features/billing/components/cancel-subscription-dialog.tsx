"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useCancelSubscriptionMutation } from "../hooks";

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelSubscriptionDialog({
  isOpen,
  onClose,
  onSuccess,
}: CancelSubscriptionDialogProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <CancelInnerForm
          key={isOpen ? "open" : "closed"}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function CancelInnerForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const cancelMutation = useCancelSubscriptionMutation();

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setErrorMessage("Please enter a brief cancellation reason.");
      return;
    }
    try {
      setErrorMessage(null);
      await cancelMutation.mutateAsync({
        at_period_end: true,
        reason: reason.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to cancel subscription"
      );
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Cancel Workspace Subscription?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Your access will remain active until the end of your current billing period.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-xs text-rose-600 dark:text-rose-400">
        <p className="font-semibold">Cancellation Impact:</p>
        <ul className="list-disc pl-4 space-y-1 leading-relaxed">
          <li>Automated WhatsApp campaigns and broadcast delivery will pause.</li>
          <li>AI Assistant replies will be disabled.</li>
          <li>Workspace will switch to read-only mode after the current cycle ends.</li>
        </ul>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">
          Why are you cancelling? *
        </Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Help us improve: what could we have done better?"
          className="text-xs leading-relaxed"
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={cancelMutation.isPending}
        >
          Keep Subscription
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={handleConfirm}
          disabled={cancelMutation.isPending || !reason.trim()}
          className="font-semibold text-xs"
        >
          {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
        </Button>
      </DialogFooter>
    </div>
  );
}

