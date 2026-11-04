"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuthStore } from "@/lib/auth/store";
import { useUserSessionsQuery } from "@/features/settings/hooks";
import { UserProfileForm } from "@/features/profile/components/user-profile-form";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { MfaSettingsCard } from "@/features/profile/components/mfa-settings-card";
import { ActiveSessionsTable } from "@/features/profile/components/active-sessions-table";
import { SubscriptionSection } from "@/features/profile/components/subscription-section";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: sessions, isLoading: loadingSessions } = useUserSessionsQuery();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Profile, Security & Subscription"
        description="Manage your agent profile, account credentials, subscription plan, quota limits, and security settings."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Profile & Subscription" },
        ]}
      />

      {/* User Profile Form */}
      <UserProfileForm user={user} />

      {/* Tenant Subscription, Quota Limits & History Section */}
      <SubscriptionSection />

      {/* Password Change Form */}
      <ChangePasswordForm />

      {/* Multi-Factor Authentication Settings */}
      <MfaSettingsCard isMfaEnabled={false} />

      {/* Active Login Sessions Table */}
      <ActiveSessionsTable
        sessions={sessions || []}
        isLoading={loadingSessions}
      />
    </div>
  );
}
