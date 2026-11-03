"use client";

import { useState, useRef, useEffect } from "react";
import {
  useConversationMessagesQuery,
  useSendMessageMutation,
  useAddInternalNoteMutation,
  useResolveConversationMutation,
  useReopenConversationMutation,
} from "../hooks";
import { TemplateSelectorModal } from "./template-selector-modal";
import { AssignAgentModal } from "./assign-agent-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  FileText,
  Paperclip,
  Check,
  CheckCheck,
  Clock,
  Lock,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  PanelRight,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import type { Conversation, Message } from "@/types/whatsapp";

interface MessageThreadPanelProps {
  conversation: Conversation | null;
  onBackToList?: () => void;
  onToggleContactPanel?: () => void;
  isContactPanelOpen?: boolean;
}

function getWhatsAppWindowStatus(conversation: Conversation | null): {
  isOpen: boolean;
  hoursLeft: number;
  label: string;
} {
  if (!conversation?.last_inbound_at) {
    return { isOpen: true, hoursLeft: 24, label: "Customer Window Active" };
  }
  try {
    const inboundMs = new Date(conversation.last_inbound_at).getTime();
    const expiresMs = conversation.window_expires_at
      ? new Date(conversation.window_expires_at).getTime()
      : inboundMs + 24 * 60 * 60 * 1000;

    const refMs = conversation.last_message_at
      ? new Date(conversation.last_message_at).getTime()
      : inboundMs;

    const isOpen = expiresMs > refMs;
    const hoursLeft = isOpen ? Math.max(1, Math.round((expiresMs - refMs) / (1000 * 60 * 60))) : 0;

    return {
      isOpen,
      hoursLeft,
      label: isOpen ? `Customer Window Active (${hoursLeft}h left)` : "24h Window Expired",
    };
  } catch {
    return { isOpen: true, hoursLeft: 24, label: "Customer Window Active" };
  }
}

