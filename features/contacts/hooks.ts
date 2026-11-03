import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchContacts,
  fetchContact,
  createContact,
  updateContact,
  archiveContact,
  restoreContact,
  fetchContactActivities,
  fetchContactNotes,
  addContactNote,
  fetchContactTags,
  createContactTag,
  assignContactTag,
  removeContactTag,
  applyBulkAction,
  uploadContactsCsv,
  exportContactsCsv,
  fetchImportTemplate,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { ContactsQueryParams } from "@/types/contact";
import type { ContactFormData, BulkActionFormData, TagCreateFormData } from "./schemas";

export const contactKeys = {
  all: ["contacts"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...contactKeys.all, String(tenantId ?? "default")] as const,
  lists: (tenantId: string | number | undefined) =>
    [...contactKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: ContactsQueryParams) =>
    [...contactKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...contactKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...contactKeys.details(tenantId), String(id)] as const,
  activities: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...contactKeys.detail(tenantId, id), "activities"] as const,
  notes: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...contactKeys.detail(tenantId, id), "notes"] as const,
  tags: (tenantId: string | number | undefined) =>
    [...contactKeys.tenant(tenantId), "tags"] as const,
  template: () => ["contacts", "import", "template"] as const,
};

export function useContactsQuery(params?: ContactsQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: contactKeys.list(tenantId, params),
    queryFn: () => fetchContacts(params),
    staleTime: 1000 * 30,
  });
}

export function useContactDetailQuery(contactId: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: contactKeys.detail(tenantId, contactId ?? undefined),
    queryFn: () => fetchContact(contactId!),
    enabled: Boolean(contactId),
    staleTime: 1000 * 30,
  });
}

export function useContactActivitiesQuery(contactId: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: contactKeys.activities(tenantId, contactId ?? undefined),
    queryFn: () => fetchContactActivities(contactId!),
    enabled: Boolean(contactId),
    staleTime: 1000 * 30,
  });
}

export function useContactNotesQuery(contactId: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: contactKeys.notes(tenantId, contactId ?? undefined),
    queryFn: () => fetchContactNotes(contactId!),
    enabled: Boolean(contactId),
    staleTime: 1000 * 30,
  });
}

export function useContactTagsQuery() {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: contactKeys.tags(tenantId),
    queryFn: fetchContactTags,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateContactMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: ContactFormData) => createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
      queryClient.invalidateQueries({ queryKey: contactKeys.tags(tenantId) });
    },
  });
}

export function useUpdateContactMutation(contactId?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ContactFormData> }) =>
      updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
      const targetId = variables.id || contactId;
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.detail(tenantId, targetId),
        });
      }
    },
  });
}

export function useArchiveContactMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => archiveContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
    },
  });
}

export function useRestoreContactMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => restoreContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
    },
  });
}

export function useAddContactNoteMutation(contactId: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (note: string) => addContactNote(contactId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.notes(tenantId, contactId) });
      queryClient.invalidateQueries({ queryKey: contactKeys.activities(tenantId, contactId) });
    },
  });
}

export function useCreateContactTagMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: TagCreateFormData) => createContactTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.tags(tenantId) });
    },
  });
}

export function useAssignContactTagMutation(contactId?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, tag }: { id: string | number; tag: string }) =>
      assignContactTag(id, tag),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
      const targetId = variables.id || contactId;
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.detail(tenantId, targetId),
        });
        queryClient.invalidateQueries({
          queryKey: contactKeys.activities(tenantId, targetId),
        });
      }
    },
  });
}

export function useRemoveContactTagMutation(contactId?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, tag }: { id: string | number; tag: string }) =>
      removeContactTag(id, tag),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
      const targetId = variables.id || contactId;
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: contactKeys.detail(tenantId, targetId),
        });
        queryClient.invalidateQueries({
          queryKey: contactKeys.activities(tenantId, targetId),
        });
      }
    },
  });
}

export function useBulkContactsActionMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (payload: BulkActionFormData) => applyBulkAction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
    },
  });
}

export function useImportContactsMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (formData: FormData) => uploadContactsCsv(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists(tenantId) });
    },
  });
}

export function useExportContactsMutation() {
  return useMutation({
    mutationFn: (format?: string) => exportContactsCsv(format),
  });
}

export function useImportTemplateQuery() {
  return useQuery({
    queryKey: contactKeys.template(),
    queryFn: fetchImportTemplate,
    staleTime: 1000 * 60 * 60,
  });
}

