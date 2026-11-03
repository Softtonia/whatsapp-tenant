"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, RefreshCw, XCircle, Send } from "lucide-react";
import type { TeamInvitation } from "@/types/team";
import { useResendInvitationMutation, useRevokeInvitationMutation } from "../hooks";
import { formatDateShort } from "@/lib/formatters";

interface TeamInvitationsTableProps {
  invitations: TeamInvitation[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function TeamInvitationsTable({
  invitations,
  isLoading,
  onRefresh,
}: TeamInvitationsTableProps) {
  const [resendingId, setResendingId] = React.useState<string | number | null>(null);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const resendMutation = useResendInvitationMutation();
  const revokeMutation = useRevokeInvitationMutation();

  const handleResend = async (id: string | number, email: string) => {
    try {
      setResendingId(id);
      await resendMutation.mutateAsync(id);
      setActionFeedback(`Invitation re-sent to ${email}`);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setResendingId(null);
    }
  };

  const handleRevoke = async (id: string | number, email: string) => {
    if (confirm(`Revoke invitation for ${email}?`)) {
      await revokeMutation.mutateAsync(id);
      setActionFeedback(`Invitation for ${email} has been revoked.`);
      setTimeout(() => setActionFeedback(null), 4000);
      onRefresh?.();
    }
  };

  return (
    <div className="space-y-4">
      {actionFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-600 animate-in fade-in">
          {actionFeedback}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Invitee Email</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Assigned Role</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Invited By</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Sent Date</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Expires</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : invitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="max-w-xs mx-auto space-y-1.5">
                    <Mail className="size-6 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold text-xs text-foreground">No pending invitations</p>
                    <p className="text-[11px] text-muted-foreground">
                      All invited candidates have accepted or invitations have expired.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invitations.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="align-middle py-3">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {inv.email}
                    </span>
                  </TableCell>

                  <TableCell className="align-middle py-3">
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                      {inv.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="align-middle py-3">
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
                    >
                      <Clock className="size-3" />
                      Pending Acceptance
                    </Badge>
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {inv.invited_by_name || inv.invited_by || "Administrator"}
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {formatDateShort(inv.created_at)}
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {inv.expires_at ? formatDateShort(inv.expires_at) : "In 7 days"}
                  </TableCell>

                  <TableCell className="text-right align-middle py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={resendingId === inv.id}
                        onClick={() => handleResend(inv.id, inv.email)}
                        className="h-7 text-[11px] gap-1 font-semibold"
                      >
                        {resendingId === inv.id ? (
                          <RefreshCw className="size-3 animate-spin" />
                        ) : (
                          <Send className="size-3" />
                        )}
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={revokeMutation.isPending}
                        onClick={() => handleRevoke(inv.id, inv.email)}
                        className="h-7 text-[11px] text-muted-foreground hover:text-rose-600 gap-1"
                      >
                        <XCircle className="size-3" />
                        Revoke
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

