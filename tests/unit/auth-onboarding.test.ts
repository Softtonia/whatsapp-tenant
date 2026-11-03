import { describe, it, expect, beforeEach } from "vitest";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  mfaVerifySchema,
  reauthSchema,
  acceptInvitationSchema,
} from "@/features/auth/schemas";
import {
  businessProfileSchema,
  regionalPreferencesSchema,
  whatsappConnectionSchema,
  teamInvitationsSchema,
} from "@/features/onboarding/schemas";
import { useAuthStore } from "@/lib/auth/store";
import { useTenantStore } from "@/lib/tenant/store";

describe("Authentication Schemas & Validation", () => {
  it("validates login credentials correctly", () => {
    const valid = loginSchema.safeParse({
      email: "agent@company.com",
      password: "password123",
      tenantId: "1",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = loginSchema.safeParse({
      email: "agent@company.com",
      password: "123",
    });
    expect(shortPassword.success).toBe(false);
  });

  it("validates forgot password email input", () => {
    const valid = forgotPasswordSchema.safeParse({
      email: "owner@enterprise.com",
    });
    expect(valid.success).toBe(true);

    const invalid = forgotPasswordSchema.safeParse({
      email: "not-an-email",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces strong password and password confirmation matching on reset", () => {
    const matchingValid = resetPasswordSchema.safeParse({
      email: "user@example.com",
      token: "secret-token-123",
      password: "StrongPassword123!",
      password_confirmation: "StrongPassword123!",
    });
    expect(matchingValid.success).toBe(true);

    const mismatch = resetPasswordSchema.safeParse({
      email: "user@example.com",
      token: "secret-token-123",
      password: "StrongPassword123!",
      password_confirmation: "DifferentPassword123!",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.message).toContain("Passwords do not match");
    }

    const missingUppercase = resetPasswordSchema.safeParse({
      email: "user@example.com",
      token: "secret-token-123",
      password: "weakpassword123!",
      password_confirmation: "weakpassword123!",
    });
    expect(missingUppercase.success).toBe(false);
  });

  it("validates invitation acceptance payload correctly", () => {
    const valid = acceptInvitationSchema.safeParse({
      token: "inv_test_token_123",
      first_name: "John",
      last_name: "Doe",
      password: "SecurePass123!",
      password_confirmation: "SecurePass123!",
      phone_number: "+1234567890",
    });
    expect(valid.success).toBe(true);

    const mismatch = acceptInvitationSchema.safeParse({
      token: "inv_test_token_123",
      first_name: "John",
      last_name: "Doe",
      password: "SecurePass123!",
      password_confirmation: "Mismatch123!",
      phone_number: "+1234567890",
    });
    expect(mismatch.success).toBe(false);
  });

  it("validates 6-digit MFA OTP numeric code", () => {
    const valid = mfaVerifySchema.safeParse({
      challenge_token: "challenge-token-xyz",
      code: "123456",
    });
    expect(valid.success).toBe(true);

    const nonNumeric = mfaVerifySchema.safeParse({
      challenge_token: "challenge-token-xyz",
      code: "12A456",
    });
    expect(nonNumeric.success).toBe(false);

    const tooShort = mfaVerifySchema.safeParse({
      challenge_token: "challenge-token-xyz",
      code: "12345",
    });
    expect(tooShort.success).toBe(false);
  });

  it("validates reauthentication password schema", () => {
    const valid = reauthSchema.safeParse({ password: "my-secure-password" });
    expect(valid.success).toBe(true);

    const empty = reauthSchema.safeParse({ password: "" });
    expect(empty.success).toBe(false);
  });
});

describe("Onboarding Schemas & Validation", () => {
  it("validates business profile requirements", () => {
    const valid = businessProfileSchema.safeParse({
      company_name: "Acme WhatsApp Ltd",
      company_email: "support@acme.com",
      contact_number: "+91 98765 43210",
      country: "India",
    });
    expect(valid.success).toBe(true);

    const emptyName = businessProfileSchema.safeParse({
      company_name: "A",
      company_email: "support@acme.com",
      contact_number: "+91 98765 43210",
      country: "India",
    });
    expect(emptyName.success).toBe(false);
  });

  it("validates regional preferences", () => {
    const valid = regionalPreferencesSchema.safeParse({
      timezone: "Asia/Kolkata",
      currency: "INR",
    });
    expect(valid.success).toBe(true);
  });

  it("validates WhatsApp connection and deferred mode", () => {
    // When deferred, phone number can be omitted
    const deferred = whatsappConnectionSchema.safeParse({
      defer_whatsapp: true,
    });
    expect(deferred.success).toBe(true);

    // When not deferred, phone number is required
    const missingPhone = whatsappConnectionSchema.safeParse({
      defer_whatsapp: false,
      phone_number: "",
    });
    expect(missingPhone.success).toBe(false);

    const validPhone = whatsappConnectionSchema.safeParse({
      defer_whatsapp: false,
      phone_number: "+91 98765 43210",
      waba_id: "waba_123",
    });
    expect(validPhone.success).toBe(true);
  });

  it("validates team invitations schema", () => {
    const valid = teamInvitationsSchema.safeParse({
      invitees: [
        { email: "admin@company.com", role: "admin" },
        { email: "agent@company.com", role: "agent" },
      ],
    });
    expect(valid.success).toBe(true);

    const invalidEmail = teamInvitationsSchema.safeParse({
      invitees: [{ email: "bad-email", role: "agent" }],
    });
    expect(invalidEmail.success).toBe(false);
  });
});

describe("Auth Store & Tenant Context Lifecycle", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("manages authenticated user credentials without localStorage storage", () => {
    const store = useAuthStore.getState();
    expect(store.isAuthenticated).toBe(false);
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();

    store.setCredentials("mock-jwt-token", {
      id: 1,
      name: "Vijay Kumar",
      email: "vijay@company.com",
      role: "owner",
    });

    const updated = useAuthStore.getState();
    expect(updated.isAuthenticated).toBe(true);
    expect(updated.token).toBe("mock-jwt-token");
    expect(updated.user?.name).toBe("Vijay Kumar");
    expect(updated.isSessionExpired).toBe(false);
  });

  it("transitions smoothly into session expired state on 401 without destroying user context", () => {
    const store = useAuthStore.getState();
    store.setCredentials("token-123", {
      id: 1,
      name: "Vijay Kumar",
      email: "vijay@company.com",
      role: "admin",
    });

    store.setSessionExpired(true);

    const expiredState = useAuthStore.getState();
    expect(expiredState.isSessionExpired).toBe(true);
    expect(expiredState.isAuthenticated).toBe(false);
    expect(expiredState.token).toBeNull();
    // User profile is preserved so reauth modal knows who is logging in
    expect(expiredState.user?.email).toBe("vijay@company.com");
  });

  it("clears all state on complete logout", () => {
    const store = useAuthStore.getState();
    store.setCredentials("token-123", {
      id: 1,
      name: "Vijay",
      email: "vijay@test.com",
      role: "agent",
    });

    store.logout();

    const loggedOut = useAuthStore.getState();
    expect(loggedOut.isAuthenticated).toBe(false);
    expect(loggedOut.token).toBeNull();
    expect(loggedOut.user).toBeNull();
    expect(loggedOut.mfaChallenge).toBeNull();
  });

  it("handles MFA challenges cleanly", () => {
    const store = useAuthStore.getState();
    store.setMfaChallenge({
      challengeToken: "mfa-challenge-999",
      email: "mfa.user@company.com",
    });

    expect(useAuthStore.getState().mfaChallenge?.challengeToken).toBe("mfa-challenge-999");
    expect(useAuthStore.getState().mfaChallenge?.email).toBe("mfa.user@company.com");

    store.setMfaChallenge(null);
    expect(useAuthStore.getState().mfaChallenge).toBeNull();
  });

  it("allows setting authorized workspace in TenantStore", () => {
    const tenantStore = useTenantStore.getState();
    const newTenant = {
      id: "99",
      name: "Enterprise Branch UAE",
      slug: "enterprise-uae",
      status: "active" as const,
      timezone: "Asia/Dubai",
      currency: "AED",
    };

    tenantStore.setActiveTenant(newTenant);
    expect(useTenantStore.getState().activeTenant?.name).toBe("Enterprise Branch UAE");
    expect(useTenantStore.getState().activeTenant?.currency).toBe("AED");
  });
});

