"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  ArrowRight,
  Loader2,
  Globe,
  Clock,
  Languages,
  FileCheck,
  Shield,
  ExternalLink,
} from "lucide-react";
import {
  useSaveTenantRegistrationMutation,
  useCompleteTenantRegistrationMutation,
} from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { TenantRegistrationData } from "@/types/onboarding";

interface StepTenantRegistrationProps {
  initialData: Partial<TenantRegistrationData>;
  onNext: (data: TenantRegistrationData) => void;
  onChange?: (data: Partial<TenantRegistrationData>) => void;
}

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST / EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST / CDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST / PDT)" },
  { value: "Europe/London", label: "Europe/London (GMT / BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET / CEST)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST +4)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT +8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST +9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST / AEDT)" },
];

const COMMON_LANGUAGES = [
  { code: "en", name: "English (en)" },
  { code: "es", name: "Spanish (es)" },
  { code: "pt", name: "Portuguese (pt)" },
  { code: "fr", name: "French (fr)" },
  { code: "de", name: "German (de)" },
  { code: "hi", name: "Hindi (hi)" },
  { code: "ar", name: "Arabic (ar)" },
];

export const COMMON_COUNTRIES = [
  { code: "US", name: "United States (US)" },
  { code: "GB", name: "United Kingdom (GB)" },
  { code: "IN", name: "India (IN)" },
  { code: "AE", name: "United Arab Emirates (AE)" },
  { code: "CA", name: "Canada (CA)" },
  { code: "AU", name: "Australia (AU)" },
  { code: "SG", name: "Singapore (SG)" },
  { code: "DE", name: "Germany (DE)" },
  { code: "FR", name: "France (FR)" },
  { code: "SA", name: "Saudi Arabia (SA)" },
  { code: "ES", name: "Spain (ES)" },
  { code: "IT", name: "Italy (IT)" },
  { code: "NL", name: "Netherlands (NL)" },
  { code: "BR", name: "Brazil (BR)" },
  { code: "MX", name: "Mexico (MX)" },
  { code: "ZA", name: "South Africa (ZA)" },
  { code: "JP", name: "Japan (JP)" },
  { code: "ID", name: "Indonesia (ID)" },
  { code: "MY", name: "Malaysia (MY)" },
  { code: "PH", name: "Philippines (PH)" },
  { code: "PK", name: "Pakistan (PK)" },
  { code: "BD", name: "Bangladesh (BD)" },
  { code: "NG", name: "Nigeria (NG)" },
  { code: "KE", name: "Kenya (KE)" },
  { code: "EG", name: "Egypt (EG)" },
  { code: "TR", name: "Turkey (TR)" },
  { code: "IE", name: "Ireland (IE)" },
  { code: "CH", name: "Switzerland (CH)" },
  { code: "SE", name: "Sweden (SE)" },
  { code: "NO", name: "Norway (NO)" },
  { code: "DK", name: "Denmark (DK)" },
  { code: "NZ", name: "New Zealand (NZ)" },
  { code: "PL", name: "Poland (PL)" },
  { code: "PT", name: "Portugal (PT)" },
  { code: "QA", name: "Qatar (QA)" },
  { code: "KW", name: "Kuwait (KW)" },
  { code: "OM", name: "Oman (OM)" },
  { code: "BH", name: "Bahrain (BH)" },
];

