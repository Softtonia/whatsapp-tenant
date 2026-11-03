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
import { AlertTriangle, UserX, UserCheck } from "lucide-react";
import type { TeamMember } from "@/types/team";

interface MemberDeactivateDialogProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function MemberDeactivateDialog({
  member,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: MemberDeactivateDialogProps) {
  if (!member) return null;

  const isDeactivating = member.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDeactivating
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isDeactivating ? (
                <UserX className="size-5" />
              ) : (
                <UserCheck className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                {isDeactivating ? "Deactivate Workspace Member?" : "Reactivate Workspace Member?"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {member.name} ({member.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 space-y-3 text-xs">
          {isDeactivating ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2 text-rose-600 dark:text-rose-400">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" />
                Access Revocation Warning
              </p>
              <p className="leading-relaxed">
                Deactivating this member will immediately terminate active sessions, block WhatsApp inbox access, and prevent outbound messaging.
              </p>
              {member.assigned_conversations_count ? (
                <p className="font-semibold text-[11px] pt-1">
                  Note: This user currently has {member.assigned_conversations_count} assigned open conversations that will need reassignment.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300 space-y-1">
              <p className="font-semibold">Restore Workspace Access</p>
              <p className="leading-relaxed">
                Reactivating will restore login access for this account with role: <strong>{member.role}</strong>.
              </p>
            </div>
          )}
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
            variant={isDeactivating ? "destructive" : "default"}
            className="font-semibold text-xs"
          >
            {isPending
              ? "Updating..."
              : isDeactivating
              ? "Confirm Deactivation"
              : "Reactivate Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

