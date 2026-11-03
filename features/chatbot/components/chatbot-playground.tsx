"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Headset,
  Loader2,
} from "lucide-react";
import { useTestChatMutation } from "../hooks";
import type { AiTestChatMessage } from "@/types/chatbot";

const INITIAL_MESSAGES: AiTestChatMessage[] = [
  {
    id: "init-1",
    sender: "bot",
    text: "Hello! 👋 I am your business's WhatsApp AI Assistant powered by Gemini. Ask me any question about your products, shipping, or hours to test how I respond!",
    timestamp: "10:00 AM",
    confidence_score: 1.0,
  },
];

const SUGGESTIONS = [
  "What are your business hours?",
  "How long does delivery take?",
  "Can I speak with a human agent?",
  "What is your refund policy?",
];

export function ChatbotPlayground() {
  const [messages, setMessages] = React.useState<AiTestChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = React.useState("");
  const testChatMutation = useTestChatMutation();
  const chatScrollRef = React.useRef<HTMLDivElement>(null);
  const msgCounter = React.useRef(0);

  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, testChatMutation.isPending]);

  const handleSend = React.useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputValue).trim();
      if (!text || testChatMutation.isPending) return;

      msgCounter.current += 1;
      const count = msgCounter.current;
      const timeStr = "Now";

      const userMsg: AiTestChatMessage = {
        id: `user-msg-${count}`,
        sender: "user",
        text,
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");

      try {
        const response = await testChatMutation.mutateAsync(text);
        setMessages((prev) => [...prev, response]);
      } catch {
        msgCounter.current += 1;
        const fallbackMsg: AiTestChatMessage = {
          id: `bot-fallback-${msgCounter.current}`,
          sender: "bot",
          text: "I am having difficulty connecting to the knowledge base right now. Let me connect you with a team member.",
          timestamp: timeStr,
          confidence_score: 0.35,
          is_handoff: true,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    },
    [inputValue, testChatMutation]
  );

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[600px] bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Playground Header */}
      <div className="p-3.5 border-b border-border/70 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Bot className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              WhatsApp AI Simulator
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                Live Simulator
              </Badge>
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Test responses, confidence scoring, and agent handoffs in real-time
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-7 text-xs text-muted-foreground gap-1 hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Reset Chat
        </Button>
      </div>

      {/* Chat Messages Container */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-emerald-950/5 dark:bg-emerald-950/20"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs space-y-1.5 ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none"
                  : "bg-card text-foreground rounded-tl-none border border-border/80"
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-0.5">
                <span className="font-semibold flex items-center gap-1">
                  {msg.sender === "user" ? (
                    <>
                      <User className="size-3" /> Customer
                    </>
                  ) : (
                    <>
                      <Bot className="size-3 text-emerald-500" /> AI Bot
                    </>
                  )}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Bot response diagnostics */}
              {msg.sender === "bot" && (
                <div className="pt-1.5 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-[10px]">
                  {msg.confidence_score !== undefined && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                      <ShieldCheck className="size-3 text-emerald-500" />
                      Confidence: {(msg.confidence_score * 100).toFixed(0)}%
                    </span>
                  )}

                  {msg.is_handoff && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                      <Headset className="size-3" />
                      Handoff Triggered
                    </span>
                  )}

                  {msg.matched_knowledge_id && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                      KB #{msg.matched_knowledge_id}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {testChatMutation.isPending && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 max-w-[160px] text-xs text-muted-foreground animate-pulse">
            <Loader2 className="size-3.5 animate-spin text-primary" />
            <span>AI generating reply...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="p-2 border-t border-border/60 bg-muted/10 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 shrink-0 px-1">
          <Sparkles className="size-3 text-primary" /> Try:
        </span>
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(suggestion)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-background border border-border/80 hover:border-primary/50 text-foreground shrink-0 transition-colors cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="p-3 bg-card border-t border-border/80 flex items-center gap-2">
        <Input
          placeholder="Ask a question to test the bot..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={testChatMutation.isPending}
          className="text-xs h-9 bg-background"
        />
        <Button
          size="sm"
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || testChatMutation.isPending}
          className="h-9 w-9 p-0 shrink-0"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
