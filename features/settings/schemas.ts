import { z } from "zod";

export const businessProfileSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("A valid business email address is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

export const dayScheduleSchema = z.object({
  start: z.string(),
  end: z.string(),
  open: z.boolean(),
});

export const workspacePreferencesSchema = z.object({
  timezone: z.string(),
  locale: z.string(),
  date_format: z.string(),
  time_format: z.string(),
  default_whatsapp_account_id: z.union([z.string(), z.number()]).optional(),
  business_hours: z.object({
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  }),
});

export type WorkspacePreferencesFormData = z.infer<typeof workspacePreferencesSchema>;

export const workspaceBrandingSchema = z.object({
  brand_name: z.string().min(2, "Brand name must be at least 2 characters"),
  primary_color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be a valid hex color code (e.g. #10b981)"),
  secondary_color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be a valid hex color code"),
  support_email: z.string().email("A valid support email is required"),
});

export type WorkspaceBrandingFormData = z.infer<typeof workspaceBrandingSchema>;

export const notificationPreferencesSchema = z.object({
  inbound_message_alerts: z.boolean(),
  campaign_delivery_reports: z.boolean(),
  quota_warning_alerts: z.boolean(),
  email_daily_digest: z.boolean(),
  sound_notifications: z.boolean(),
  security_alerts: z.boolean(),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;

export const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Current password must be at least 6 characters"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm password must match"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