export function StepTenantRegistration({
  initialData,
  onNext,
  onChange,
}: StepTenantRegistrationProps) {
  const [formData, setFormData] = useState<TenantRegistrationData>({
    name: initialData.name || initialData.workspace_name || "",
    company_name: initialData.company_name || "",
    country: initialData.country || "US",
    timezone: initialData.timezone || "UTC",
    preferred_language: initialData.preferred_language || "en",
    terms_accepted: initialData.terms_accepted ?? false,
    subdomain: initialData.subdomain || "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveDraftFeedback, setSaveDraftFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        name: initialData.name || initialData.workspace_name || prev.name,
        company_name: initialData.company_name || prev.company_name,
        country: initialData.country || prev.country,
        timezone: initialData.timezone || prev.timezone,
        preferred_language: initialData.preferred_language || prev.preferred_language,
        terms_accepted: initialData.terms_accepted ?? prev.terms_accepted,
        subdomain: initialData.subdomain || prev.subdomain,
      }));
    }
  }, [initialData]);

  const saveMutation = useSaveTenantRegistrationMutation();
  const completeMutation = useCompleteTenantRegistrationMutation();

  const handleInputChange = (field: keyof TenantRegistrationData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Keep subdomain in sync if user changes name and hasn't manually customized subdomain
      if (field === "name") {
        if (!prev.subdomain || prev.subdomain === prev.name.toLowerCase().replace(/[^a-z0-9-]/g, "")) {
          updated.subdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        }
      }
      onChange?.(updated);
      return updated;
    });
  };

  const getPayload = (): TenantRegistrationData => {
    return {
      name: formData.name.trim(),
      company_name: formData.company_name.trim(),
      country: formData.country.trim().toUpperCase(),
      timezone: formData.timezone,
      preferred_language: formData.preferred_language,
      terms_accepted: Boolean(formData.terms_accepted),
      subdomain: formData.subdomain?.trim(),
      workspace_name: formData.name.trim(),
    };
  };

  const handleSaveDraft = async () => {
    try {
      setErrorMessage(null);
      setSaveDraftFeedback(null);
      await saveMutation.mutateAsync(getPayload());
      setSaveDraftFeedback("Draft saved successfully.");
      setTimeout(() => setSaveDraftFeedback(null), 3000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage("Tenant name is required.");
      return;
    }
    if (!formData.company_name.trim()) {
      setErrorMessage("Company name is required.");
      return;
    }
    if (!formData.terms_accepted) {
      setErrorMessage("Please accept the terms and conditions to proceed.");
      return;
    }

    try {
      setErrorMessage(null);
      const payload = getPayload();
      await completeMutation.mutateAsync(payload);
      onNext(payload);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isPending = saveMutation.isPending || completeMutation.isPending;

  return (
    <form onSubmit={handleComplete} className="space-y-5">
      {errorMessage && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          {errorMessage}
        </div>
      )}

      {saveDraftFeedback && (
        <div className="p-3 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-xl">
          {saveDraftFeedback}
        </div>
      )}

      <div className="space-y-4">
        {/* Row 1: Workspace Name & Legal Company Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              Workspace Name *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g. Acme Global Corp"
              required
              className="text-xs h-9"
            />
            <p className="text-[11px] text-muted-foreground">
              Internal identifier for your multi-tenant workspace.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="size-3.5 text-primary" />
              Company Name *
            </Label>
            <Input
              value={formData.company_name}
              onChange={(e) => handleInputChange("company_name", e.target.value)}
              placeholder="e.g. Acme Global Corp"
              required
              className="text-xs h-9"
            />
            <p className="text-[11px] text-muted-foreground">
              Official registered organization name.
            </p>
          </div>
        </div>

        {/* Row 2: Country & URL Subdomain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-primary" />
              Country of Operation *
            </Label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
              required
            >
              <option value="" disabled>Select country</option>
              {COMMON_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              2-letter ISO country code for tenant routing and compliance.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              Workspace URL Slug
            </Label>
            <div className="flex items-center">
              <Input
                value={formData.subdomain || ""}
                onChange={(e) =>
                  handleInputChange(
                    "subdomain",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="acme-global"
                className="text-xs h-9 rounded-r-none font-mono"
              />
              <span className="h-9 px-3 flex items-center text-xs text-muted-foreground bg-muted border border-l-0 border-border rounded-r-lg font-mono select-none">
                .crm
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Timezone & Preferred Language */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              Default Timezone *
            </Label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange("timezone", e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Languages className="size-3.5 text-primary" />
              Preferred Language *
            </Label>
            <select
              value={formData.preferred_language}
              onChange={(e) => handleInputChange("preferred_language", e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
            >
              {COMMON_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Terms Accepted */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-card">
          <input
            type="checkbox"
            id="terms_accepted"
            checked={formData.terms_accepted}
            onChange={(e) => handleInputChange("terms_accepted", e.target.checked)}
            className="size-4 rounded border-border text-primary focus:ring-primary shrink-0 mt-0.5 cursor-pointer"
          />
          <label
            htmlFor="terms_accepted"
            className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
          >
            I confirm and accept the{" "}
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors inline-flex items-center gap-0.5"
            >
              <span>Terms of Service</span>
              <ExternalLink className="size-3 inline shrink-0" />
            </Link>{" "}
            for this workspace.
          </label>
        </div>

        {/* Security Banner */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Shield className="size-3.5 text-primary" />
            Enterprise Multi-Tenant Isolation
          </div>
          <p className="text-[11px] leading-relaxed">
            All tenant data is strictly partitioned and isolated per RFC standards with dedicated cryptographic boundaries.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          disabled={isPending}
          className="text-xs"
        >
          {saveMutation.isPending ? "Saving..." : "Save Draft"}
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={isPending || !formData.terms_accepted}
          className="gap-2 font-semibold text-xs shadow-xs"
        >
          {completeMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Completing Step 1...
            </>
          ) : (
            <>
              Continue to Business Information
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
