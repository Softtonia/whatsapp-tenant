import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  Contact,
  ContactTag,
  ContactActivity,
  ContactNote,
  ContactsQueryParams,
} from "@/types/contact";
import type {
  ContactFormData,
  BulkActionFormData,
  TagCreateFormData,
} from "./schemas";

export async function fetchContacts(params?: ContactsQueryParams): Promise<{
  data: Contact[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.tag && params.tag !== "all") queryParams.tag = params.tag;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;
  if (params?.sort_by) queryParams.sort_by = params.sort_by;
  if (params?.sort_dir) queryParams.sort_dir = params.sort_dir;

  const res = await apiClient.get<Contact[]>(API_ENDPOINTS.CONTACTS.LIST, {
    params: queryParams,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta as {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    } | undefined,
  };
}

export async function fetchContact(id: string | number): Promise<Contact> {
  const res = await apiClient.get<Contact>(API_ENDPOINTS.CONTACTS.DETAIL(id));
  return res.data;
}

export async function createContact(payload: ContactFormData): Promise<Contact> {
  const res = await apiClient.post<Contact>(API_ENDPOINTS.CONTACTS.LIST, payload);
  return res.data;
}

export async function updateContact(
  id: string | number,
  payload: Partial<ContactFormData>
): Promise<Contact> {
  const res = await apiClient.patch<Contact>(API_ENDPOINTS.CONTACTS.DETAIL(id), payload);
  return res.data;
}

export async function archiveContact(id: string | number): Promise<{ id: string | number; status: string }> {
  const res = await apiClient.post<{ id: string | number; status: string }>(
    API_ENDPOINTS.CONTACTS.ARCHIVE(id)
  );
  return res.data;
}

export async function restoreContact(id: string | number): Promise<{ id: string | number; status: string }> {
  const res = await apiClient.post<{ id: string | number; status: string }>(
    API_ENDPOINTS.CONTACTS.RESTORE(id)
  );
  return res.data;
}

export async function fetchContactActivities(id: string | number): Promise<ContactActivity[]> {
  const res = await apiClient.get<ContactActivity[]>(API_ENDPOINTS.CONTACTS.ACTIVITIES(id));
  return res.data;
}

export async function fetchContactNotes(id: string | number): Promise<ContactNote[]> {
  const res = await apiClient.get<ContactNote[]>(API_ENDPOINTS.CONTACTS.NOTES(id));
  return res.data;
}

export async function addContactNote(id: string | number, note: string): Promise<ContactNote> {
  const res = await apiClient.post<ContactNote>(API_ENDPOINTS.CONTACTS.NOTES(id), { note });
  return res.data;
}

export async function fetchContactTags(): Promise<ContactTag[]> {
  const res = await apiClient.get<ContactTag[]>(API_ENDPOINTS.CONTACTS.TAGS);
  return res.data;
}

export async function createContactTag(payload: TagCreateFormData): Promise<ContactTag> {
  const res = await apiClient.post<ContactTag>(API_ENDPOINTS.CONTACTS.TAGS, payload);
  return res.data;
}

export async function assignContactTag(contactId: string | number, tag: string): Promise<void> {
  await apiClient.post(API_ENDPOINTS.CONTACTS.CONTACT_TAGS(contactId), { tag });
}

export async function removeContactTag(contactId: string | number, tag: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.CONTACTS.TAG_DELETE(contactId, tag));
}

export async function applyBulkAction(payload: BulkActionFormData): Promise<{ affected_count: number }> {
  const res = await apiClient.post<{ affected_count: number }>(
    API_ENDPOINTS.CONTACTS.BULK,
    payload
  );
  return res.data;
}

export async function fetchImportTemplate(): Promise<{ fields: string[]; example: string }> {
  const res = await apiClient.get<{ fields: string[]; example: string }>(
    API_ENDPOINTS.CONTACTS.IMPORT_TEMPLATE
  );
  return res.data;
}

export async function uploadContactsCsv(
  formData: FormData
): Promise<{ imported: number; failed: number; skipped: number }> {
  const res = await apiClient.post<{ imported: number; failed: number; skipped: number }>(
    API_ENDPOINTS.CONTACTS.IMPORTS,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

export async function exportContactsCsv(format = "csv"): Promise<{
  download_url: string;
  expires_in_seconds: number;
}> {
  const res = await apiClient.post<{ download_url: string; expires_in_seconds: number }>(
    API_ENDPOINTS.CONTACTS.EXPORTS,
    { format }
  );
  return res.data;
}

