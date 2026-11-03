import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchConversationDetails,
  fetchConversationMessages,
  sendWhatsAppMessage,
  addInternalNote,
  assignConversation,
  resolveConversation,
  reopenConversation,
  snoozeConversation,
  fetchApprovedTemplates,
  fetchTeamMembers,
  addContactTag,
  removeContactTag,
  type ConversationFilterParams,
  type SendMessagePayload,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { Message } from "@/types/whatsapp";

export const conversationKeys = {
  all: ["conversations"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...conversationKeys.all, String(tenantId ?? "default")] as const,
  lists: (tenantId: string | number | undefined) =>
    [...conversationKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: ConversationFilterParams) =>
    [...conversationKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...conversationKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...conversationKeys.details(tenantId), String(id)] as const,
  messages: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...conversationKeys.detail(tenantId, id), "messages"] as const,
  templates: () => ["whatsapp", "templates", "approved"] as const,
  teamMembers: () => ["team", "members"] as const,
};

export function useConversationsQuery(params?: ConversationFilterParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: conversationKeys.list(tenantId, params),
    queryFn: () => fetchConversations(params),
    staleTime: 1000 * 15,
    refetchInterval: 8000, // 8-second polling for active inbox list
  });
}

export function useConversationDetailsQuery(conversationId: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: conversationKeys.detail(tenantId, conversationId),
    queryFn: () => fetchConversationDetails(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 1000 * 30,
  });
}

export function useConversationMessagesQuery(conversationId: string | number | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: conversationKeys.messages(tenantId, conversationId),
    queryFn: () => fetchConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
    staleTime: 1000 * 5,
    refetchInterval: 4000, // 4-second polling for active conversation thread
  });
}

export function useSendMessageMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendWhatsAppMessage(conversationId!, payload),
    onMutate: async (newMsg) => {
      if (!conversationId) return;

      const queryKey = conversationKeys.messages(tenantId, conversationId);
      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData<Message[]>(queryKey) || [];

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `optimistic_${Date.now()}`,
        conversation_id: conversationId,
        direction: "outbound",
        type: newMsg.type,
        content: newMsg.content || newMsg.body || "",
        status: "pending",
        media_url: newMsg.media_url,
        media_name: newMsg.media_name,
        media_size: newMsg.media_size,
        template_name: newMsg.template_name,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(queryKey, [...previousMessages, optimisticMessage]);

      return { previousMessages, optimisticId: optimisticMessage.id };
    },
    onError: (_err, _newMsg, context) => {
      if (context && conversationId) {
        const queryKey = conversationKeys.messages(tenantId, conversationId);
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },
    onSuccess: (serverMessage, _newMsg, context) => {
      if (!conversationId) return;
      const queryKey = conversationKeys.messages(tenantId, conversationId);

      queryClient.setQueryData<Message[]>(queryKey, (old) => {
        if (!old) return [serverMessage];
        // Replace optimistic message with confirmed server message
        return old.map((m) =>
          m.id === context?.optimisticId ? serverMessage : m
        );
      });

      // Invalidate conversation list so preview & timestamps update
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useAddInternalNoteMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (note: string) => addInternalNote(conversationId!, note),
    onSuccess: (newNote) => {
      if (!conversationId) return;

      // Also inject into message thread view as internal note item
      const queryKey = conversationKeys.messages(tenantId, conversationId);
      const noteMessage: Message = {
        id: `note_${newNote.id}`,
        conversation_id: conversationId,
        direction: "outbound",
        type: "internal_note",
        content: newNote.note,
        status: "delivered",
        sender_name: newNote.author_name,
        is_internal: true,
        created_at: newNote.created_at,
      };

      queryClient.setQueryData<Message[]>(queryKey, (old) =>
        old ? [...old, noteMessage] : [noteMessage]
      );

      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
    },
  });
}

export function useAssignConversationMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({
      assigned_to,
      notes,
    }: {
      assigned_to: number | string;
      notes?: string;
    }) => assignConversation(conversationId!, assigned_to, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useResolveConversationMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => resolveConversation(conversationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useReopenConversationMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: () => reopenConversation(conversationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useSnoozeConversationMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (snoozed_until: string) =>
      snoozeConversation(conversationId!, snoozed_until),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useApprovedTemplatesQuery() {
  return useQuery({
    queryKey: conversationKeys.templates(),
    queryFn: fetchApprovedTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useTeamMembersQuery() {
  return useQuery({
    queryKey: conversationKeys.teamMembers(),
    queryFn: fetchTeamMembers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddContactTagMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ contactId, tag }: { contactId: string | number; tag: string }) =>
      addContactTag(contactId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}

export function useRemoveContactTagMutation(conversationId: string | number | undefined) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ contactId, tag }: { contactId: string | number; tag: string }) =>
      removeContactTag(contactId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.detail(tenantId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: conversationKeys.lists(tenantId),
      });
    },
  });
}
