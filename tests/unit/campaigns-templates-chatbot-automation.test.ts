import { describe, it, expect } from "vitest";
import {
  campaignCreateSchema,
  campaignTestSchema,
} from "@/features/campaigns/schemas";
import { campaignKeys } from "@/features/campaigns/hooks";
import {
  templateCreateSchema,
  templateButtonSchema,
} from "@/features/templates/schemas";
import { templateKeys } from "@/features/templates/hooks";
import {
  botConfigSchema,
  knowledgeItemSchema,
} from "@/features/chatbot/schemas";
import { chatbotKeys } from "@/features/chatbot/hooks";
import {
  automationRuleSchema,
  automationConditionSchema,
  automationActionSchema,
} from "@/features/automation/schemas";
import { automationKeys } from "@/features/automation/hooks";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { getMockResponse } from "@/src/lib/api/mock";
import type { Campaign, CampaignAnalytics } from "@/types/campaign";
import type { MetaTemplate } from "@/types/template";
import type { AiBotConfig, AiKnowledgeItem, AiTestChatMessage } from "@/types/chatbot";
import type { AutomationRule, AutomationExecutionLog } from "@/types/automation";

describe("Campaigns, Templates, Chatbot, and Automation Modules", () => {
  describe("Campaign Management", () => {
    it("validates campaign creation schema", () => {
      const validCampaign = {
        name: "Diwali Flash Sale 2026",
        phone_number_id: "phone_001",
        template_id: 1,
        send_type: "now" as const,
        audience_tags: ["High Value", "VIP Customers"],
        variable_mapping: { "1": "Customer Name", "2": "25% OFF" },
      };

      const result = campaignCreateSchema.safeParse(validCampaign);
      expect(result.success).toBe(true);
    });

    it("rejects campaign without name or template_id", () => {
      const invalid = {
        name: "",
        phone_number_id: "phone_001",
        send_type: "now" as const,
        audience_tags: [],
      };

      const result = campaignCreateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0]);
        expect(fields).toContain("name");
        expect(fields).toContain("template_id");
      }
    });

    it("validates test dispatch payload", () => {
      expect(
        campaignTestSchema.safeParse({ phone: "+919876543210" }).success
      ).toBe(true);
      expect(
        campaignTestSchema.safeParse({ phone: "invalid" }).success
      ).toBe(false);
    });

    it("generates tenant-scoped campaign query keys", () => {
      const tenantKey = campaignKeys.tenant("tenant_abc");
      expect(tenantKey).toEqual(["campaigns", "tenant_abc"]);
      expect(campaignKeys.list("tenant_abc", { status: "running" })).toEqual([
        "campaigns",
        "tenant_abc",
        "list",
        { status: "running" },
      ]);
      expect(campaignKeys.detail("tenant_abc", 42)).toEqual([
        "campaigns",
        "tenant_abc",
        "detail",
        "42",
      ]);
    });

    it("resolves mock response for campaign endpoints", () => {
      const listRes = getMockResponse<Campaign[]>(API_ENDPOINTS.CAMPAIGNS.LIST, "GET");
      expect(listRes).not.toBeNull();
      expect(listRes?.success).toBe(true);
      expect(Array.isArray(listRes?.data)).toBe(true);
      expect((listRes?.data || []).length).toBeGreaterThan(0);

      const analyticsRes = getMockResponse<CampaignAnalytics>(
        API_ENDPOINTS.CAMPAIGNS.ANALYTICS(1),
        "GET"
      );
      expect(analyticsRes).not.toBeNull();
      expect(analyticsRes?.success).toBe(true);
      expect(analyticsRes?.data.total_recipients).toBeGreaterThan(0);
      expect(analyticsRes?.data.delivery_rate).toBeGreaterThan(0);
    });
  });

  describe("Message Templates", () => {
    it("validates template button schema", () => {
      const quickReply = {
        type: "QUICK_REPLY" as const,
        text: "Yes, Confirm",
      };
      expect(templateButtonSchema.safeParse(quickReply).success).toBe(true);

      const invalidButton = {
        type: "QUICK_REPLY" as const,
        text: "",
      };
      expect(templateButtonSchema.safeParse(invalidButton).success).toBe(false);
    });

    it("validates template create schema with Meta naming restrictions", () => {
      const valid = {
        name: "order_confirmation_v1",
        category: "UTILITY" as const,
        language: "en_US",
        header_text: "Order Confirmed",
        body_text: "Hello {{1}}, your order #{{2}} is on its way!",
        footer_text: "Reply STOP to unsubscribe",
        buttons: [
          { type: "URL" as const, text: "Track Order", url: "https://example.com" },
        ],
      };

      const result = templateCreateSchema.safeParse(valid);
      expect(result.success).toBe(true);

      const uppercaseName = {
        ...valid,
        name: "Order_Confirmation", // Capital letters violate Meta naming rules
      };
      expect(templateCreateSchema.safeParse(uppercaseName).success).toBe(false);
    });

    it("generates tenant-scoped template query keys", () => {
      expect(templateKeys.list("tenant_42", { category: "MARKETING" })).toEqual([
        "templates",
        "tenant_42",
        "list",
        { category: "MARKETING" },
      ]);
    });

    it("resolves mock response for template endpoints", () => {
      const listRes = getMockResponse<MetaTemplate[]>(API_ENDPOINTS.TEMPLATES.LIST, "GET");
      expect(listRes).not.toBeNull();
      expect(listRes?.success).toBe(true);
      expect(Array.isArray(listRes?.data)).toBe(true);
      const approved = (listRes?.data || []).filter((t) => t.status === "APPROVED");
      expect(approved.length).toBeGreaterThan(0);
    });
  });

  describe("AI Chatbot", () => {
    it("validates AI bot config schema", () => {
      const validConfig = {
        is_enabled: true,
        provider: "gemini-2.5-flash" as const,
        system_prompt: "You are the official WhatsApp assistant for Acme Corp.",
        temperature: 0.25,
        confidence_threshold: 0.8,
        handoff_keywords: ["human", "support", "agent"],
        fallback_message: "Let me connect you with a team member.",
        business_hours_only: false,
        reply_delay_seconds: 2,
      };

      expect(botConfigSchema.safeParse(validConfig).success).toBe(true);

      const invalidTemp = {
        ...validConfig,
        temperature: 1.5, // exceeds max 1.0
      };
      expect(botConfigSchema.safeParse(invalidTemp).success).toBe(false);
    });

    it("validates knowledge item schema", () => {
      const validItem = {
        question: "What is your return policy?",
        answer: "We offer a 30-day hassle-free return guarantee for unworn items.",
        keywords: ["returns", "refund", "exchange"],
        is_active: true,
      };

      expect(knowledgeItemSchema.safeParse(validItem).success).toBe(true);

      const invalidItem = {
        question: "Hi", // too short
        answer: "Hey", // too short
        keywords: [],
        is_active: true,
      };
      expect(knowledgeItemSchema.safeParse(invalidItem).success).toBe(false);
    });

    it("generates tenant-scoped chatbot query keys", () => {
      expect(chatbotKeys.config("tenant_123")).toEqual([
        "ai-chatbot",
        "tenant_123",
        "config",
      ]);
      expect(chatbotKeys.knowledge("tenant_123")).toEqual([
        "ai-chatbot",
        "tenant_123",
        "knowledge",
      ]);
    });

    it("resolves mock responses for AI config and test chat", () => {
      const configRes = getMockResponse<AiBotConfig>(API_ENDPOINTS.AI.CONFIG, "GET");
      expect(configRes).not.toBeNull();
      expect(configRes?.success).toBe(true);
      expect(configRes?.data.is_enabled).toBe(true);
      expect(configRes?.data.provider).toBe("gemini-2.5-flash");

      const kbRes = getMockResponse<AiKnowledgeItem[]>(API_ENDPOINTS.AI.KNOWLEDGE, "GET");
      expect(kbRes).not.toBeNull();
      expect(kbRes?.success).toBe(true);
      expect((kbRes?.data || []).length).toBeGreaterThan(0);

      const testChat = getMockResponse<AiTestChatMessage>(
        API_ENDPOINTS.AI.TEST_CHAT,
        "POST"
      );
      expect(testChat).not.toBeNull();
      expect(testChat?.success).toBe(true);
      expect(testChat?.data.sender).toBe("bot");
    });
  });

  describe("Automation Engine", () => {
    it("validates condition and action schemas", () => {
      const condition = {
        field: "message.body",
        operator: "contains" as const,
        value: "urgent",
      };
      expect(automationConditionSchema.safeParse(condition).success).toBe(true);

      const action = {
        type: "assign_agent" as const,
        payload: { agent_id: "agent_42" },
      };
      expect(automationActionSchema.safeParse(action).success).toBe(true);
    });

    it("validates automation rule schema", () => {
      const rule = {
        name: "Auto-assign High Priority Leads",
        description: "Assigns chats containing urgent keywords to senior team",
        is_active: true,
        trigger_type: "incoming_message" as const,
        conditions: [
          { field: "message.body", operator: "contains" as const, value: "urgent" },
        ],
        actions: [
          { type: "assign_agent" as const, payload: { agent: "senior" } },
          { type: "add_tag" as const, payload: { tag: "Urgent" } },
        ],
      };

      expect(automationRuleSchema.safeParse(rule).success).toBe(true);

      const noActionsRule = {
        ...rule,
        actions: [], // At least one action required
      };
      expect(automationRuleSchema.safeParse(noActionsRule).success).toBe(false);
    });

    it("generates tenant-scoped automation query keys", () => {
      expect(automationKeys.rules("tenant_xyz")).toEqual([
        "automation",
        "tenant_xyz",
        "rules",
      ]);
      expect(automationKeys.logs("tenant_xyz")).toEqual([
        "automation",
        "tenant_xyz",
        "logs",
      ]);
    });

    it("resolves mock response for automation rules and execution logs", () => {
      const rulesRes = getMockResponse<AutomationRule[]>(
        API_ENDPOINTS.AUTOMATION.RULES,
        "GET"
      );
      expect(rulesRes).not.toBeNull();
      expect(rulesRes?.success).toBe(true);
      expect((rulesRes?.data || []).length).toBeGreaterThan(0);
      expect(rulesRes?.data[0].actions.length).toBeGreaterThan(0);

      const logsRes = getMockResponse<AutomationExecutionLog[]>(
        API_ENDPOINTS.AUTOMATION.LOGS,
        "GET"
      );
      expect(logsRes).not.toBeNull();
      expect(logsRes?.success).toBe(true);
      expect((logsRes?.data || []).length).toBeGreaterThan(0);
      expect(logsRes?.data[0].status).toBe("success");
    });
  });
});
