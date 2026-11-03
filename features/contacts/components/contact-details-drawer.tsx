"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contact } from "@/types/contact";
import {
  useContactActivitiesQuery,
  useContactNotesQuery,
  useAddContactNoteMutation,
  useAssignContactTagMutation,
  useRemoveContactTagMutation,
  useArchiveContactMutation,
  useRestoreContactMutation,
} from "../hooks";
import {
  Phone,
  Mail,
  Building,
  Tag,
  Plus,
  X,
  MessageSquare,
  Clock,
  Archive,
  RotateCcw,
  Send,
  Loader2,
  Calendar,
  Share2,
} from "lucide-react";

interface ContactDetailsDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contact: Contact) => void;
}

export function ContactDetailsDrawer({
  contact,
  isOpen,
  onClose,
  onEdit,
}: ContactDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "notes">("overview");
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  const contactId = contact?.id ?? "";

  const { data: activities = [], isLoading: loadingActivities } =
    useContactActivitiesQuery(isOpen && contact ? contactId : null);
  const { data: notes = [], isLoading: loadingNotes } =
    useContactNotesQuery(isOpen && contact ? contactId : null);

  const addNoteMutation = useAddContactNoteMutation(contactId);
  const assignTagMutation = useAssignContactTagMutation(contactId);
  const removeTagMutation = useRemoveContactTagMutation(contactId);
  const archiveMutation = useArchiveContactMutation();
  const restoreMutation = useRestoreContactMutation();

  if (!contact) return null;

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    await assignTagMutation.mutateAsync({ id: contact.id, tag: newTag.trim() });
    setNewTag("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tag: string) => {
    await removeTagMutation.mutateAsync({ id: contact.id, tag });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    await addNoteMutation.mutateAsync(noteContent.trim());
    setNoteContent("");
  };

  const isArchived = contact.status === "archived";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border"
      >
        <SheetHeader className="p-5 border-b border-border/80 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border border-border/60">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {contact.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  {contact.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  {contact.phone}
                </SheetDescription>
              </div>
            </div>

            <Badge
              variant={isArchived ? "secondary" : "default"}
              className="text-[10px] font-semibold uppercase tracking-wider"
            >
              {contact.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <Link
              href={`/chats`}
              className={buttonVariants({
                variant: "default",
                size: "sm",
                className: "flex-1 h-8 text-xs gap-1.5 font-medium",
              })}
            >
              <MessageSquare className="size-3.5" />
              <span>Open Chat</span>
            </Link>

            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => {
                  onEdit(contact);
                }}
              >
                Edit
              </Button>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-muted-foreground gap-1"
                disabled={restoreMutation.isPending}
                onClick={async () => {
                  await restoreMutation.mutateAsync(contact.id);
                  onClose();
                }}
              >
                <RotateCcw className="size-3.5" />
                <span>Restore</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                disabled={archiveMutation.isPending}
                onClick={async () => {
                  await archiveMutation.mutateAsync(contact.id);
                  onClose();
                }}
              >
                <Archive className="size-3.5" />
                <span>Archive</span>
              </Button>
            )}
          </div>

          {/* Internal Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-border/60 pt-3 -mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "timeline"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "notes"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Notes ({notes.length})
            </button>
          </div>
        </SheetHeader>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Profile Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Phone className="size-4 text-primary" />
                    <span className="font-mono text-foreground font-medium">
                      {contact.phone}
                    </span>
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="size-4 text-primary" />
                      <span className="text-foreground">{contact.email}</span>
                    </div>
                  )}
                  {contact.company && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Building className="size-4 text-primary" />
                      <span className="text-foreground">{contact.company}</span>
                    </div>
                  )}
                  {contact.source && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Share2 className="size-4 text-primary" />
                      <span className="text-foreground">Source: {contact.source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="size-4 text-primary" />
                    <span>Added {new Date(contact.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5" />
                    Audience Tags
                  </h4>
                  {!isAddingTag && (
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(true)}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="size-3" />
                      Add Tag
                    </button>
                  )}
                </div>

                {isAddingTag && (
                  <form onSubmit={handleAddTag} className="flex items-center gap-1.5 pt-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. VIP Customer"
                      className="h-7 text-xs flex-1"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="h-7 px-2.5 text-[11px]"
                      disabled={assignTagMutation.isPending}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setIsAddingTag(false)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </form>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {(contact.tags || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No tags assigned</p>
                  ) : (
                    contact.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] py-0.5 px-2 font-medium flex items-center gap-1 group"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="opacity-60 hover:opacity-100 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Custom Attributes */}
              {contact.custom_attributes &&
                Object.keys(contact.custom_attributes).length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Custom Attributes
                    </h4>
                    <div className="rounded-lg border border-border/80 bg-muted/20 divide-y divide-border/60 text-xs">
                      {Object.entries(contact.custom_attributes).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2.5 px-3"
                        >
                          <span className="font-semibold text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-foreground font-medium">
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Activity History
              </h4>
              {loadingActivities ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-md" />
                  <Skeleton className="h-14 w-full rounded-md" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No activity records logged for this contact yet.
                </p>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      <div className="absolute -left-[19px] top-1 size-2 rounded-full bg-primary" />
                      <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 space-y-1">
                        <p className="text-xs font-semibold text-foreground">
                          {act.description}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>By {act.actor_name}</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="size-3" />
                            {new Date(act.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record an internal note, customer preference, or call summary..."
                  className="text-xs min-h-[70px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    disabled={!noteContent.trim() || addNoteMutation.isPending}
                  >
                    {addNoteMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Send className="size-3" />
                    )}
                    <span>Save Note</span>
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2.5 pt-2">
                {loadingNotes ? (
                  <Skeleton className="h-16 w-full rounded-md" />
                ) : notes.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No internal notes yet. Use the box above to write the first note.
                  </p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg border border-border/80 bg-muted/10 p-3 space-y-1.5"
                    >
                      <p className="text-xs text-foreground whitespace-pre-wrap">{n.note}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <span className="font-semibold text-foreground/80">
                          {n.author_name}
                        </span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

