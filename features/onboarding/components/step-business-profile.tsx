"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessProfileSchema, type BusinessProfileFormData } from "../schemas";
import { useSaveBusinessProfileMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, MapPin, Globe, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface StepBusinessProfileProps {
  initialData?: Partial<BusinessProfileFormData>;
  onSuccess: (data: BusinessProfileFormData) => void;
}

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
  "Canada",
  "Germany",
  "Other",
];

export function StepBusinessProfile({ initialData, onSuccess }: StepBusinessProfileProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const saveMutation = useSaveBusinessProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      company_name: initialData?.company_name || "Softtonia Solutions",
      company_email: initialData?.company_email || "contact@softtonia.com",
      contact_number: initialData?.contact_number || "+91 98765 43210",
      country: initialData?.country || "India",
      address: initialData?.address || "Tech Hub, Tower 2, Bengaluru",
    },
  });

  const onSubmit = async (data: BusinessProfileFormData) => {
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
          <Building2 className="size-3.5 text-muted-foreground" />
          Legal Business or Workspace Name <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="e.g. Acme Corp or Softtonia Solutions"
          {...register("company_name")}
          disabled={isPending}
          className={errors.company_name ? "border-destructive" : ""}
        />
        {errors.company_name && (
          <p className="text-xs text-destructive">{errors.company_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Mail className="size-3.5 text-muted-foreground" />
            Company Email Address <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            placeholder="admin@company.com"
            {...register("company_email")}
            disabled={isPending}
            className={errors.company_email ? "border-destructive" : ""}
          />
          {errors.company_email && (
            <p className="text-xs text-destructive">{errors.company_email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted-foreground" />
            Primary Contact Number <span className="text-destructive">*</span>
          </label>
          <Input
            type="tel"
            placeholder="+91 98765 43210"
            {...register("contact_number")}
            disabled={isPending}
            className={errors.contact_number ? "border-destructive" : ""}
          />
          {errors.contact_number && (
            <p className="text-xs text-destructive">{errors.contact_number.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="size-3.5 text-muted-foreground" />
            Country of Operation <span className="text-destructive">*</span>
          </label>
          <select
            {...register("country")}
            disabled={isPending}
            className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted-foreground" />
            Registered Business Address
          </label>
          <Input
            placeholder="Street address or city"
            {...register("address")}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/60">
        <Button type="submit" size="sm" disabled={isPending} className="gap-2 font-semibold">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              Continue to Preferences
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

