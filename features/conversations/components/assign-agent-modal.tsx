"use client";

import { useState } from "react";
import { useTeamMembersQuery, useAssignConversationMutation } from "../hooks";
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
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Check, UserPlus } from "lucide-react";
import type { TeamMember } from "@/types/whatsapp";

interface AssignAgentModalProps {
  conversationId: string | number;
  currentAssignedId?: string | number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignAgentModal({
  conversationId,
  currentAssignedId,
  isOpen,
  onClose,
}: AssignAgentModalProps) {
  const { data: members = [], isLoading } = useTeamMembersQuery();
  const assignMutation = useAssignConversationMutation(conversationId);
  const [selectedAgentId, setSelectedAgentId] = useState<string | number>(
    currentAssignedId || (members[0]?.id ?? 1)
  );
  const [notes, setNotes] = useState("");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    await assignMutation.mutateAsync({
      assigned_to: selectedAgentId,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Assign Conversation</DialogTitle>
              <DialogDescription className="text-xs">
                Route customer thread to an inbox agent or team specialist.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Select Inbox Agent
            </label>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((member: TeamMember) => {
                  const isSelected = String(member.id) === String(selectedAgentId);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => setSelectedAgentId(member.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground font-semibold"
                          : "border-border/80 hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">
                            {member.role} • {member.availability || "online"}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="size-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Handover Note (Optional)
            </label>
            <Input
              placeholder="e.g. Needs pricing quotation or VIP onboarding assistance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-9"
              disabled={assignMutation.isPending}
            />
          </div>

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={assignMutation.isPending}
              className="gap-1.5 font-semibold"
            >
              <UserPlus className="size-3.5" />
              <span>{assignMutation.isPending ? "Assigning..." : "Assign Conversation"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

