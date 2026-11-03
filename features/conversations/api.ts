import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  Conversation,
  Message,
  WhatsAppTemplate,
  TeamMember,
  InternalNote,
} from "@/types/whatsapp";

export interface ConversationFilterParams {
  status?: string;
  assigned_to?: string | number;
  priority?: string;
  unread_only?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface SendMessagePayload {
  type: "text" | "template" | "image" | "document" | "audio" | "video";
  body?: string;
  content?: string;
  template_name?: string;
  language?: string;
  components?: unknown[];
  media_url?: string;
  media_name?: string;
  media_size?: string | number;
  media_mime_type?: string;
  caption?: string;
}

export async function fetchConversations(
  params?: ConversationFilterParams
): Promise<Conversation[]> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.assigned_to !== undefined) queryParams.assigned_to = params.assigned_to;
  if (params?.priority) queryParams.priority = params.priority;
  if (params?.unread_only) queryParams.unread_only = params.unread_only;
  if (params?.search) queryParams.search = params.search;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;

  const response = await apiClient.get<Conversation[]>(API_ENDPOINTS.CONVERSATIONS.LIST, {
    params: queryParams,
  });
  return response.data;
}

export async function fetchConversationDetails(
  conversationId: string | number
): Promise<Conversation> {
  const response = await apiClient.get<Conversation>(
    API_ENDPOINTS.CONVERSATIONS.DETAIL(conversationId)
  );
  return response.data;
}

export async function fetchConversationMessages(
  conversationId: string | number
): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(
    API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)
  );
  return response.data;
}

export async function sendWhatsAppMessage(
  conversationId: string | number,
  payload: SendMessagePayload
): Promise<Message> {
  const normalizedBody = {
    ...payload,
    body: payload.body || payload.content || "",
    content: payload.content || payload.body || "",
  };

  const response = await apiClient.post<Message>(
    API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId),
    normalizedBody
  );
  return response.data;
}

export async function addInternalNote(
  conversationId: string | number,
  note: string
): Promise<InternalNote> {
  const response = await apiClient.post<InternalNote>(
    API_ENDPOINTS.CONVERSATIONS.NOTES(conversationId),
    { note }
  );
  return response.data;
}

export async function assignConversation(
  conversationId: string | number,
  assigned_to: number | string,
  notes?: string
): Promise<{ conversation_id: number | string; assigned_to: number | string }> {
  const response = await apiClient.post<{ conversation_id: number | string; assigned_to: number | string }>(
    API_ENDPOINTS.CONVERSATIONS.ASSIGN(conversationId),
    { assigned_to, notes }
  );
  return response.data;
}

export async function resolveConversation(
  conversationId: string | number
): Promise<{ conversation_id: number | string; status: string }> {
  const response = await apiClient.post<{ conversation_id: number | string; status: string }>(
    API_ENDPOINTS.CONVERSATIONS.RESOLVE(conversationId)
  );
  return response.data;
}

export async function reopenConversation(
  conversationId: string | number
): Promise<{ conversation_id: number | string; status: string }> {
  const response = await apiClient.post<{ conversation_id: number | string; status: string }>(
    API_ENDPOINTS.CONVERSATIONS.REOPEN(conversationId)
  );
  return response.data;
}

export async function snoozeConversation(
  conversationId: string | number,
  snoozed_until: string
): Promise<{ conversation_id: number | string; status: string }> {
  const response = await apiClient.post<{ conversation_id: number | string; status: string }>(
    API_ENDPOINTS.CONVERSATIONS.SNOOZE(conversationId),
    { snoozed_until }
  );
  return response.data;
}

export async function fetchApprovedTemplates(): Promise<WhatsAppTemplate[]> {
  const response = await apiClient.get<WhatsAppTemplate[]>(
    `${API_ENDPOINTS.WHATSAPP.TEMPLATES}?status=APPROVED`
  );
  return response.data;
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const response = await apiClient.get<TeamMember[]>(API_ENDPOINTS.TEAM.MEMBERS);
  return response.data;
}

export async function addContactTag(
  contactId: string | number,
  tag: string
): Promise<{ success: boolean; tags?: string[] }> {
  const response = await apiClient.post<{ success: boolean; tags?: string[] }>(
    API_ENDPOINTS.CONTACTS.CONTACT_TAGS(contactId),
    { tag }
  );
  return response.data;
}

export async function removeContactTag(
  contactId: string | number,
  tag: string
): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ success: boolean }>(
    API_ENDPOINTS.CONTACTS.TAG_DELETE(contactId, encodeURIComponent(tag))
  );
  return response.data;
}
