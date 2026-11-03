import { z } from "zod";

export const directConnectSchema = z.object({
  waba_id: z.string().min(5, "Valid Meta WhatsApp Business Account ID is required"),
  phone_number_id: z.string().min(5, "Valid WhatsApp Phone Number ID is required"),
  display_phone_number: z
    .string()
    .min(7, "Display phone number must be at least 7 characters")
    .regex(/^\+?[1-9]\d{1,14}$/, "Must be in international E.164 format (e.g. +919876543210)"),
  access_token: z
    .string()
    .min(20, "Meta permanent System User Access Token is required (min 20 characters)"),
  set_as_default: z.boolean(),
});

export type DirectConnectFormData = z.infer<typeof directConnectSchema>;

export const embeddedSignupCallbackSchema = z.object({
  code: z.string().min(1, "OAuth authorization code is required"),
  state: z.string().min(1, "Security state token is required"),
  waba_id: z.string().optional(),
  phone_number_id: z.string().optional(),
  set_as_default: z.boolean(),
});

export type EmbeddedSignupCallbackData = z.infer<typeof embeddedSignupCallbackSchema>;
