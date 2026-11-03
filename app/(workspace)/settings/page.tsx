"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, Palette, Bell } from "lucide-react";
import { useWorkspaceSettingsQuery } from "@/features/settings/hooks";
import { BusinessProfileForm } from "@/features/settings/components/business-profile-form";
import { WorkspacePreferencesForm } from "@/features/settings/components/workspace-preferences-form";
import { WorkspaceBrandingForm } from "@/features/settings/components/workspace-branding-form";
import { NotificationPreferencesForm } from "@/features/settings/components/notification-preferences-form";

export default function SettingsPage() {
  const { data: settings, isLoading } = useWorkspaceSettingsQuery();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title="Workspace Settings & Configuration"
        description="Configure business details, customer support operating hours, white-label branding, and alerts."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Workspace Settings" },
        ]}
      />

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full sm:w-[600px] grid-cols-4 h-10">
          <TabsTrigger value="profile" className="text-xs font-semibold gap-1.5">
            <Building2 className="size-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="hours" className="text-xs font-semibold gap-1.5">
            <Clock className="size-3.5" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs font-semibold gap-1.5">
            <Palette className="size-3.5" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-semibold gap-1.5">
            <Bell className="size-3.5" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <BusinessProfileForm
            profile={settings?.profile}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="hours" className="mt-4">
          <WorkspacePreferencesForm
            preferences={settings?.preferences}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <WorkspaceBrandingForm
            branding={settings?.branding}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationPreferencesForm
            preferences={settings?.notification_preferences}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
