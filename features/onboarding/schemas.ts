import { z } from "zod";

export const businessProfileSchema = z.object({
  company_name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  company_email: z
    .string()
    .min(1, "Company email is required")
    .email("Enter a valid company email address"),
  contact_number: z
    .string()
    .min(7, "Enter a valid phone number with country code")
    .max(20, "Phone number is too long"),
  address: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

export const regionalPreferencesSchema = z.object({
  timezone: z.string().min(1, "Please select a timezone"),
  currency: z.string().min(1, "Please select a currency"),
});

export type RegionalPreferencesFormData = z.infer<typeof regionalPreferencesSchema>;

export const whatsappConnectionSchema = z
  .object({
    defer_whatsapp: z.boolean(),
    phone_number: z.string().optional(),
    waba_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.defer_whatsapp) return true;
      return Boolean(data.phone_number && data.phone_number.trim().length >= 8);
    },
    {
      message: "Phone number is required when not skipping WhatsApp setup",
      path: ["phone_number"],
    }
  );

export type WhatsAppConnectionFormData = z.infer<typeof whatsappConnectionSchema>;

export const inviteeRowSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["admin", "agent", "viewer"]),
});

export const teamInvitationsSchema = z.object({
  invitees: z.array(inviteeRowSchema),
});

export type TeamInvitationsFormData = z.infer<typeof teamInvitationsSchema>;
