export type ConversationStatus = "open" | "resolved" | "snoozed" | "pending";
export type MessageDirection = "inbound" | "outbound";
export type MessageType =
  | "text"
  | "template"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "interactive"
  | "internal_note";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

import type { Contact } from "./contact";

export interface Conversation {
  id: number | string;
  tenant_id: number | string;
  contact_id: number | string;
  contact_name: string;
  contact_phone: string;
  status: ConversationStatus;
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string | number | null;
  assigned_agent_name?: string | null;
  last_message_preview?: string;
  last_message_at?: string;
  last_inbound_at?: string;
  window_expires_at?: string;
  unread_count: number;
  contact?: Contact;
  tags?: string[];
  snoozed_until?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MessageButton {
  text: string;
  type?: "quick_reply" | "url" | "phone_number";
  url?: string;
  phone_number?: string;
}

export interface Message {
  id: number | string;
  conversation_id: number | string;
  direction: MessageDirection;
  type: MessageType;
  content: string;
  status: MessageStatus;
  media_url?: string | null;
  media_name?: string | null;
  media_size?: string | number | null;
  media_mime_type?: string | null;
  template_name?: string | null;
  buttons?: MessageButton[];
  sender_id?: string | number | null;
  sender_name?: string | null;
  is_internal?: boolean;
  error_message?: string | null;
  created_at: string;
}

export interface InternalNote {
  id: number | string;
  conversation_id: number | string;
  author_id?: number | string;
  author_name: string;
  note: string;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: number | string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  body_text: string;
  example_variables?: string[];
  buttons?: MessageButton[];
}

export interface WhatsAppAccount {
  id: number | string;
  tenant_id?: number | string;
  waba_id: string;
  business_name: string;
  status: "connected" | "disconnected" | "restricted" | "pending";
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | string;
  messaging_limit: string;
  is_default: boolean;
  templates_synced_at?: string | null;
  webhook_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WhatsAppPhoneNumber {
  id: number | string;
  phone_number_id: string;
  waba_id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: string;
  status: string;
  is_default: boolean;
}

export interface EmbeddedSignupConfig {
  app_id: string;
  config_id: string;
  graph_version?: string;
  session_info_version?: string;
  is_configured?: boolean;
  features?: string[];
  [key: string]: any;
}

export type { TeamMember } from "./team";
