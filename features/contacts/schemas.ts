import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Contact name must be at least 2 characters"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .regex(/^\+?[1-9]\d{1,14}$/, "Must be a valid international phone format (e.g. +919876543210)"),
  email: z.string().email("Must be a valid email address").optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  custom_attributes: z.record(z.string(), z.unknown()).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const bulkActionSchema = z.object({
  action: z.enum(["assign_tags", "assign_owner", "archive"]),
  contact_ids: z.array(z.union([z.string(), z.number()])).min(1, "Select at least one contact"),
  tags: z.array(z.string()).optional(),
  owner_id: z.union([z.string(), z.number()]).optional(),
});

export type BulkActionFormData = z.infer<typeof bulkActionSchema>;

export const tagCreateSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters"),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be a valid hex color code"),
});

export type TagCreateFormData = z.infer<typeof tagCreateSchema>;

export const contactNoteSchema = z.object({
  note: z.string().min(1, "Note content cannot be empty"),
});

export type ContactNoteFormData = z.infer<typeof contactNoteSchema>;

