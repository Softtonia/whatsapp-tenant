"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Save, CheckCircle2 } from "lucide-react";
import { workspacePreferencesSchema, type WorkspacePreferencesFormData } from "../schemas";
import { useUpdateWorkspacePreferencesMutation } from "../hooks";
import type { WorkspacePreferences } from "@/types/settings";

interface WorkspacePreferencesFormProps {
  preferences?: WorkspacePreferences;
  isLoading?: boolean;
}

const DAYS = [
  { key: "monday" as const, label: "Monday" },
  { key: "tuesday" as const, label: "Tuesday" },
  { key: "wednesday" as const, label: "Wednesday" },
  { key: "thursday" as const, label: "Thursday" },
  { key: "friday" as const, label: "Friday" },
  { key: "saturday" as const, label: "Saturday" },
  { key: "sunday" as const, label: "Sunday" },
];

export function WorkspacePreferencesForm({
  preferences,
  isLoading,
}: WorkspacePreferencesFormProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted/40 w-48 rounded" />
          <div className="h-40 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <PreferencesInnerForm
      key={preferences?.timezone || "default"}
      preferences={preferences}
    />
  );
}

function PreferencesInnerForm({
  preferences,
}: {
  preferences?: WorkspacePreferences;
}) {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const updateMutation = useUpdateWorkspacePreferencesMutation();

  const defaultHours = {
    monday: { start: "09:00", end: "18:00", open: true },
    tuesday: { start: "09:00", end: "18:00", open: true },
    wednesday: { start: "09:00", end: "18:00", open: true },
    thursday: { start: "09:00", end: "18:00", open: true },
    friday: { start: "09:00", end: "18:00", open: true },
    saturday: { start: "10:00", end: "15:00", open: true },
    sunday: { start: "10:00", end: "14:00", open: false },
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
  } = useForm<WorkspacePreferencesFormData>({
    resolver: zodResolver(workspacePreferencesSchema),
    defaultValues: {
      timezone: preferences?.timezone || "Asia/Kolkata",
      locale: preferences?.locale || "en",
      date_format: preferences?.date_format || "DD/MM/YYYY",
      time_format: preferences?.time_format || "12h",
      business_hours: preferences?.business_hours || defaultHours,
    },
  });

  const watchedHours = watch("business_hours");

  const onSubmit = async (data: WorkspacePreferencesFormData) => {
    await updateMutation.mutateAsync(data);
    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Workspace Preferences &amp; Operating Hours
              </CardTitle>
              <CardDescription className="text-xs">
                Configure timezone display, date formats, and store business hours used by AI responders and automation rules
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Workspace Timezone *
              </Label>
              <select
                {...register("timezone")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="America/New_York">America/New_York (EST, UTC-5)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST, UTC-8)</option>
                <option value="Europe/London">Europe/London (GMT, UTC+0)</option>
                <option value="Europe/Paris">Europe/Paris (CET, UTC+1)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Date Format
              </Label>
              <select
                {...register("date_format")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 02/11/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/02/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-02)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Time Format
              </Label>
              <select
                {...register("time_format")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
              >
                <option value="12h">12-Hour (AM / PM)</option>
                <option value="24h">24-Hour Military (00:00 - 23:59)</option>
              </select>
            </div>
          </div>

          {/* Business Hours Schedule */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div>
              <span className="font-bold text-foreground text-xs block">
                Weekly Customer Service Hours
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Automated After-Hours workflows and Out-of-Office AI greetings evaluate against this schedule.
              </p>
            </div>

            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-2">
              {DAYS.map((day) => {
                const isOpen = watchedHours?.[day.key]?.open;

                return (
                  <div
                    key={day.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-3 w-32">
                      <input
                        type="checkbox"
                        {...register(`business_hours.${day.key}.open` as const)}
                        className="size-4 rounded border-input text-primary"
                      />
                      <span className={`font-semibold ${isOpen ? "text-foreground" : "text-muted-foreground"}`}>
                        {day.label}
                      </span>
                    </div>

                    {isOpen ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          {...register(`business_hours.${day.key}.start` as const)}
                          className="h-7 text-xs w-28 font-mono"
                        />
                        <span className="text-muted-foreground text-[11px]">to</span>
                        <Input
                          type="time"
                          {...register(`business_hours.${day.key}.end` as const)}
                          className="h-7 text-xs w-28 font-mono"
                        />
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic pl-7 sm:pl-0">
                        Closed / Off-hours
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Preferences updated
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

