import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("A valid business email address is required"),
  role: z.enum(["admin", "agent", "viewer"], {
    error: "Please select a valid role",
  }),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "admin", "agent", "viewer"]),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>;

export const updateAvailabilitySchema = z.object({
  availability: z.enum(["online", "busy", "offline"]),
});

export type UpdateAvailabilityData = z.infer<typeof updateAvailabilitySchema>;

