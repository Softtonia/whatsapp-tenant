"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useAuthStore } from "@/lib/auth/store";
import { useUserSessionsQuery } from "@/features/settings/hooks";
import { UserProfileForm } from "@/features/profile/components/user-profile-form";
import { ChangePasswordForm } from "@/features/profile/components/change-password-form";
import { MfaSettingsCard } from "@/features/profile/components/mfa-settings-card";
import { ActiveSessionsTable } from "@/features/profile/components/active-sessions-table";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const { data: sessions, isLoading: loadingSessions } = useUserSessionsQuery();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Profile, Password & Security"
        description="Manage your agent profile, account credentials, two-factor authentication, and active browser sessions."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Profile & Security" },
        ]}
      />

      {/* Profile Form */}
      <UserProfileForm user={user} />

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
