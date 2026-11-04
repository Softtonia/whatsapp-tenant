"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, ArrowLeft, Loader2, Globe, FileCheck, CheckSquare, Square } from "lucide-react";
import { useCompleteMarketingComplianceMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { MarketingComplianceData } from "@/types/onboarding";

interface StepMarketingComplianceProps {
  initialData: Partial<MarketingComplianceData>;
  onNext: (data: MarketingComplianceData) => void;
  onBack: () => void;
}

const OPT_IN_OPTIONS = [
  { id: "website_form", label: "Website Lead Form / Contact Widget" },
  { id: "checkout_form", label: "E-commerce Checkout Opt-in Checkbox" },
  { id: "in_store_qr", label: "Physical Store / Invoice QR Code Scan" },
  { id: "sms_inbound", label: "Customer Inbound Keyword Message" },
];

export function StepMarketingCompliance({
  initialData,
  onNext,
  onBack,
}: StepMarketingComplianceProps) {
  const [formData, setFormData] = useState<MarketingComplianceData>({
    marketing_enabled: initialData.marketing_enabled ?? true,
    customer_opt_in_required: initialData.customer_opt_in_required ?? true,
    opt_in_method: initialData.opt_in_method || ["website_form", "checkout_form"],
    privacy_policy_url: initialData.privacy_policy_url || "",
    unsubscribe_enabled: initialData.unsubscribe_enabled ?? true,
    unsubscribe_keyword: initialData.unsubscribe_keyword || "STOP",
    default_language: initialData.default_language || "en",
    default_country_code: initialData.default_country_code || "+1",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const completeMutation = useCompleteMarketingComplianceMutation();

  const toggleOptInMethod = (methodId: string) => {
    setFormData((prev) => {
      const exists = prev.opt_in_method.includes(methodId);
      const updated = exists
        ? prev.opt_in_method.filter((m) => m !== methodId)
        : [...prev.opt_in_method, methodId];
      return { ...prev, opt_in_method: updated };
    });
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.opt_in_method.length === 0) {
      setErrorMessage("Please select at least one customer opt-in collection method.");
      return;
    }
    if (!formData.privacy_policy_url.trim()) {
      setErrorMessage("Privacy policy URL is required for Meta WhatsApp compliance.");
      return;
    }

    try {
      setErrorMessage(null);
      await completeMutation.mutateAsync(formData);
      onNext(formData);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleComplete} className="space-y-6">
      {errorMessage && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Meta WhatsApp Messaging Policies */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Meta WhatsApp Business Messaging Compliance</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          WhatsApp requires businesses to obtain active opt-in consent before initiating marketing or utility broadcasts, and to support automated opt-out keywords.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggle 1: Marketing Enabled */}
        <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border/80 bg-card">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground cursor-pointer">
              Enable Promotional &amp; Marketing Broadcasts
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Send bulk marketing templates and seasonal campaigns to opted-in leads.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.marketing_enabled}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, marketing_enabled: e.target.checked }))
            }
            className="size-4 rounded border-border text-primary focus:ring-primary shrink-0 mt-0.5 cursor-pointer"
          />
        </div>

        {/* Toggle 2: Customer Opt-in Required */}
        <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-border/80 bg-card">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground cursor-pointer">
              Strict Opt-in Verification Guard
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Block outgoing broadcasts to contacts who have not explicitly confirmed opt-in.
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.customer_opt_in_required}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customer_opt_in_required: e.target.checked,
              }))
            }
            className="size-4 rounded border-border text-primary focus:ring-primary shrink-0 mt-0.5 cursor-pointer"
          />
        </div>

        {/* Opt-in Methods Multi-select */}
        <div className="space-y-2 pt-1">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileCheck className="size-3.5 text-primary" />
            Approved Customer Opt-in Methods *
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {OPT_IN_OPTIONS.map((opt) => {
              const isChecked = formData.opt_in_method.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOptInMethod(opt.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    isChecked
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border/80 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="size-4 text-primary shrink-0" />
                  ) : (
                    <Square className="size-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-xs font-medium">{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy Policy URL */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-semibold text-foreground">
            Public Privacy Policy URL *
          </Label>
          <Input
            type="url"
            value={formData.privacy_policy_url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, privacy_policy_url: e.target.value }))
            }
            placeholder="https://company.com/privacy"
            required
            className="text-xs h-9"
          />
        </div>

        {/* Unsubscribe Keywords & Codes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Unsubscribe Keyword *
            </Label>
            <Input
              value={formData.unsubscribe_keyword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unsubscribe_keyword: e.target.value.toUpperCase(),
                }))
              }
              placeholder="STOP"
              required
              className="text-xs h-9 font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Default Country Code *
            </Label>
            <Input
              type="tel"
              value={formData.default_country_code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  default_country_code: e.target.value.replace(/[^\d+]/g, ""),
                }))
              }
              placeholder="+1"
              required
              maxLength={6}
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Default Language *
            </Label>
            <select
              value={formData.default_language}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, default_language: e.target.value }))
              }
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
            >
              <option value="en">English (en)</option>
              <option value="es">Spanish (es)</option>
              <option value="pt">Portuguese (pt)</option>
              <option value="hi">Hindi (hi)</option>
              <option value="ar">Arabic (ar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={completeMutation.isPending}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={completeMutation.isPending}
          className="gap-2 font-semibold text-xs shadow-xs"
        >
          {completeMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving Compliance...
            </>
          ) : (
            <>
              Continue to Final Activation
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

