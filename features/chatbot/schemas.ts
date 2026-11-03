import { z } from "zod";

export const botConfigSchema = z.object({
  is_enabled: z.boolean(),
  provider: z.enum(["gemini-2.5-flash", "gemini-1.5-pro", "gpt-4o"]),
  system_prompt: z.string().min(10, "System prompt must be at least 10 characters"),
  temperature: z.number().min(0).max(1),
  confidence_threshold: z.number().min(0).max(1),
  handoff_keywords: z.array(z.string()),
  fallback_message: z.string().min(5, "Fallback message must be at least 5 characters"),
  business_hours_only: z.boolean(),
  reply_delay_seconds: z.number().min(0).max(30),
});

export type BotConfigFormData = z.infer<typeof botConfigSchema>;

export const knowledgeItemSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  keywords: z.array(z.string()),
  is_active: z.boolean(),
});

export type KnowledgeItemFormData = z.infer<typeof knowledgeItemSchema>;
