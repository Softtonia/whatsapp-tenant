import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid business email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  tenantId: z
    .string()
    .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid business email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid business email address"),
    token: z.string().min(1, "Password reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9!@#$%^&*]/, "Password must contain at least one number or symbol"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, "Invitation token is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9!@#$%^&*]/, "Password must contain at least one number or symbol"),
    password_confirmation: z.string().min(1, "Please confirm your password"),
    phone_number: z.string().min(1, "Phone number is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export const mfaVerifySchema = z.object({
  challenge_token: z.string().min(1, "Challenge token is required"),
  code: z
    .string()
    .min(6, "Verification code must be 6 digits")
    .max(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Must be a 6-digit numeric code"),
});

export type MfaVerifyFormData = z.infer<typeof mfaVerifySchema>;

export const reauthSchema = z.object({
  password: z.string().min(1, "Password is required to restore session"),
});

export type ReauthFormData = z.infer<typeof reauthSchema>;