export function MessageThreadPanel({
  conversation,
  onBackToList,
  onToggleContactPanel,
  isContactPanelOpen = false,
}: MessageThreadPanelProps) {
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [inputText, setInputText] = useState("");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = conversation?.id;

  const { data: messages = [], isLoading: isLoadingMessages, isError, refetch } =
    useConversationMessagesQuery(conversationId);

  const sendMessageMutation = useSendMessageMutation(conversationId);
  const addNoteMutation = useAddInternalNoteMutation(conversationId);
  const resolveMutation = useResolveConversationMutation(conversationId);
  const reopenMutation = useReopenConversationMutation(conversationId);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const windowStatus = getWhatsAppWindowStatus(conversation);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    const content = inputText.trim();

    if (composerMode === "note") {
      await addNoteMutation.mutateAsync(content);
      setInputText("");
      return;
    }

    // Customer Reply Mode
    await sendMessageMutation.mutateAsync({
      type: "text",
      content,
      body: content,
    });
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendTemplate = async ({
    template_name,
    language,
    body_text,
    variables,
  }: {
    template_name: string;
    language: string;
    body_text: string;
    variables: Record<string, string>;
  }) => {
    if (!conversationId) return;

    await sendMessageMutation.mutateAsync({
      type: "template",
      template_name,
      language,
      content: body_text,
      body: body_text,
      components: Object.entries(variables).map(([, v]) => ({
        type: "body",
        parameters: [{ type: "text", text: v }],
      })),
    });

    setIsTemplateModalOpen(false);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-muted-foreground bg-muted/10 h-full">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <MessageSquare className="size-6" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Select a conversation</h3>
        <p className="max-w-xs text-[11px] text-muted-foreground mt-1">
          Choose a WhatsApp customer thread from the left panel to review messages and reply.
        </p>
      </div>
    );
  }

  const isResolved = conversation.status === "resolved";

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 overflow-hidden relative">
      {/* 1. Thread Header */}
      <div className="p-3 sm:px-4 border-b border-border/80 bg-card flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          {onBackToList && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onBackToList}
              className="md:hidden text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shadow-xs">
            {conversation.contact_name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {conversation.contact_name}
              </h3>
              <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono hidden sm:inline">
                {conversation.contact_phone}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
              <span className="capitalize font-semibold text-primary">
                {conversation.status}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="size-3 text-muted-foreground" />
                {conversation.assigned_agent_name || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Assign Button */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsAssignModalOpen(true)}
            className="gap-1 h-7 text-[11px]"
            title="Assign to agent"
          >
            <UserCheck className="size-3 text-primary" />
            <span className="hidden sm:inline">Assign</span>
          </Button>

          {/* Resolve / Reopen Button */}
          {isResolved ? (
            <Button
              variant="outline"
              size="xs"
              onClick={() => reopenMutation.mutate()}
              disabled={reopenMutation.isPending}
              className="gap-1 h-7 text-[11px] text-primary"
            >
              <RotateCcw className="size-3" />
              <span>Reopen</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="xs"
              onClick={() => resolveMutation.mutate()}
              disabled={resolveMutation.isPending}
              className="gap-1 h-7 text-[11px]"
            >
              <Check className="size-3 text-emerald-500" />
              <span className="hidden sm:inline">Resolve</span>
            </Button>
          )}

          {/* Contact Details Toggle */}
          {onToggleContactPanel && (
            <Button
              variant={isContactPanelOpen ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={onToggleContactPanel}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Toggle Contact Information Panel"
              aria-label="Toggle Contact Information Panel"
            >
              <PanelRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. WhatsApp 24-Hour Service Window Banner */}
      {!windowStatus.isOpen ? (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate text-[11px]">
              <strong>24-Hour Customer Window Expired.</strong> WhatsApp policy requires sending an approved template message to re-engage this customer.
            </span>
          </div>

          <Button
            size="xs"
            variant="outline"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-6 text-[10px] font-bold border-amber-500/40 text-amber-900 dark:text-amber-200 bg-amber-500/15 shrink-0 gap-1"
          >
            <FileText className="size-3" />
            Select Template
          </Button>
        </div>
      ) : (
        <div className="bg-emerald-500/5 border-b border-emerald-500/15 px-3.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Customer service window open: <strong>{windowStatus.hoursLeft} hours remaining</strong>. Free-form text and media permitted.</span>
          </span>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-0.5"
          >
            <FileCheck className="size-3" />
            Use Template
          </button>
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-muted/15 min-h-0">
        {isLoadingMessages ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-start"><Skeleton className="h-16 w-64 rounded-2xl" /></div>
            <div className="flex justify-end"><Skeleton className="h-12 w-56 rounded-2xl" /></div>
            <div className="flex justify-start"><Skeleton className="h-20 w-72 rounded-2xl" /></div>
          </div>
        ) : isError ? (
          <div className="text-center py-10 space-y-2 text-xs text-muted-foreground">
            <AlertCircle className="size-5 text-destructive mx-auto" />
            <p>Failed to load message thread.</p>
            <Button variant="outline" size="xs" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground space-y-2">
            <MessageSquare className="size-8 mx-auto text-muted-foreground/30" />
            <p className="font-semibold text-foreground">No messages in this conversation yet</p>
            <p className="text-[11px]">Send a reply below to initiate conversation with this customer.</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isOutbound = msg.direction === "outbound";
            const isNote = msg.is_internal || msg.type === "internal_note";

            if (isNote) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="max-w-lg w-full bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <span className="flex items-center gap-1">
                        <Lock className="size-3" />
                        Internal Note • {msg.sender_name || "Agent"}
                      </span>
                      <span className="font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs space-y-1 ${
                    isOutbound
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-card border border-border/80 text-foreground rounded-bl-xs"
                  }`}
                >
                  {/* Sender attribution if outbound */}
                  {isOutbound && msg.sender_name && (
                    <p className="text-[10px] font-semibold text-primary-foreground/80 leading-none mb-0.5">
                      {msg.sender_name}
                    </p>
                  )}

                  {/* Document preview if document type */}
                  {msg.type === "document" && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/10 dark:bg-white/10 mb-1">
                      <FileText className="size-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs truncate">{msg.media_name || "Document.pdf"}</p>
                        <p className="text-[10px] opacity-80">{msg.media_size || "PDF File"}</p>
                      </div>
                      {msg.media_url && (
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded hover:bg-black/20"
                          title="Download"
                        >
                          <Download className="size-3.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Template styling if template message */}
                  {msg.type === "template" && (
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider opacity-80 pb-0.5">
                      <Sparkles className="size-3" />
                      Meta Template
                    </div>
                  )}

                  {/* Body text */}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Timestamp & Delivery State Icon */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] pt-0.5 ${
                      isOutbound ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    {isOutbound && (
                      <span title={`Status: ${msg.status}`}>
                        {msg.status === "pending" ? (
                          <Clock className="size-3 animate-spin" />
                        ) : msg.status === "sent" ? (
                          <Check className="size-3" />
                        ) : msg.status === "delivered" ? (
                          <CheckCheck className="size-3" />
                        ) : msg.status === "read" ? (
                          <CheckCheck className="size-3 text-sky-300 dark:text-sky-200 font-bold" />
                        ) : msg.status === "failed" ? (
                          <AlertCircle className="size-3 text-destructive" />
                        ) : null}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Rich Composer Box */}
      <div className="p-3 border-t border-border/80 bg-card shrink-0 space-y-2">
        {/* Composer Mode Toggle Tabs */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setComposerMode("reply")}
              className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all ${
                composerMode === "reply"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Customer Reply
            </button>
            <button
              type="button"
              onClick={() => setComposerMode("note")}
              className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                composerMode === "note"
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="size-3" />
              Internal Note
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsTemplateModalOpen(true)}
            className="text-[11px] text-primary hover:text-primary/90 h-6 gap-1"
          >
            <FileText className="size-3" />
            <span>Templates</span>
          </Button>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="space-y-2">
          <div className="relative">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                composerMode === "note"
                  ? "Write an internal note for agents (not sent to WhatsApp customer)..."
                  : !windowStatus.isOpen
                  ? "Customer window expired. Use an approved template or type response..."
                  : "Type WhatsApp reply (Press Enter to send, Shift+Enter for new line)..."
              }
              rows={2}
              className={`text-xs resize-none pr-12 ${
                composerMode === "note"
                  ? "border-amber-500/40 bg-amber-500/5 focus-visible:ring-amber-500/30"
                  : "bg-muted/20"
              }`}
              disabled={sendMessageMutation.isPending || addNoteMutation.isPending}
            />

            <Button
              type="submit"
              size="icon-xs"
              disabled={
                !inputText.trim() ||
                sendMessageMutation.isPending ||
                addNoteMutation.isPending
              }
              className={`absolute right-2 bottom-2 size-7 rounded-lg ${
                composerMode === "note"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : ""
              }`}
              title="Send Message"
            >
              <Send className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-6 text-muted-foreground hover:text-foreground"
                title="Attach Document or Image"
                onClick={() => {
                  setInputText((prev) => prev ? `${prev} [Attachment]` : "[Attachment: Invoice.pdf]");
                }}
              >
                <Paperclip className="size-3.5" />
              </Button>
              <span className="hidden sm:inline text-[10px]">
                {composerMode === "note"
                  ? "Visible only to your workspace team"
                  : "Official Meta WhatsApp Cloud API"}
              </span>
            </div>

            <span className="text-[10px] font-mono">
              {inputText.length} / 1024
            </span>
          </div>
        </form>
      </div>

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSendTemplate={handleSendTemplate}
        isSending={sendMessageMutation.isPending}
      />

      {/* Assign Agent Modal */}
      <AssignAgentModal
        conversationId={conversation.id}
        currentAssignedId={conversation.assigned_to}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
}
