"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompleteOnboardingMutation } from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Globe,
  Phone,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type {
  BusinessProfileFormData,
  RegionalPreferencesFormData,
  WhatsAppConnectionFormData,
  TeamInvitationsFormData,
} from "../schemas";

interface StepReviewCompletionProps {
  businessProfile: BusinessProfileFormData;
  regionalPreferences: RegionalPreferencesFormData;
  whatsappConnection: WhatsAppConnectionFormData;
  teamInvitations: TeamInvitationsFormData;
  onBack: () => void;
}

export function StepReviewCompletion({
  businessProfile,
  regionalPreferences,
  whatsappConnection,
  teamInvitations,
  onBack,
}: StepReviewCompletionProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const completeMutation = useCompleteOnboardingMutation();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const activeTenant = useTenantStore((s) => s.activeTenant);

  const handleLaunch = async () => {
    setServerError(null);
    try {
      await completeMutation.mutateAsync();

      // Establish verified active tenant from state
      if (activeTenant) {
        setActiveTenant({
          ...activeTenant,
          name: businessProfile.company_name,
          timezone: regionalPreferences.timezone,
          currency: regionalPreferences.currency,
          default_phone_number: whatsappConnection.defer_whatsapp
            ? null
            : whatsappConnection.phone_number || activeTenant.default_phone_number,
        });
      }

      router.push("/dashboard");
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const isPending = completeMutation.isPending;

  return (
    <div className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center space-y-1">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground mb-1">
          <Sparkles className="size-5" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Ready to Launch Your Workspace!</h3>
        <p className="text-xs text-muted-foreground">
          Confirm your settings below. You can update these anytime from Workspace Settings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Business Profile Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Building2 className="size-3.5 text-primary" />
            <span>Business Profile</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground text-[11px]">
            <p><span className="font-medium text-foreground">Name:</span> {businessProfile.company_name}</p>
            <p><span className="font-medium text-foreground">Email:</span> {businessProfile.company_email}</p>
            <p><span className="font-medium text-foreground">Contact:</span> {businessProfile.contact_number}</p>
            <p><span className="font-medium text-foreground">Country:</span> {businessProfile.country}</p>
          </div>
        </div>

        {/* Regional Preferences Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Globe className="size-3.5 text-primary" />
            <span>Regional Preferences</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground text-[11px]">
            <p><span className="font-medium text-foreground">Timezone:</span> {regionalPreferences.timezone}</p>
            <p><span className="font-medium text-foreground">Currency:</span> {regionalPreferences.currency}</p>
          </div>
        </div>

        {/* WhatsApp Connection Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Phone className="size-3.5 text-primary" />
            <span>WhatsApp Connection</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground text-[11px]">
            {whatsappConnection.defer_whatsapp ? (
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                Deferred (Configure in Settings)
              </p>
            ) : (
              <>
                <p><span className="font-medium text-foreground">Phone:</span> {whatsappConnection.phone_number}</p>
                {whatsappConnection.waba_id && (
                  <p><span className="font-medium text-foreground">WABA ID:</span> {whatsappConnection.waba_id}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Team Members Card */}
        <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Users className="size-3.5 text-primary" />
            <span>Team Members</span>
          </div>
          <div className="space-y-0.5 text-muted-foreground text-[11px]">
            <p>
              <span className="font-medium text-foreground">
                {teamInvitations.invitees.length} invitation(s) queued
              </span>
            </p>
            {teamInvitations.invitees.slice(0, 2).map((inv, i) => (
              <p key={i} className="truncate">
                {inv.email} ({inv.role})
              </p>
            ))}
            {teamInvitations.invitees.length > 2 && (
              <p className="text-[10px] text-muted-foreground italic">
                +{teamInvitations.invitees.length - 2} more members
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleLaunch}
          disabled={isPending}
          className="gap-2 font-bold px-5"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Launching Workspace...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Launch Workspace
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

