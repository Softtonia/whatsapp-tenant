"use client";

import { useRecentConversationsQuery } from "../hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/formatters";
import { MessageSquare, ArrowRight, UserCheck, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { ConversationStatus } from "@/types/whatsapp";

function getStatusBadge(status: ConversationStatus) {
  switch (status) {
    case "open":
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px] py-0 px-1.5 font-medium">
          Open
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] py-0 px-1.5 font-medium">
          Pending
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[10px] py-0 px-1.5 font-medium">
          Resolved
        </Badge>
      );
    case "snoozed":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] py-0 px-1.5 font-medium">
          Snoozed
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">{status}</Badge>;
  }
}

export function RecentConversationsList() {
  const { data: conversations, isLoading, isError, refetch } = useRecentConversationsQuery(5);

  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/60">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground space-y-2">
          <p>Failed to load recent conversations.</p>
          <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1">
            <RefreshCw className="size-3" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const list = conversations || [];

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-primary" />
          <CardTitle className="text-base font-bold">Recent Conversations</CardTitle>
          <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">
            {list.length}
          </span>
        </div>

        <Link
          href="/chats"
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          View Shared Inbox
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0">
        {list.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-xl space-y-2">
            <MessageSquare className="size-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">No incoming conversations yet</p>
            <p className="text-[11px] text-muted-foreground">
              Customer messages to your connected WhatsApp Business number will display here in real-time.
            </p>
          </div>
        ) : (
          list.map((conv) => {
            const initials = conv.contact_name
              ? conv.contact_name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "WA";

            return (
              <Link
                key={conv.id}
                href={`/chats?conversationId=${conv.id}`}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 hover:border-border hover:bg-muted/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {initials}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {conv.contact_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate hidden sm:inline">
                        {conv.contact_phone}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-md">
                      {conv.last_message_preview || "No message content"}
                    </p>
                  </div>
                </div>

                {/* Status, Time & Badges */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{formatRelativeTime(conv.last_message_at || conv.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(conv.status)}

                      {conv.unread_count > 0 && (
                        <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {conv.assigned_to && (
                    <div
                      className="hidden md:flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
                      title={`Assigned to: ${conv.assigned_to}`}
                    >
                      <UserCheck className="size-3 text-primary" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

