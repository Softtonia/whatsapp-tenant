"use client";

import { useState } from "react";
import {
  useAddContactTagMutation,
  useRemoveContactTagMutation,
  useAddInternalNoteMutation,
} from "../hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Mail,
  Tag,
  Plus,
  X,
  Lock,
  Send,
  Building,
  Briefcase,
  Calendar,
} from "lucide-react";
import type { Conversation } from "@/types/whatsapp";
import type { Contact } from "@/types/contact";

interface ContactDetailsPanelProps {
  conversation: Conversation | null;
  onClose?: () => void;
}

export function ContactDetailsPanel({
  conversation,
  onClose,
}: ContactDetailsPanelProps) {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newNote, setNewNote] = useState("");

  const conversationId = conversation?.id;
  const contactId = conversation?.contact_id || conversation?.contact?.id || 101;

  const addTagMutation = useAddContactTagMutation(conversationId);
  const removeTagMutation = useRemoveContactTagMutation(conversationId);
  const addNoteMutation = useAddInternalNoteMutation(conversationId);

  if (!conversation) {
    return (
      <div className="w-80 h-full bg-card border-l border-border/80 p-6 flex flex-col items-center justify-center text-xs text-muted-foreground text-center">
        <User className="size-8 text-muted-foreground/30 mb-2" />
        <p>No active conversation selected.</p>
      </div>
    );
  }

  const contact: Contact = conversation.contact || {
    id: contactId,
    name: conversation.contact_name,
    phone: conversation.contact_phone,
    email: "contact@customer.com",
    status: "active",
    tags: conversation.tags || ["Enterprise", "High Value"],
    created_at: "2026-10-15T10:00:00.000Z",
    custom_attributes: {},
  };

  const tags = contact.tags || conversation.tags || [];

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    await addTagMutation.mutateAsync({ contactId, tag: newTag.trim() });
    setNewTag("");
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    await removeTagMutation.mutateAsync({ contactId, tag: tagToRemove });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await addNoteMutation.mutateAsync(newNote.trim());
    setNewNote("");
  };

  const initials = conversation.contact_name
    ? conversation.contact_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "WA";

  return (
    <div className="w-full md:w-80 xl:w-88 h-full bg-card border-l border-border/80 flex flex-col min-w-0 overflow-y-auto">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-border/80 flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-foreground">Contact & Details</span>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Contact Profile Header */}
        <div className="text-center space-y-2 pb-4 border-b border-border/60">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg shadow-xs ring-4 ring-primary/5">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{conversation.contact_name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{conversation.contact_phone}</p>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 py-0">
              Verified WhatsApp
            </Badge>
          </div>
        </div>

        {/* Contact Info Items */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5" />
              Phone
            </span>
            <span className="font-mono text-foreground font-medium">{conversation.contact_phone}</span>
          </div>

          {contact.email && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="size-3.5" />
                Email
              </span>
              <span className="text-foreground truncate max-w-[150px]">{contact.email}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Customer Since
            </span>
            <span className="text-foreground">
              {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "Oct 2026"}
            </span>
          </div>
        </div>

        {/* Contact Tags */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-primary" />
              Contact Tags
            </span>
            {!isAddingTag && (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
              >
                <Plus className="size-3" />
                Add Tag
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] py-0 px-2 font-medium flex items-center gap-1 group"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-60 hover:opacity-100 hover:text-destructive"
                  title={`Remove ${tag}`}
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>

          {isAddingTag && (
            <form onSubmit={handleAddTag} className="flex items-center gap-1.5 pt-1">
              <Input
                placeholder="Tag name..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="h-7 text-xs"
                autoFocus
              />
              <Button type="submit" size="xs" className="h-7 px-2">
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsAddingTag(false)}
                className="h-7 px-1.5"
              >
                <X className="size-3" />
              </Button>
            </form>
          )}
        </div>

        {/* Conversation Metadata */}
        <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-primary" />
            Conversation Details
          </span>

          <div className="rounded-xl border border-border/70 p-3 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Conversation ID</span>
              <span className="font-mono text-foreground font-semibold">#{conversation.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Lifecycle Status</span>
              <span className="capitalize font-semibold text-primary text-[11px]">{conversation.status}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Assigned Specialist</span>
              <span className="text-foreground text-[11px] font-medium">
                {conversation.assigned_agent_name || "Unassigned"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Priority</span>
              <span className="capitalize font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                {conversation.priority || "Normal"}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Attributes (if present) */}
        {contact.custom_attributes && Object.keys(contact.custom_attributes).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building className="size-3.5 text-primary" />
              CRM Custom Fields
            </span>
            <div className="space-y-1.5 text-[11px]">
              {Object.entries(contact.custom_attributes).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span>
                  <span className="font-semibold text-foreground">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Internal Note */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lock className="size-3.5 text-amber-500" />
            Add Internal Note
          </span>
          <form onSubmit={handleAddNote} className="space-y-1.5">
            <Input
              placeholder="Private note for team..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="text-xs h-8 bg-amber-500/5 border-amber-500/25"
            />
            <Button
              type="submit"
              size="xs"
              disabled={!newNote.trim() || addNoteMutation.isPending}
              className="w-full h-7 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] gap-1"
            >
              <Send className="size-3" />
              <span>Record Note</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
