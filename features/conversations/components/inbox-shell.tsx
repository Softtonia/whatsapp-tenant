"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useConversationsQuery } from "../hooks";
import { ConversationListPanel } from "./conversation-list-panel";
import { MessageThreadPanel } from "./message-thread-panel";
import { ContactDetailsPanel } from "./contact-details-panel";
import type { Conversation } from "@/types/whatsapp";

function InboxShellContent() {
  const searchParams = useSearchParams();
  const urlConversationId = searchParams.get("conversationId");

  const { data: conversations = [] } = useConversationsQuery();

  const [userSelectedId, setUserSelectedId] = useState<string | number | null>(
    urlConversationId ? Number(urlConversationId) || urlConversationId : null
  );

  // Mobile navigation sequence: "list" | "thread" | "contact"
  const [mobileView, setMobileView] = useState<"list" | "thread" | "contact">(
    urlConversationId ? "thread" : "list"
  );
  const [isDesktopContactPanelOpen, setIsDesktopContactPanelOpen] = useState(true);

  // Derive the active selected ID without synchronous setState inside useEffect
  const selectedId = userSelectedId ?? (conversations[0]?.id ?? null);

  const activeConversation: Conversation | null =
    conversations.find((c) => String(c.id) === String(selectedId)) ||
    conversations[0] ||
    null;

  const handleSelectConversation = (id: string | number) => {
    setUserSelectedId(id);
    setMobileView("thread");
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden flex flex-col min-w-0">
      {/* Desktop Multi-Panel Layout */}
      <div className="hidden lg:flex flex-1 min-h-0 divide-x divide-border/80 overflow-hidden">
        {/* Panel 1: Conversation List */}
        <div className="w-80 xl:w-92 h-full shrink-0 overflow-hidden">
          <ConversationListPanel
            selectedId={selectedId}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Panel 2: Message Thread & Composer */}
        <div className="flex-1 h-full min-w-0 overflow-hidden">
          <MessageThreadPanel
            conversation={activeConversation}
            isContactPanelOpen={isDesktopContactPanelOpen}
            onToggleContactPanel={() => setIsDesktopContactPanelOpen(!isDesktopContactPanelOpen)}
          />
        </div>

        {/* Panel 3: Contact Details */}
        {isDesktopContactPanelOpen && (
          <div className="w-80 xl:w-88 h-full shrink-0 overflow-hidden">
            <ContactDetailsPanel
              conversation={activeConversation}
              onClose={() => setIsDesktopContactPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile & Tablet Navigable Sequence */}
      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
        {mobileView === "list" && (
          <div className="w-full h-full overflow-hidden">
            <ConversationListPanel
              selectedId={selectedId}
              onSelectConversation={handleSelectConversation}
            />
          </div>
        )}

        {mobileView === "thread" && (
          <div className="w-full h-full overflow-hidden">
            <MessageThreadPanel
              conversation={activeConversation}
              onBackToList={() => setMobileView("list")}
              onToggleContactPanel={() => setMobileView("contact")}
              isContactPanelOpen={false}
            />
          </div>
        )}

        {mobileView === "contact" && (
          <div className="w-full h-full overflow-hidden">
            <ContactDetailsPanel
              conversation={activeConversation}
              onClose={() => setMobileView("thread")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function InboxShell() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-7.5rem)] rounded-2xl border border-border/80 bg-card p-8 flex items-center justify-center text-xs text-muted-foreground">
          Loading WhatsApp Shared Inbox...
        </div>
      }
    >
      <InboxShellContent />
    </Suspense>
  );
}
