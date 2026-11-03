"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sliders, BookOpen, Bot } from "lucide-react";
import { useAiConfigQuery, useAiKnowledgeQuery } from "@/features/chatbot/hooks";
import { BotConfigCard } from "@/features/chatbot/components/bot-config-card";
import { KnowledgeBaseTable } from "@/features/chatbot/components/knowledge-base-table";
import { ChatbotPlayground } from "@/features/chatbot/components/chatbot-playground";

export default function AiChatbotPage() {
  const { data: config, isLoading: loadingConfig } = useAiConfigQuery();
  const { data: knowledgeItems, isLoading: loadingKnowledge, refetch: refetchKnowledge } =
    useAiKnowledgeQuery();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="AI Sales & Support Assistant"
        description="Configure automated WhatsApp intelligent conversational responses, verified knowledge sources, and human agent handoffs."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "AI Chatbot" },
        ]}
      />

      {/* Main Grid: Left side for settings/knowledge, right side for live simulator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Section: Tabs for Config & Knowledge Base */}
        <div className="xl:col-span-7 space-y-4">
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="config" className="text-xs font-semibold gap-1.5">
                <Sliders className="size-3.5" />
                Bot Settings & Prompts
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs font-semibold gap-1.5">
                <BookOpen className="size-3.5" />
                Knowledge Base & FAQs ({knowledgeItems?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="mt-4">
              <BotConfigCard config={config} isLoading={loadingConfig} />
            </TabsContent>

            <TabsContent value="knowledge" className="mt-4">
              <KnowledgeBaseTable
                items={knowledgeItems || []}
                isLoading={loadingKnowledge}
                onRefresh={() => refetchKnowledge()}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Section: Real-time WhatsApp Playground Simulator */}
        <div className="xl:col-span-5 space-y-3 sticky top-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <Bot className="size-3.5 text-primary" />
            <span>Interactive Simulator</span>
          </div>
          <ChatbotPlayground />
        </div>
      </div>
    </div>
  );
}
