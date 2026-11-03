import { z } from "zod";

export const templateButtonSchema = z.object({
  type: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
  text: z.string().min(1, "Button text is required"),
  url: z.string().optional().or(z.literal("")),
  phone_number: z.string().optional().or(z.literal("")),
});

export const templateCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Template name must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Name must contain only lowercase letters, numbers, and underscores"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
  language: z.string(),
  header_text: z.string().optional(),
  body_text: z.string().min(5, "Body text must be at least 5 characters"),
  footer_text: z.string().optional(),
  buttons: z.array(templateButtonSchema),
});

export type TemplateCreateData = z.infer<typeof templateCreateSchema>;
