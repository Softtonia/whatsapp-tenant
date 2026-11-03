"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBulkContactsActionMutation } from "../hooks";
import { Tag, UserCheck, Archive, X, Loader2 } from "lucide-react";

interface BulkActionsToolbarProps {
  selectedIds: (string | number)[];
  onClearSelection: () => void;
}

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [activeModal, setActiveModal] = useState<"tags" | "owner" | "archive" | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [ownerIdInput, setOwnerIdInput] = useState("1");

  const bulkMutation = useBulkContactsActionMutation();

  if (selectedIds.length === 0) return null;

  const handleApplyTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    await bulkMutation.mutateAsync({
      action: "assign_tags",
      contact_ids: selectedIds,
      tags: [tagInput.trim()],
    });
    setTagInput("");
    setActiveModal(null);
    onClearSelection();
  };

  const handleApplyOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    await bulkMutation.mutateAsync({
      action: "assign_owner",
      contact_ids: selectedIds,
      owner_id: Number(ownerIdInput),
    });
    setActiveModal(null);
    onClearSelection();
  };

  const handleApplyArchive = async () => {
    await bulkMutation.mutateAsync({
      action: "archive",
      contact_ids: selectedIds,
    });
    setActiveModal(null);
    onClearSelection();
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 border border-border animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 border-r border-background/20 pr-3">
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
            {selectedIds.length}
          </span>
          <span className="text-xs font-semibold">Selected</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-background hover:bg-background/20 gap-1.5 font-medium"
            onClick={() => setActiveModal("tags")}
          >
            <Tag className="size-3.5" />
            <span>Add Tag</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-background hover:bg-background/20 gap-1.5 font-medium"
            onClick={() => setActiveModal("owner")}
          >
            <UserCheck className="size-3.5" />
            <span>Assign Owner</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-destructive hover:bg-destructive/20 gap-1.5 font-medium"
            onClick={() => setActiveModal("archive")}
          >
            <Archive className="size-3.5" />
            <span>Archive</span>
          </Button>
        </div>

        <button
          type="button"
          onClick={onClearSelection}
          className="text-background/60 hover:text-background transition-colors p-1 rounded-md"
          title="Clear selection"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Bulk Assign Tag Dialog */}
      <Dialog
        open={activeModal === "tags"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Assign Tag to {selectedIds.length} Contacts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a tag to organize or segment all selected contacts at once.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplyTag} className="space-y-4 py-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. VIP Customer, Q4 Webinar"
              className="h-9 text-xs"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!tagInput.trim() || bulkMutation.isPending}
                className="gap-1.5"
              >
                {bulkMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Apply Tag</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Owner Dialog */}
      <Dialog
        open={activeModal === "owner"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Assign Team Member to {selectedIds.length} Contacts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Reassign lead management responsibility for these contacts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplyOwner} className="space-y-4 py-2">
            <select
              value={ownerIdInput}
              onChange={(e) => setOwnerIdInput(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="1">Vijay Kumar (Admin)</option>
              <option value="2">Neha Gupta (Agent)</option>
              <option value="3">Rahul Verma (Agent)</option>
            </select>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={bulkMutation.isPending}
                className="gap-1.5"
              >
                {bulkMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Assign Owner</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Archive Dialog */}
      <Dialog
        open={activeModal === "archive"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-destructive">
              Archive {selectedIds.length} Contacts?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Archived contacts will be excluded from automated campaign broadcasts and active filters.
              You can restore them at any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={bulkMutation.isPending}
              onClick={handleApplyArchive}
              className="gap-1.5"
            >
              {bulkMutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>Archive Contacts</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
