"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, Info } from "lucide-react";
import { inviteMemberSchema, type InviteMemberFormData } from "../schemas";
import { useInviteMemberMutation } from "../hooks";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <InviteMemberInnerForm
          key={isOpen ? "open" : "closed"}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteMemberInnerForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const inviteMutation = useInviteMemberMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "agent",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: InviteMemberFormData) => {
    try {
      setErrorMessage(null);
      await inviteMutation.mutateAsync(data);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserPlus className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Invite an agent, manager, or auditor to collaborate on your WhatsApp CRM workspace.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Team Member Email *
          </Label>
          <Input
            type="email"
            {...register("email")}
            placeholder="colleague@company.com"
            className="text-xs"
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Assigned Workspace Role *
          </Label>
          <select
            {...register("role")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="agent">Support Agent (Shared Inbox &amp; Chats)</option>
            <option value="admin">Administrator (Full CRM &amp; Campaign Control)</option>
            <option value="viewer">Viewer (Read-Only Analytics &amp; Audits)</option>
          </select>
        </div>

        {/* Role Description Card */}
        <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Shield className="size-3.5 text-primary" />
            <span>Role Permissions Preview</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {selectedRole === "agent" &&
              "Can send/receive WhatsApp messages, claim conversations, add notes, and create leads. Cannot change billing or templates."}
            {selectedRole === "admin" &&
              "Can configure campaigns, approve templates, manage team members, and adjust workspace automation rules."}
            {selectedRole === "viewer" &&
              "Read-only access to conversation history, export reports, and campaign analytics. Cannot send outbound messages."}
          </p>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Info className="size-3.5 shrink-0" />
          <span>An invitation link valid for 7 days will be emailed to the candidate.</span>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={inviteMutation.isPending}
          className="gap-1.5 font-semibold text-xs"
        >
          {inviteMutation.isPending ? "Sending Invitation..." : "Send Invitation"}
        </Button>
      </DialogFooter>
    </form>
  );
}

