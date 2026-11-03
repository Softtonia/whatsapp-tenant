import { describe, it, expect } from "vitest";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateAvailabilitySchema,
} from "@/features/team/schemas";
import { teamKeys } from "@/features/team/hooks";
import {
  directConnectSchema,
  embeddedSignupCallbackSchema,
} from "@/features/whatsapp-connections/schemas";
import { whatsappConnectionKeys } from "@/features/whatsapp-connections/hooks";
import {
  changePlanSchema,
  cancelSubscriptionSchema,
} from "@/features/billing/schemas";
import { billingKeys } from "@/features/billing/hooks";
import {
  businessProfileSchema,
  workspacePreferencesSchema,
  workspaceBrandingSchema,
  notificationPreferencesSchema,
  userProfileSchema,
  changePasswordSchema,
} from "@/features/settings/schemas";
import { settingsKeys } from "@/features/settings/hooks";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { getMockResponse } from "@/src/lib/api/mock";
import type { TeamMember, TeamInvitation } from "@/types/team";
import type { WhatsAppAccount, WhatsAppPhoneNumber } from "@/types/whatsapp";
import type { SubscriptionOverview, QuotaUsageSummary, Invoice } from "@/types/billing";
import type {
  BusinessProfile,
  WorkspacePreferences,
  WorkspaceBranding,
  NotificationPreferences,
  UserSession,
} from "@/types/settings";

