"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Save, CheckCircle2 } from "lucide-react";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormData,
} from "../schemas";
import { useUpdateNotificationPreferencesMutation } from "../hooks";
import type { NotificationPreferences } from "@/types/settings";

interface NotificationPreferencesFormProps {
  preferences?: NotificationPreferences;
  isLoading?: boolean;
}

export function NotificationPreferencesForm({
  preferences,
  isLoading,
}: NotificationPreferencesFormProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted/40 w-48 rounded" />
          <div className="h-32 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <NotificationInnerForm
      key={preferences ? "loaded" : "defaults"}
      preferences={preferences}
    />
  );
}

function NotificationInnerForm({
  preferences,
}: {
  preferences?: NotificationPreferences;
}) {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const updateMutation = useUpdateNotificationPreferencesMutation();

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      inbound_message_alerts: preferences?.inbound_message_alerts ?? true,
      campaign_delivery_reports: preferences?.campaign_delivery_reports ?? true,
      quota_warning_alerts: preferences?.quota_warning_alerts ?? true,
      email_daily_digest: preferences?.email_daily_digest ?? false,
      sound_notifications: preferences?.sound_notifications ?? true,
      security_alerts: preferences?.security_alerts ?? true,
    },
  });

  const onSubmit = async (data: NotificationPreferencesFormData) => {
    await updateMutation.mutateAsync(data);
    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 4000);
  };

  const ITEMS = [
    {
      id: "inbound_message_alerts" as const,
      label: "Inbound WhatsApp Message Notifications",
      desc: "Receive desktop notifications when a customer sends a new message to your inbox.",
    },
    {
      id: "sound_notifications" as const,
      label: "Sound Alert on New Message",
      desc: "Play an audible notification chime when incoming messages arrive.",
    },
    {
      id: "campaign_delivery_reports" as const,
      label: "Campaign Broadcast Delivery Reports",
      desc: "Alert administrators when a mass WhatsApp broadcast campaign completes or reports failures.",
    },
    {
      id: "quota_warning_alerts" as const,
      label: "Messaging Limit & Quota Threshold Alerts",
      desc: "Receive urgent warnings when conversations reach 85% and 95% of your plan limit.",
    },
    {
      id: "email_daily_digest" as const,
      label: "Email Daily Executive Summary",
      desc: "Receive a morning digest email with key conversation counts, resolved tickets, and leads.",
    },
    {
      id: "security_alerts" as const,
      label: "Workspace Security & Login Audits",
      desc: "Notify administrators immediately upon new device logins or role permission changes.",
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bell className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Notification &amp; Alert Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Manage how and when your team receives real-time customer updates and threshold notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-3">
          {ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/70 hover:bg-muted/10 transition-colors cursor-pointer block"
            >
              <input
                type="checkbox"
                {...register(item.id)}
                className="size-4 rounded border-input text-primary focus:ring-primary mt-0.5"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-semibold text-foreground block">
                  {item.label}
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed block">
                  {item.desc}
                </span>
              </div>
            </label>
          ))}
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Notification preferences saved
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={updateMutation.isPending || !isDirty}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Save className="size-3.5" />
            {updateMutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

