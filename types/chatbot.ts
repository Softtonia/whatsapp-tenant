export interface AiBotConfig {
  id?: number | string;
  tenant_id?: number | string;
  is_enabled: boolean;
  provider: "gemini-2.5-flash" | "gemini-1.5-pro" | "gpt-4o";
  system_prompt: string;
  temperature: number;
  confidence_threshold: number;
  handoff_keywords: string[];
  fallback_message: string;
  business_hours_only: boolean;
  reply_delay_seconds: number;
  updated_at?: string;
}

export interface AiKnowledgeItem {
  id: number | string;
  tenant_id?: number | string;
  question: string;
  answer: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AiTestChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  matched_knowledge_id?: number | string;
  confidence_score?: number;
  is_handoff?: boolean;
}

