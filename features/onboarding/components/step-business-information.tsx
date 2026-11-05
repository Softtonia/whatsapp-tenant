"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Download,
  Trash2,
  RefreshCw,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  useSaveBusinessInfoMutation,
  useCompleteBusinessInfoMutation,
  useTenantIndustriesQuery,
  useTenantDocumentsQuery,
  useUploadTenantDocumentMutation,
  useReplaceTenantDocumentMutation,
  useDeleteTenantDocumentMutation,
  useDownloadTenantDocumentMutation,
  useTenantDocumentStatusQuery,
  useUpdateTenantDocumentMutation,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import { apiClient } from "@/src/lib/api/client";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { BusinessInformationData, Industry, TenantDocument } from "@/types/onboarding";
import { COMMON_COUNTRIES } from "./step-tenant-registration";

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

const DOCUMENT_TYPES = [
  { value: "business_registration", label: "Business Registration / Incorporation Certificate" },
  { value: "tax_id", label: "Tax ID / EIN / GSTIN Certificate" },
];

interface StepBusinessInformationProps {
  initialData: Partial<BusinessInformationData>;
  onNext: (data: BusinessInformationData) => void;
  onBack: () => void;
  onChange?: (data: Partial<BusinessInformationData>) => void;
}

export function StepBusinessInformation({
  initialData,
  onNext,
  onBack,
  onChange,
}: StepBusinessInformationProps) {
  const [formData, setFormData] = useState<BusinessInformationData>({
    legal_business_name: initialData.legal_business_name || "",
    business_display_name: initialData.business_display_name || "",
    business_type: initialData.business_type || "corporation",
    industry_id: initialData.industry_id || undefined,
    business_email: initialData.business_email || "",
    business_phone: initialData.business_phone || "",
    website_url: initialData.website_url || "",
    business_description: initialData.business_description || "",
    tax_registration_number: initialData.tax_registration_number || "",
    registration_number: initialData.registration_number || "",
    country: initialData.country || "US",
    state: initialData.state || "",
    city: initialData.city || "",
    postal_code: initialData.postal_code || "",
    address_line_1: initialData.address_line_1 || "",
    address_line_2: initialData.address_line_2 || "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "ready" | "error">("idle");
  const [uploadedDocument, setUploadedDocument] = useState<TenantDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveDraftFeedback, setSaveDraftFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const activeTenant = useTenantStore((s) => s.activeTenant);
  const user = useAuthStore((s) => s.user);
  const tenantId = activeTenant?.id || user?.tenant_id || undefined;

  const { data: industriesData, isLoading: isIndustriesLoading } = useTenantIndustriesQuery(tenantId);
  const industries =
    Array.isArray(industriesData) && industriesData.length > 0
      ? industriesData
      : FALLBACK_INDUSTRIES;

  const saveMutation = useSaveBusinessInfoMutation();
  const completeMutation = useCompleteBusinessInfoMutation();
  const uploadDocumentMutation = useUploadTenantDocumentMutation();
  const replaceDocumentMutation = useReplaceTenantDocumentMutation();
  const deleteDocumentMutation = useDeleteTenantDocumentMutation();
  const downloadDocumentMutation = useDownloadTenantDocumentMutation();
  const updateDocumentMutation = useUpdateTenantDocumentMutation();

  const documentId = uploadedDocument?.id;
  const { data: documentStatusData } = useTenantDocumentStatusQuery(documentId, tenantId);

  // Business Documents State (uploaded via POST /api/tenant/business-documents)
  const [tenantDocuments, setTenantDocuments] = useState<TenantDocument[]>([]);

  // Sync server documents if already uploaded
  const { data: serverDocs } = useTenantDocumentsQuery(tenantId);
  useEffect(() => {
    if (Array.isArray(serverDocs) && serverDocs.length > 0) {
      setTenantDocuments(serverDocs);
    }
  }, [serverDocs]);

  const [regFile, setRegFile] = useState<File | null>(null);
  const [taxFile, setTaxFile] = useState<File | null>(null);
  const [uploadingDocType, setUploadingDocType] = useState<"business_registration" | "tax_id" | null>(null);
  const docUploadLoading = Boolean(uploadingDocType);
  const [docFeedback, setDocFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeDocActionId, setActiveDocActionId] = useState<string | number | null>(null);

  const handleUploadSpecificDoc = async (file: File, docType: "business_registration" | "tax_id") => {
    setUploadingDocType(docType);
    setDocFeedback(null);
    try {
      const res = await uploadDocumentMutation.mutateAsync({
        file,
        document_type: docType,
        tenantId,
      });
      const doc = res?.data || res;
      const newDocItem: TenantDocument = {
        id: doc?.id || Date.now(),
        name: doc?.name || doc?.title || file.name,
        file_name: doc?.file_name || file.name,
        document_type: doc?.document_type || docType,
        status: doc?.status || "uploaded",
        file_url: doc?.file_url || doc?.url,
        file_size: file.size,
        created_at: new Date().toISOString(),
      };
      setTenantDocuments((prev) => [
        ...prev.filter((d) => d.document_type !== docType && d.type !== docType),
        newDocItem,
      ]);
      setDocFeedback({
        type: "success",
        text: `${docType === "business_registration" ? "Business Registration Certificate" : "Tax ID Certificate"} uploaded successfully.`,
      });
      if (docType === "business_registration") setRegFile(null);
      if (docType === "tax_id") setTaxFile(null);
      setTimeout(() => setDocFeedback(null), 4000);
    } catch (err) {
      setDocFeedback({ type: "error", text: getErrorMessage(err) });
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDownloadDoc = async (doc: TenantDocument) => {
    if (!doc.id) return;
    setActiveDocActionId(doc.id);
    try {
      const res = await downloadDocumentMutation.mutateAsync({
        documentId: doc.id,
        tenantId,
      });
      const downloadUrl = res?.download_url || res?.url || doc.file_url || doc.url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }
    } catch (err) {
      setDocFeedback({ type: "error", text: getErrorMessage(err) });
    } finally {
      setActiveDocActionId(null);
    }
  };

  const handleReplaceDoc = async (docId: string | number, file: File, docType?: string) => {
    setActiveDocActionId(docId);
    setDocFeedback(null);
    try {
      const res = await replaceDocumentMutation.mutateAsync({
        documentId: docId,
        file,
        document_type: docType,
        tenantId,
      });
      const doc = res?.data || res;
      setTenantDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                name: file.name,
                file_name: file.name,
                file_size: file.size,
                file_url: doc?.file_url || doc?.url || d.file_url,
                status: doc?.status || "uploaded",
              }
            : d
        )
      );
      setDocFeedback({ type: "success", text: "Document replaced successfully." });
      setTimeout(() => setDocFeedback(null), 4000);
    } catch (err) {
      setDocFeedback({ type: "error", text: getErrorMessage(err) });
    } finally {
      setActiveDocActionId(null);
    }
  };

  const handleDeleteDoc = async (docId: string | number) => {
    setActiveDocActionId(docId);
    setDocFeedback(null);
    try {
      await deleteDocumentMutation.mutateAsync({
        documentId: docId,
        tenantId,
      });
      setTenantDocuments((prev) => prev.filter((d) => d.id !== docId));
      setDocFeedback({ type: "success", text: "Document removed successfully." });
      setTimeout(() => setDocFeedback(null), 4000);
    } catch (err) {
      setDocFeedback({ type: "error", text: getErrorMessage(err) });
    } finally {
      setActiveDocActionId(null);
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Logo file size exceeds 5MB limit.");
      setUploadStatus("error");
      return;
    }

    // Validate image mime type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Please upload a valid JPEG, PNG, or WebP image.");
      setUploadStatus("error");
      return;
    }

    setSelectedFile(file);
    try {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    } catch {
      // ignore
    }
    setUploadStatus("ready");
    setFormData((prev) => ({
      ...prev,
      business_logo: file,
      business_logo_url: file.name,
    }));
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus("idle");
    setUploadError(null);
    setFormData((prev) => ({
      ...prev,
      business_logo: undefined,
      business_logo_url: undefined,
      document_id: undefined,
    }));
  };

  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (val: string): boolean => {
    const trimmed = (val || "").trim();
    if (!trimmed) {
      setPhoneError("Business phone is required.");
      return false;
    }
    const digitsOnly = trimmed.replace(/\D/g, "");
    const isValidE164 = /^\+?[1-9]\d{6,14}$/.test(trimmed.replace(/[\s\-()]/g, ""));
    if (!isValidE164 || digitsOnly.length < 7 || digitsOnly.length > 15) {
      setPhoneError("Enter a valid international phone number (e.g. +15559876543, 7-15 digits).");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (val: string) => {
    // Restrict input strictly to digits and phone formatting (+, -, spaces, parentheses)
    const sanitized = val.replace(/[^\d+\s\-()]/g, "");
    handleInputChange("business_phone", sanitized);
    if (phoneError) {
      validatePhone(sanitized);
    }
  };

  const handleInputChange = (field: keyof BusinessInformationData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      onChange?.(updated);
      return updated;
    });
  };

  const handleSaveDraft = async () => {
    try {
      setErrorMessage(null);
      setSaveDraftFeedback(null);
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "" && k !== "business_logo") {
          payload.append(k, String(v));
        }
      });
      if (selectedFile) {
        payload.append("business_logo", selectedFile);
      }
      await saveMutation.mutateAsync(payload);
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

    if (!validatePhone(formData.business_phone)) {
      setErrorMessage("Please enter a valid business phone number with country code (e.g. +15559876543).");
      return;
    }

    const regDoc = tenantDocuments.find(
      (d) => d.document_type === "business_registration" || d.type === "business_registration"
    );
    const taxDoc = tenantDocuments.find(
      (d) => d.document_type === "tax_id" || d.type === "tax_id"
    );

    if (!regDoc || !taxDoc) {
      setErrorMessage(
        "Both Business Registration Certificate and Tax ID document are required. Please upload both before continuing."
      );
      return;
    }

    try {
      setErrorMessage(null);

      // Always send as FormData matching Postman multipart/form-data
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "" && k !== "business_logo") {
          payload.append(k, String(v));
        }
      });
      if (selectedFile) {
        payload.append("business_logo", selectedFile);
      }

      await completeMutation.mutateAsync(payload);

      try {
        await apiClient.post("/api/onboarding/steps/business_documents/complete", {});
      } catch {
        // Backend may complete automatically
      }

      onNext(formData);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  const isPending =
    saveMutation.isPending ||
    completeMutation.isPending ||
    docUploadLoading ||
    replaceDocumentMutation.isPending ||
    deleteDocumentMutation.isPending ||
    downloadDocumentMutation.isPending;

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
            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Business Phone *</span>
              {phoneError && (
                <span className="text-[10px] text-destructive font-normal">Invalid Format</span>
              )}
            </Label>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.business_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => validatePhone(formData.business_phone)}
              placeholder="+15559876543"
              required
              className={`text-xs h-9 font-mono ${
                phoneError ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
            />
            {phoneError ? (
              <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3 shrink-0" />
                <span>{phoneError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Include country code (e.g. +1 for US, +44 for UK, +91 for India).
              </p>
            )}
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

        {/* Company Logo attached to Business Profile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Company Logo (JPEG/PNG, max 5MB)
            </Label>
            {selectedFile && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="size-3" />
                Attached to business profile
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Image Preview thumbnail if available */}
            {previewUrl && (
              <div className="relative size-11 rounded-lg border border-border overflow-hidden bg-muted/40 shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Company Logo Preview"
                  className="size-full object-contain p-0.5"
                />
              </div>
            )}

            {!selectedFile ? (
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted font-medium text-foreground transition-colors">
                <Upload className="size-3.5 text-muted-foreground" />
                <span>Select Logo File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-medium text-foreground border border-border/70 rounded-lg px-2.5 py-1.5 bg-muted/30 max-w-[200px] truncate"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </span>

                <Badge
                  variant="outline"
                  className="text-[10px] font-normal gap-1 bg-background text-emerald-600 border-emerald-200 dark:border-emerald-800"
                >
                  <CheckCircle2 className="size-3" />
                  <span>Ready to submit</span>
                </Badge>

                {/* Replace File Button */}
                <label className="inline-flex items-center gap-1 cursor-pointer rounded-lg border border-border/80 px-2 py-1 text-xs hover:bg-muted font-medium text-foreground transition-colors h-7">
                  <RefreshCw className="size-3 text-muted-foreground" />
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Remove File Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleRemoveLogo}
                  className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7 px-2"
                  title="Remove logo"
                >
                  <Trash2 className="size-3" />
                  <span>Delete</span>
                </Button>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="text-[11px] text-destructive">
              {uploadError}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground">
            Logo is submitted directly with your business profile.
          </p>
        </div>
      </div>

      {/* Section 3: Business Verification Documents */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Business Verification Documents
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Upload your Business Registration Certificate and Tax ID document to complete WhatsApp verification.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback message for document actions */}
        {docFeedback && (
          <div
            className={`p-2.5 text-xs rounded-xl border flex items-center gap-2 ${
              docFeedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}
          >
            {docFeedback.type === "success" ? (
              <CheckCircle2 className="size-3.5 shrink-0" />
            ) : (
              <AlertCircle className="size-3.5 shrink-0" />
            )}
            <span>{docFeedback.text}</span>
          </div>
        )}

        {/* Two Dedicated Document Upload Fields */}
        {(() => {
          const regDoc = tenantDocuments.find(
            (d) => d.document_type === "business_registration" || d.type === "business_registration"
          );
          const taxDoc = tenantDocuments.find(
            (d) => d.document_type === "tax_id" || d.type === "tax_id"
          );

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Field 1: Business Registration Certificate */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      Business Registration *
                    </Label>
                    {regDoc ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold gap-1">
                        <CheckCircle2 className="size-3" />
                        Uploaded
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-medium">Required</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Incorporation Certificate or registered trade license.
                  </p>
                </div>

                {regDoc ? (
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-[170px]" title={regDoc.name || regDoc.file_name}>
                          {regDoc.name || regDoc.file_name || "Business Registration"}
                        </p>
                        {regDoc.file_size && (
                          <p className="text-[10px] text-muted-foreground">
                            {(regDoc.file_size / 1024).toFixed(0)} KB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDownloadDoc(regDoc)}
                        className="text-[11px] h-7 px-1.5 text-muted-foreground hover:text-foreground"
                        title="Download"
                      >
                        <Download className="size-3" />
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadSpecificDoc(file, "business_registration");
                          }}
                        />
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline px-1.5 py-1">
                          <RefreshCw className="size-3" />
                          Replace
                        </span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => regDoc.id && handleDeleteDoc(regDoc.id)}
                        className="text-[11px] text-destructive hover:bg-destructive/10 h-7 px-1.5"
                        title="Delete"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setRegFile(file);
                      }}
                      className="text-xs h-9 cursor-pointer file:cursor-pointer file:text-xs file:font-medium"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => regFile && handleUploadSpecificDoc(regFile, "business_registration")}
                      disabled={!regFile || uploadingDocType === "business_registration"}
                      className="w-full text-xs gap-1.5 h-8 font-medium"
                    >
                      {uploadingDocType === "business_registration" ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Uploading Certificate...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          <span>Upload Business Registration</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Field 2: Tax ID Certificate */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileCheck className="size-3.5 text-primary" />
                      Tax ID / EIN Certificate *
                    </Label>
                    {taxDoc ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold gap-1">
                        <CheckCircle2 className="size-3" />
                        Uploaded
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-medium">Required</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Tax Identification, EIN, VAT, or GSTIN certificate.
                  </p>
                </div>

                {taxDoc ? (
                  <div className="p-3 rounded-xl border border-border/70 bg-muted/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-[170px]" title={taxDoc.name || taxDoc.file_name}>
                          {taxDoc.name || taxDoc.file_name || "Tax ID Document"}
                        </p>
                        {taxDoc.file_size && (
                          <p className="text-[10px] text-muted-foreground">
                            {(taxDoc.file_size / 1024).toFixed(0)} KB
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDownloadDoc(taxDoc)}
                        className="text-[11px] h-7 px-1.5 text-muted-foreground hover:text-foreground"
                        title="Download"
                      >
                        <Download className="size-3" />
                      </Button>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadSpecificDoc(file, "tax_id");
                          }}
                        />
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline px-1.5 py-1">
                          <RefreshCw className="size-3" />
                          Replace
                        </span>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => taxDoc.id && handleDeleteDoc(taxDoc.id)}
                        className="text-[11px] text-destructive hover:bg-destructive/10 h-7 px-1.5"
                        title="Delete"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept=".pdf,image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setTaxFile(file);
                      }}
                      className="text-xs h-9 cursor-pointer file:cursor-pointer file:text-xs file:font-medium"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => taxFile && handleUploadSpecificDoc(taxFile, "tax_id")}
                      disabled={!taxFile || uploadingDocType === "tax_id"}
                      className="w-full text-xs gap-1.5 h-8 font-medium"
                    >
                      {uploadingDocType === "tax_id" ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Uploading Tax ID...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          <span>Upload Tax ID Certificate</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Section 4: Registered Physical Address */}
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

