"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { regionalPreferencesSchema, type RegionalPreferencesFormData } from "../schemas";
import { useSaveRegionalPreferencesMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface StepRegionalPreferencesProps {
  initialData?: Partial<RegionalPreferencesFormData>;
  onSuccess: (data: RegionalPreferencesFormData) => void;
  onBack: () => void;
}

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New York (EST/EDT -5:00)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PST/PDT -8:00)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST +0:00)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST +1:00)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +4:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +8:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT +10:00)" },
];

const CURRENCIES = [
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" },
  { value: "AED", label: "AED (د.إ) - UAE Dirham" },
  { value: "SGD", label: "SGD ($) - Singapore Dollar" },
  { value: "AUD", label: "AUD ($) - Australian Dollar" },
  { value: "CAD", label: "CAD ($) - Canadian Dollar" },
];

export function StepRegionalPreferences({
  initialData,
  onSuccess,
  onBack,
}: StepRegionalPreferencesProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const saveMutation = useSaveRegionalPreferencesMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegionalPreferencesFormData>({
    resolver: zodResolver(regionalPreferencesSchema),
    defaultValues: {
      timezone: initialData?.timezone || "Asia/Kolkata",
      currency: initialData?.currency || "INR",
    },
  });

  const onSubmit = async (data: RegionalPreferencesFormData) => {
    setServerError(null);
    try {
      await saveMutation.mutateAsync(data);
      onSuccess(data);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const isPending = isSubmitting || saveMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          Workspace Default Timezone <span className="text-destructive">*</span>
        </label>
        <select
          {...register("timezone")}
          disabled={isPending}
          className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-xs text-destructive">{errors.timezone.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Message timestamps, automated campaign schedules, and SLA reports will calculate based on this timezone.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <DollarSign className="size-3.5 text-muted-foreground" />
          Billing & Product Catalog Currency <span className="text-destructive">*</span>
        </label>
        <select
          {...register("currency")}
          disabled={isPending}
          className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.currency && (
          <p className="text-xs text-destructive">{errors.currency.message}</p>
        )}
        <p className="text-[11px] text-muted-foreground">
          Currency used for WhatsApp catalog products, order checkouts, and CRM conversion metrics.
        </p>
      </div>

      <div className="flex justify-between pt-4 border-t border-border/60">
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

        <Button type="submit" size="sm" disabled={isPending} className="gap-2 font-semibold">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              Continue to WhatsApp Setup
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

