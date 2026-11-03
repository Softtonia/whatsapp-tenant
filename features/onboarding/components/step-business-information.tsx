"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight, ArrowLeft, Loader2, Upload, FileText, Globe, Mail, Phone, MapPin } from "lucide-react";
import {
  useSaveBusinessInfoMutation,
  useCompleteBusinessInfoMutation,
  useTenantIndustriesQuery,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { BusinessInformationData, Industry } from "@/types/onboarding";

const FALLBACK_INDUSTRIES: Industry[] = [
  { id: 1, name: "Agriculture & Farming", slug: "agriculture-farming", code: "AGRICULTURE", description: "Crop production, farming, livestock, agricultural equipment, and agribusiness.", sort_order: 1, is_active: true },
  { id: 2, name: "Automotive", slug: "automotive", code: "AUTOMOTIVE", description: "Vehicle dealerships, parts, repair, servicing, and auto manufacturing.", sort_order: 2, is_active: true },
  { id: 3, name: "Banking & Financial Services", slug: "banking-financial-services", code: "BANKING_FINANCE", description: "Commercial banking, investment, microfinance, wealth management, and fintech.", sort_order: 3, is_active: true },
  { id: 4, name: "Beauty & Personal Care", slug: "beauty-personal-care", code: "BEAUTY_PERSONAL_CARE", description: "Salons, spas, cosmetics, skincare, haircare, and personal grooming.", sort_order: 4, is_active: true },
  { id: 5, name: "Construction", slug: "construction", code: "CONSTRUCTION", description: "Civil engineering, commercial and residential construction, and building materials.", sort_order: 5, is_active: true },
  { id: 6, name: "Consulting", slug: "consulting", code: "CONSULTING", description: "Management, strategy, financial, technology, and business advisory services.", sort_order: 6, is_active: true },
  { id: 7, name: "Education", slug: "education", code: "EDUCATION", description: "Schools, universities, e-learning platforms, tutoring, and vocational training.", sort_order: 7, is_active: true },
  { id: 8, name: "Electronics", slug: "electronics", code: "ELECTRONICS", description: "Consumer electronics, semiconductors, hardware devices, and appliance manufacturing.", sort_order: 8, is_active: true },
  { id: 9, name: "Energy & Utilities", slug: "energy-utilities", code: "ENERGY_UTILITIES", description: "Electricity, oil & gas, renewable energy, solar, water, and waste utilities.", sort_order: 9, is_active: true },
  { id: 10, name: "Entertainment & Media", slug: "entertainment-media", code: "ENTERTAINMENT_MEDIA", description: "Film, television, music, publishing, gaming, and digital broadcasting.", sort_order: 10, is_active: true },
  { id: 11, name: "Events & Wedding Services", slug: "events-wedding-services", code: "EVENTS_WEDDINGS", description: "Event planning, wedding coordination, catering, venue management, and production.", sort_order: 11, is_active: true },
  { id: 12, name: "Fashion & Apparel", slug: "fashion-apparel", code: "FASHION_APPAREL", description: "Clothing, footwear, accessories, luxury fashion, and textile design.", sort_order: 12, is_active: true },
  { id: 13, name: "Food & Beverage", slug: "food-beverage", code: "FOOD_BEVERAGE", description: "Restaurants, cafes, food processing, breweries, cloud kitchens, and specialty foods.", sort_order: 13, is_active: true },
  { id: 14, name: "Healthcare", slug: "healthcare", code: "HEALTHCARE", description: "Hospitals, medical clinics, dental care, diagnostic labs, and medical devices.", sort_order: 14, is_active: true },
  { id: 15, name: "Hospitality", slug: "hospitality", code: "HOSPITALITY", description: "Hotels, resorts, homestays, vacation rentals, and guest services.", sort_order: 15, is_active: true },
  { id: 16, name: "Information Technology", slug: "information-technology", code: "IT", description: "Software development, SaaS, cloud infrastructure, cybersecurity, and IT services.", sort_order: 16, is_active: true },
  { id: 17, name: "Insurance", slug: "insurance", code: "INSURANCE", description: "Life, health, property, casualty, auto, and commercial insurance brokerage.", sort_order: 17, is_active: true },
  { id: 18, name: "Logistics & Transportation", slug: "logistics-transportation", code: "LOGISTICS", description: "Freight forwarding, shipping, supply chain management, courier, and fleet operations.", sort_order: 18, is_active: true },
  { id: 19, name: "Manufacturing", slug: "manufacturing", code: "MANUFACTURING", description: "Industrial manufacturing, heavy machinery, consumer goods, and assembly operations.", sort_order: 19, is_active: true },
  { id: 20, name: "Marketing & Advertising", slug: "marketing-advertising", code: "MARKETING_ADVERTISING", description: "Digital marketing, SEO, creative agencies, branding, PR, and media buying.", sort_order: 20, is_active: true },
  { id: 21, name: "Real Estate", slug: "real-estate", code: "REAL_ESTATE", description: "Property brokerage, real estate development, property management, and leasing.", sort_order: 21, is_active: true },
  { id: 22, name: "Retail & E-commerce", slug: "retail-ecommerce", code: "RETAIL_ECOMMERCE", description: "Online stores, retail chains, direct-to-consumer brands, and marketplace sellers.", sort_order: 22, is_active: true },
  { id: 23, name: "Telecommunications", slug: "telecommunications", code: "TELECOMMUNICATIONS", description: "Broadband, wireless carriers, telecom hardware, satellite, and network services.", sort_order: 23, is_active: true },
  { id: 24, name: "Travel & Tourism", slug: "travel-tourism", code: "TRAVEL_TOURISM", description: "Travel agencies, tour operators, booking portals, airlines, and excursion services.", sort_order: 24, is_active: true },
  { id: 25, name: "Wholesale & Distribution", slug: "wholesale-distribution", code: "WHOLESALE", description: "B2B distribution, wholesale trade, warehousing, and merchant wholesalers.", sort_order: 25, is_active: true },
  { id: 26, name: "Legal Services", slug: "legal-services", code: "LEGAL_SERVICES", description: "Law firms, attorneys, legal compliance, intellectual property, and arbitration.", sort_order: 26, is_active: true },
  { id: 27, name: "Professional Services", slug: "professional-services", code: "PROFESSIONAL_SERVICES", description: "Accounting, auditing, tax filing, architectural design, and translation services.", sort_order: 27, is_active: true },
  { id: 28, name: "Home Services", slug: "home-services", code: "HOME_SERVICES", description: "Plumbing, electrical, HVAC, interior design, renovation, and cleaning services.", sort_order: 28, is_active: true },
  { id: 29, name: "Fitness & Sports", slug: "fitness-sports", code: "FITNESS_SPORTS", description: "Gyms, sports clubs, personal training, athletic apparel, and wellness centers.", sort_order: 29, is_active: true },
  { id: 30, name: "Non-Profit & NGO", slug: "non-profit-ngo", code: "NON_PROFIT_NGO", description: "Charitable trusts, foundations, advocacy groups, community development, and NGOs.", sort_order: 30, is_active: true },
  { id: 31, name: "Government & Public Sector", slug: "government-public-sector", code: "GOVERNMENT_PUBLIC", description: "Public agencies, civic services, utilities, and municipal administrations.", sort_order: 31, is_active: true },
];

interface StepBusinessInformationProps {
  initialData: Partial<BusinessInformationData>;
  onNext: (data: BusinessInformationData) => void;
  onBack: () => void;
}

export function StepBusinessInformation({
  initialData,
  onNext,
  onBack,
}: StepBusinessInformationProps) {
  const [formData, setFormData] = useState<BusinessInformationData>({
    legal_business_name: initialData.legal_business_name || "Acme Logistics Inc",
    business_display_name: initialData.business_display_name || "Acme Logistics",
    business_type: initialData.business_type || "corporation",
    industry_id: initialData.industry_id || 1,
    business_email: initialData.business_email || "contact@acmelogistics.com",
    business_phone: initialData.business_phone || "+15559876543",
    website_url: initialData.website_url || "https://acmelogistics.com",
    business_description:
      initialData.business_description ||
      "Enterprise logistics, fulfillment, and worldwide shipping solutions.",
    tax_registration_number: initialData.tax_registration_number || "US-EIN-123456789",
    registration_number: initialData.registration_number || "CORP-987654321",
    country: initialData.country || "US",
    state: initialData.state || "California",
    city: initialData.city || "San Francisco",
    postal_code: initialData.postal_code || "94105",
    address_line_1: initialData.address_line_1 || "500 Howard St",
    address_line_2: initialData.address_line_2 || "Suite 400",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveDraftFeedback, setSaveDraftFeedback] = useState<string | null>(null);

  const activeTenant = useTenantStore((s) => s.activeTenant);
  const user = useAuthStore((s) => s.user);
  const tenantId = activeTenant?.id || user?.tenant_id || 1;

  const { data: industriesData, isLoading: isIndustriesLoading } = useTenantIndustriesQuery(tenantId);
  const industries =
    Array.isArray(industriesData) && industriesData.length > 0
      ? industriesData
      : FALLBACK_INDUSTRIES;

  const saveMutation = useSaveBusinessInfoMutation();
  const completeMutation = useCompleteBusinessInfoMutation();

  const handleInputChange = (field: keyof BusinessInformationData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      setErrorMessage(null);
      setSaveDraftFeedback(null);
      await saveMutation.mutateAsync(formData);
      setSaveDraftFeedback("Draft saved successfully.");
      setTimeout(() => setSaveDraftFeedback(null), 3000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.legal_business_name || !formData.business_display_name) {
      setErrorMessage("Legal business name and display name are required.");
      return;
    }

    try {
      setErrorMessage(null);

      // Always send as FormData matching Postman multipart/form-data
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          payload.append(k, String(v));
        }
      });
      if (selectedFile) {
        payload.append("business_logo", selectedFile);
      }

      await completeMutation.mutateAsync(payload);
      onNext(formData);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isPending = saveMutation.isPending || completeMutation.isPending;

  return (
    <form onSubmit={handleComplete} className="space-y-6">
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

      {/* Section 1: Entity & Brand Identity */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            Entity &amp; Brand Identity
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Official business registration and customer-facing profile details
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Legal Business Name *
            </Label>
            <Input
              value={formData.legal_business_name}
              onChange={(e) => handleInputChange("legal_business_name", e.target.value)}
              placeholder="e.g. Acme Logistics Inc"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Business Display Name *
            </Label>
            <Input
              value={formData.business_display_name}
              onChange={(e) => handleInputChange("business_display_name", e.target.value)}
              placeholder="e.g. Acme Logistics"
              required
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Business Entity Type *
            </Label>
            <select
              value={formData.business_type}
              onChange={(e) => handleInputChange("business_type", e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
            >
              <option value="corporation">Corporation (Inc / Corp)</option>
              <option value="llc">Limited Liability Company (LLC)</option>
              <option value="sole_proprietorship">Sole Proprietorship</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Industry Category</span>
              {isIndustriesLoading && (
                <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1">
                  <Loader2 className="size-2.5 animate-spin" />
                  Loading...
                </span>
              )}
            </Label>
            <select
              value={formData.industry_id ?? ""}
              onChange={(e) => handleInputChange("industry_id", Number(e.target.value))}
              disabled={isIndustriesLoading && industries.length === 0}
              className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
            >
              <option value="" disabled>Select an industry...</option>
              {industries.map((ind: Industry) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Business Description
          </Label>
          <Textarea
            value={formData.business_description || ""}
            onChange={(e) => handleInputChange("business_description", e.target.value)}
            placeholder="Brief description of operations, products, and services..."
            rows={2}
            className="text-xs resize-none"
          />
        </div>
      </div>

      {/* Section 2: Contact & Official Credentials */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            Contact &amp; Official Numbers
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Channels used for Meta WhatsApp verification and billing compliance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Business Email *
            </Label>
            <Input
              type="email"
              value={formData.business_email}
              onChange={(e) => handleInputChange("business_email", e.target.value)}
              placeholder="contact@company.com"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Business Phone *
            </Label>
            <Input
              value={formData.business_phone}
              onChange={(e) => handleInputChange("business_phone", e.target.value)}
              placeholder="+15559876543"
              required
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Company Website
            </Label>
            <Input
              type="url"
              value={formData.website_url || ""}
              onChange={(e) => handleInputChange("website_url", e.target.value)}
              placeholder="https://company.com"
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Tax ID / EIN / GSTIN *
            </Label>
            <Input
              value={formData.tax_registration_number || ""}
              onChange={(e) => handleInputChange("tax_registration_number", e.target.value)}
              placeholder="US-EIN-123456789"
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Company Registration Number *
            </Label>
            <Input
              value={formData.registration_number || ""}
              onChange={(e) => handleInputChange("registration_number", e.target.value)}
              placeholder="CORP-987654321"
              className="text-xs h-9 font-mono"
            />
          </div>
        </div>

        {/* Company Logo Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Company Logo (JPEG/PNG, max 5MB)
          </Label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted font-medium text-foreground">
              <Upload className="size-3.5 text-muted-foreground" />
              <span>{selectedFile ? selectedFile.name : "Select Logo File"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setSelectedFile(null)}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Registered Physical Address */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Registered Operating Address
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Required for WhatsApp Business Manager verification
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Address Line 1 *
            </Label>
            <Input
              value={formData.address_line_1}
              onChange={(e) => handleInputChange("address_line_1", e.target.value)}
              placeholder="500 Howard St"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Address Line 2 (Suite / Floor)
            </Label>
            <Input
              value={formData.address_line_2 || ""}
              onChange={(e) => handleInputChange("address_line_2", e.target.value)}
              placeholder="Suite 400"
              className="text-xs h-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">City *</Label>
            <Input
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="San Francisco"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">State / Region *</Label>
            <Input
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="California"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Postal Code *</Label>
            <Input
              value={formData.postal_code}
              onChange={(e) => handleInputChange("postal_code", e.target.value)}
              placeholder="94105"
              required
              className="text-xs h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">Country Code *</Label>
            <Input
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value.toUpperCase())}
              placeholder="US"
              required
              maxLength={2}
              className="text-xs h-9 font-mono uppercase"
            />
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
          disabled={isPending}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-2">
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
            disabled={isPending}
            className="gap-2 font-semibold text-xs shadow-xs"
          >
            {completeMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving Business Info...
              </>
            ) : (
              <>
                Continue to Subscription Plan
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

