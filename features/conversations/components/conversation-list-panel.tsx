"use client";

import { useState, useMemo } from "react";
import { useConversationsQuery } from "../hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatters";
import {
  Search,
  SlidersHorizontal,
  UserCheck,
  FileText,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  X,
  RefreshCw,
} from "lucide-react";
import type { Conversation } from "@/types/whatsapp";

interface ConversationListPanelProps {
  selectedId: string | number | null;
  onSelectConversation: (id: string | number) => void;
}

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
];

export function ConversationListPanel({
  selectedId,
  onSelectConversation,
}: ConversationListPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const queryParams = useMemo(() => {
    return {
      status: statusFilter !== "all" ? statusFilter : undefined,
      unread_only: unreadOnly || undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      search: searchTerm.trim() || undefined,
    };
  }, [statusFilter, unreadOnly, priorityFilter, searchTerm]);

  const { data: conversations = [], isLoading, isError, refetch, isFetching } =
    useConversationsQuery(queryParams);

  // Filter client-side as well for snappy UX
  const filteredConversations = useMemo(() => {
    return conversations.filter((c: Conversation) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (unreadOnly && c.unread_count === 0) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.contact_name?.toLowerCase().includes(query);
        const matchesPhone = c.contact_phone?.includes(query);
        const matchesPreview = c.last_message_preview?.toLowerCase().includes(query);
        return matchesName || matchesPhone || matchesPreview;
      }
      return true;
    });
  }, [conversations, statusFilter, unreadOnly, priorityFilter, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/80 min-w-0">
      {/* Header & Search */}
      <div className="p-3.5 border-b border-border/80 space-y-2.5 shrink-0 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Conversations</h2>
            <Badge variant="secondary" className="text-[10px] font-mono py-0 px-1.5 font-bold">
              {filteredConversations.length}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground"
            title="Refresh conversations list"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search name, phone, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-7 h-8 text-xs bg-muted/30 border-border/70 rounded-lg focus-visible:ring-1"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg text-xs">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-semibold transition-all capitalize ${
                  isActive
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Priority & Unread Toggle */}
        <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-muted-foreground hover:text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              unreadOnly
                ? "bg-primary text-primary-foreground font-bold"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread only
          </button>
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-xl">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
            <p>Failed to load conversations.</p>
            <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1">
              <RefreshCw className="size-3" />
              Retry
            </Button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
            <MessageSquare className="size-6 text-muted-foreground/40 mx-auto" />
            <p className="font-semibold text-foreground">No conversations match</p>
            <p className="text-[11px]">
              Try adjusting your search query or status filter to see other customer threads.
            </p>
          </div>
        ) : (
          filteredConversations.map((conv: Conversation) => {
            const isSelected = String(conv.id) === String(selectedId);
            const initials = conv.contact_name
              ? conv.contact_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "WA";

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3 p-3 text-left transition-all relative ${
                  isSelected
                    ? "bg-primary/10 border-l-3 border-primary"
                    : "hover:bg-muted/40"
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                    {initials}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-xs truncate ${conv.unread_count > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                      {conv.contact_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {formatRelativeTime(conv.last_message_at || conv.created_at)}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    {conv.last_message_preview?.startsWith("[Photo]") ? (
                      <ImageIcon className="size-3 text-primary shrink-0" />
                    ) : conv.last_message_preview?.startsWith("[Document]") ? (
                      <FileText className="size-3 text-primary shrink-0" />
                    ) : conv.last_message_preview?.startsWith("[Internal") ? (
                      <Lock className="size-3 text-amber-500 shrink-0" />
                    ) : null}
                    <span className={`truncate ${conv.unread_count > 0 ? "font-semibold text-foreground" : ""}`}>
                      {conv.last_message_preview || "WhatsApp message"}
                    </span>
                  </div>

                  {/* Metadata Row: Badges, Agent, Priority */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {conv.status !== "open" && (
                      <span className="text-[9px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        {conv.status}
                      </span>
                    )}

                    {conv.priority === "urgent" && (
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.2 rounded border border-destructive/20">
                        Urgent
                      </span>
                    )}

                    {conv.priority === "high" && (
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        High
                      </span>
                    )}

                    {conv.assigned_agent_name && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <UserCheck className="size-2.5 text-primary" />
                        <span className="truncate max-w-[80px]">{conv.assigned_agent_name}</span>
                      </span>
                    )}

                    {conv.unread_count > 0 && (
                      <span className="ml-auto flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[9px]">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