describe("Team Management, WhatsApp Connections, Billing, and Workspace Settings", () => {
  describe("Team Management", () => {
    it("validates team invitation schema with valid email and role", () => {
      const valid = {
        email: "support.agent@company.com",
        role: "agent" as const,
      };
      const result = inviteMemberSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects team invitation with invalid email or empty role", () => {
      const invalid = {
        email: "invalid-email",
        role: "superuser",
      };
      const result = inviteMemberSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.issues.map((i) => i.path[0]);
        expect(fields).toContain("email");
        expect(fields).toContain("role");
      }
    });

    it("validates role update schema", () => {
      expect(updateMemberRoleSchema.safeParse({ role: "admin" }).success).toBe(true);
      expect(updateMemberRoleSchema.safeParse({ role: "agent" }).success).toBe(true);
      expect(updateMemberRoleSchema.safeParse({ role: "viewer" }).success).toBe(true);
      expect(updateMemberRoleSchema.safeParse({ role: "owner" }).success).toBe(true);
      expect(updateMemberRoleSchema.safeParse({ role: "superadmin" }).success).toBe(false);
    });

    it("validates availability update schema", () => {
      expect(updateAvailabilitySchema.safeParse({ availability: "online" }).success).toBe(true);
      expect(updateAvailabilitySchema.safeParse({ availability: "busy" }).success).toBe(true);
      expect(updateAvailabilitySchema.safeParse({ availability: "offline" }).success).toBe(true);
      expect(updateAvailabilitySchema.safeParse({ availability: "away" }).success).toBe(false);
    });

    it("builds consistent tenant-scoped query keys for team", () => {
      expect(teamKeys.all).toEqual(["team"]);
      expect(teamKeys.members("tenant_123")).toEqual(["team", "tenant_123", "members"]);
      expect(teamKeys.memberList("tenant_123", { role: "admin" })).toEqual([
        "team",
        "tenant_123",
        "members",
        { role: "admin" },
      ]);
      expect(teamKeys.invitations("tenant_123")).toEqual(["team", "tenant_123", "invitations"]);
      expect(teamKeys.roles("tenant_123")).toEqual(["team", "tenant_123", "roles"]);
    });

    it("resolves team members and invitations via mock adapter", () => {
      const membersResp = getMockResponse<TeamMember[]>(API_ENDPOINTS.TEAM.MEMBERS, "GET");
      expect(membersResp).not.toBeNull();
      expect(membersResp?.success).toBe(true);
      expect(Array.isArray(membersResp?.data)).toBe(true);
      expect(membersResp?.data?.[0].role).toBe("admin");

      const invitesResp = getMockResponse<TeamInvitation[]>(API_ENDPOINTS.TEAM.INVITATIONS, "GET");
      expect(invitesResp).not.toBeNull();
      expect(invitesResp?.success).toBe(true);
      expect(Array.isArray(invitesResp?.data)).toBe(true);
      expect(invitesResp?.data?.[0].status).toBe("pending");
    });
  });

  describe("WhatsApp Connections & Diagnostics", () => {
    it("validates direct Meta credential connection schema", () => {
      const validCredentials = {
        waba_id: "109876543210987",
        phone_number_id: "105432109876543",
        display_phone_number: "+15550192834",
        access_token: "EAABwzL1234567890abcdefghijklmnopqrstuvwxyz",
        set_as_default: true,
      };

      const result = directConnectSchema.safeParse(validCredentials);
      expect(result.success).toBe(true);
    });

    it("rejects direct Meta connection schema with missing or short credentials", () => {
      const invalidCredentials = {
        waba_id: "12",
        phone_number_id: "34",
        display_phone_number: "phone",
        access_token: "short_tok",
        set_as_default: false,
      };

      const result = directConnectSchema.safeParse(invalidCredentials);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues.map((i) => i.path[0]);
        expect(issues).toContain("waba_id");
        expect(issues).toContain("phone_number_id");
        expect(issues).toContain("display_phone_number");
        expect(issues).toContain("access_token");
      }
    });

    it("validates embedded signup OAuth callback schema", () => {
      const validCallback = {
        code: "meta_oauth_auth_code_xyz123",
        state: "csrf_security_state_abc",
        waba_id: "109876543210987",
        phone_number_id: "105432109876543",
        set_as_default: true,
      };

      const result = embeddedSignupCallbackSchema.safeParse(validCallback);
      expect(result.success).toBe(true);
    });

    it("builds consistent query keys for whatsapp connections", () => {
      expect(whatsappConnectionKeys.accounts("tenant_abc")).toEqual([
        "whatsapp-connections",
        "tenant_abc",
        "accounts",
      ]);
      expect(whatsappConnectionKeys.numbers("tenant_abc")).toEqual([
        "whatsapp-connections",
        "tenant_abc",
        "numbers",
      ]);
      expect(whatsappConnectionKeys.health("tenant_abc")).toEqual([
        "whatsapp-connections",
        "tenant_abc",
        "health",
      ]);
    });

    it("resolves WhatsApp accounts, numbers, and health diagnostics via mock adapter", () => {
      const accounts = getMockResponse<WhatsAppAccount[]>(API_ENDPOINTS.WHATSAPP.ACCOUNTS, "GET");
      expect(accounts).not.toBeNull();
      expect(accounts?.success).toBe(true);
      expect(accounts?.data?.[0].status).toBe("connected");

      const numbers = getMockResponse<WhatsAppPhoneNumber[]>(API_ENDPOINTS.WHATSAPP.NUMBERS, "GET");
      expect(numbers).not.toBeNull();
      expect(numbers?.success).toBe(true);
      expect(numbers?.data?.[0].quality_rating).toBe("GREEN");

      const health = getMockResponse<{ status: string; messaging_limit: string }>(
        API_ENDPOINTS.WHATSAPP.HEALTH,
        "GET"
      );
      expect(health).not.toBeNull();
      expect(health?.success).toBe(true);
      expect(health?.data?.status).toBe("connected");
      expect(health?.data?.messaging_limit).toBe("TIER_10K");
    });
  });

  describe("Subscription & Billing", () => {
    it("validates change plan schema", () => {
      const validUpgrade = {
        plan_id: "enterprise",
        billing_cycle: "annual" as const,
      };

      const result = changePlanSchema.safeParse(validUpgrade);
      expect(result.success).toBe(true);
    });

    it("validates cancel subscription schema with reason", () => {
      const validCancel = {
        reason: "Migrating our marketing stack to custom self-hosted infra.",
      };

      const result = cancelSubscriptionSchema.safeParse(validCancel);
      expect(result.success).toBe(true);
    });

    it("builds consistent billing query keys", () => {
      expect(billingKeys.subscription("t1")).toEqual(["billing", "t1", "subscription"]);
      expect(billingKeys.usage("t1")).toEqual(["billing", "t1", "usage"]);
      expect(billingKeys.invoices("t1")).toEqual(["billing", "t1", "invoices"]);
    });

    it("resolves subscription details, quotas, and invoices via mock adapter", () => {
      const sub = getMockResponse<SubscriptionOverview>(API_ENDPOINTS.BILLING.SUBSCRIPTION, "GET");
      expect(sub).not.toBeNull();
      expect(sub?.success).toBe(true);
      expect(sub?.data?.plan.tier).toBe("growth");
      expect(sub?.data?.status).toBe("active");

      const usage = getMockResponse<QuotaUsageSummary>(API_ENDPOINTS.BILLING.USAGE, "GET");
      expect(usage).not.toBeNull();
      expect(usage?.success).toBe(true);
      expect(usage?.data?.contacts.used).toBe(3820);
      expect(usage?.data?.contacts.limit).toBe(50000);

      const invoices = getMockResponse<Invoice[]>(API_ENDPOINTS.BILLING.INVOICES, "GET");
      expect(invoices).not.toBeNull();
      expect(invoices?.success).toBe(true);
      expect(invoices?.data?.[0].status).toBe("paid");
    });
  });

  describe("Workspace Settings & Security", () => {
    it("validates business profile schema", () => {
      const validProfile = {
        name: "Apex Retail Solutions Inc.",
        email: "support@apexretail.com",
        phone: "+14155550199",
        address: "742 Evergreen Terrace, Suite 400",
        country: "US",
        currency: "USD",
      };

      const result = businessProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("validates workspace preferences and weekly business hours schema", () => {
      const validPrefs = {
        timezone: "America/Los_Angeles",
        locale: "en",
        date_format: "YYYY-MM-DD",
        time_format: "12h",
        default_whatsapp_account_id: 1,
        business_hours: {
          monday: { start: "09:00", end: "18:00", open: true },
          tuesday: { start: "09:00", end: "18:00", open: true },
          wednesday: { start: "09:00", end: "18:00", open: true },
          thursday: { start: "09:00", end: "18:00", open: true },
          friday: { start: "09:00", end: "17:00", open: true },
          saturday: { start: "10:00", end: "14:00", open: false },
          sunday: { start: "10:00", end: "14:00", open: false },
        },
      };

      const result = workspacePreferencesSchema.safeParse(validPrefs);
      expect(result.success).toBe(true);
    });

    it("validates workspace branding schema with valid hex codes", () => {
      const validBranding = {
        brand_name: "Apex Store",
        primary_color: "#25D366",
        secondary_color: "#128C7E",
        support_email: "help@apexstore.com",
      };

      const result = workspaceBrandingSchema.safeParse(validBranding);
      expect(result.success).toBe(true);
    });

    it("rejects invalid hex codes in branding schema", () => {
      const invalidBranding = {
        brand_name: "Apex Store",
        primary_color: "green", // Not hex
        secondary_color: "#128C7E",
        support_email: "help@apexstore.com",
      };

      const result = workspaceBrandingSchema.safeParse(invalidBranding);
      expect(result.success).toBe(false);
    });

    it("validates notification preferences schema", () => {
      const validNotifications = {
        inbound_message_alerts: true,
        campaign_delivery_reports: true,
        quota_warning_alerts: true,
        email_daily_digest: true,
        sound_notifications: false,
        security_alerts: true,
      };

      const result = notificationPreferencesSchema.safeParse(validNotifications);
      expect(result.success).toBe(true);
    });

    it("validates user profile and password change schemas", () => {
      const validUser = {
        name: "Gaurav Kumar",
        email: "gaurav@example.com",
        phone: "+919876543210",
      };
      expect(userProfileSchema.safeParse(validUser).success).toBe(true);

      const validPasswordChange = {
        current_password: "CurrentSecurePassword123!",
        new_password: "NewSuperSecurePassword456!",
        confirm_password: "NewSuperSecurePassword456!",
      };
      expect(changePasswordSchema.safeParse(validPasswordChange).success).toBe(true);

      const mismatchPassword = {
        current_password: "CurrentSecurePassword123!",
        new_password: "NewSuperSecurePassword456!",
        confirm_password: "DifferentPassword789!",
      };
      expect(changePasswordSchema.safeParse(mismatchPassword).success).toBe(false);
    });

    it("builds consistent query keys for settings", () => {
      expect(settingsKeys.all).toEqual(["settings"]);
      expect(settingsKeys.overview("tenant_123")).toEqual(["settings", "tenant_123", "overview"]);
      expect(settingsKeys.branding("tenant_123")).toEqual(["settings", "tenant_123", "branding"]);
      expect(settingsKeys.notifications("tenant_123")).toEqual([
        "settings",
        "tenant_123",
        "notifications",
      ]);
      expect(settingsKeys.sessions).toEqual(["user-sessions"]);
    });

    it("resolves settings, preferences, and user sessions via mock adapter", () => {
      const profile = getMockResponse<BusinessProfile>(API_ENDPOINTS.SETTINGS.PROFILE, "GET");
      expect(profile).not.toBeNull();
      expect(profile?.success).toBe(true);
      expect(profile?.data?.name).toBe("Softtonia Solutions Corp");

      const preferences = getMockResponse<WorkspacePreferences>(
        API_ENDPOINTS.SETTINGS.PREFERENCES,
        "GET"
      );
      expect(preferences).not.toBeNull();
      expect(preferences?.success).toBe(true);
      expect(preferences?.data?.timezone).toBe("Asia/Kolkata");

      const branding = getMockResponse<WorkspaceBranding>(API_ENDPOINTS.SETTINGS.BRANDING, "GET");
      expect(branding).not.toBeNull();
      expect(branding?.success).toBe(true);
      expect(branding?.data?.primary_color).toBe("#10b981");

      const notifications = getMockResponse<NotificationPreferences>(
        API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
        "GET"
      );
      expect(notifications).not.toBeNull();
      expect(notifications?.success).toBe(true);
      expect(notifications?.data?.inbound_message_alerts).toBe(true);

      const sessions = getMockResponse<UserSession[]>(API_ENDPOINTS.USERS.SESSIONS, "GET");
      expect(sessions).not.toBeNull();
      expect(sessions?.success).toBe(true);
      expect(sessions?.data?.[0].is_current).toBe(true);
    });
  });
});
