import { z } from "zod";

export const campaignCreateSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  template_id: z.union([z.string(), z.number()], {
    error: "Please select an approved WhatsApp template",
  }),
  phone_number_id: z.union([z.string(), z.number()]).default(1),
  audience_tags: z.array(z.string()).min(1, "Select at least one audience segment or tag"),
  variable_mapping: z.record(z.string(), z.string()).optional(),
  send_type: z.enum(["now", "schedule"]).default("now"),
  scheduled_at: z.string().optional().or(z.literal("")),
});

export type CampaignCreateData = z.infer<typeof campaignCreateSchema>;

export const campaignTestSchema = z.object({
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Must be a valid international phone format (e.g. +919876543210)"),
});

export type CampaignTestData = z.infer<typeof campaignTestSchema>;

