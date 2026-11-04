"use client";

import { useState } from "react";
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
  useUploadTenantDocumentMutation,
  useReplaceTenantDocumentMutation,
  useDeleteTenantDocumentMutation,
  useDownloadTenantDocumentMutation,
  useTenantDocumentStatusQuery,
  useUpdateTenantDocumentMutation,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { BusinessInformationData, Industry, TenantDocument } from "@/types/onboarding";

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
  { value: "tax_certificate", label: "Tax ID / EIN / GSTIN Certificate" },
  { value: "address_proof", label: "Proof of Operating Address / Utility Bill" },
  { value: "identity_proof", label: "Director / Authorized Signatory ID Proof" },
  { value: "other", label: "Other Verification Document" },
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
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadedDocument, setUploadedDocument] = useState<TenantDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
  const uploadDocumentMutation = useUploadTenantDocumentMutation();
  const replaceDocumentMutation = useReplaceTenantDocumentMutation();
  const deleteDocumentMutation = useDeleteTenantDocumentMutation();
  const downloadDocumentMutation = useDownloadTenantDocumentMutation();
  const updateDocumentMutation = useUpdateTenantDocumentMutation();

  const documentId = uploadedDocument?.id;
  const { data: documentStatusData } = useTenantDocumentStatusQuery(documentId, tenantId);

  // Business Documents State (uploaded via POST /api/tenant/documents)
  const [tenantDocuments, setTenantDocuments] = useState<TenantDocument[]>([]);

  const [newDocType, setNewDocType] = useState<string>("business_registration");
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [docUploadLoading, setDocUploadLoading] = useState<boolean>(false);
  const [docFeedback, setDocFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeDocActionId, setActiveDocActionId] = useState<string | number | null>(null);

  const handleUploadBusinessDoc = async () => {
    if (!newDocFile) {
      setDocFeedback({ type: "error", text: "Please select a document file to upload." });
      return;
    }
    setDocUploadLoading(true);
    setDocFeedback(null);
    try {
      const res = await uploadDocumentMutation.mutateAsync({
        file: newDocFile,
        document_type: newDocType,
        tenantId,
      });
      const doc = res?.data || res;
      const newDocItem: TenantDocument = {
        id: doc?.id || Date.now(),
        name: doc?.name || doc?.title || newDocFile.name,
        file_name: doc?.file_name || newDocFile.name,
        document_type: doc?.document_type || newDocType,
        status: doc?.status || "uploaded",
        file_url: doc?.file_url || doc?.url,
        file_size: newDocFile.size,
        created_at: new Date().toISOString(),
      };
      setTenantDocuments((prev) => [...prev, newDocItem]);
      setDocFeedback({ type: "success", text: `"${newDocFile.name}" uploaded successfully.` });
      setNewDocFile(null);
      setTimeout(() => setDocFeedback(null), 4000);
    } catch (err) {
      setDocFeedback({ type: "error", text: getErrorMessage(err) });
    } finally {
      setDocUploadLoading(false);
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

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    setUploadStatus("uploading");

    try {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
    } catch {
      // ignore
    }

    try {
      let res: any;
      if (uploadedDocument?.id) {
        // Replace existing document using POST /api/tenant/documents/:documentId/replace
        res = await replaceDocumentMutation.mutateAsync({
          documentId: uploadedDocument.id,
          file,
          tenantId,
        });
      } else {
        // Initial upload using POST /api/tenant/documents
        res = await uploadDocumentMutation.mutateAsync({
          file,
          document_type: "logo",
          tenantId,
        });
      }

      const docData = res?.data || res;
      setUploadedDocument(docData);
      setUploadStatus("success");

      const fileUrl = docData?.file_url || docData?.url || docData?.path;
      if (fileUrl) {
        setFormData((prev) => ({
          ...prev,
          business_logo: fileUrl,
          business_logo_url: fileUrl,
          document_id: docData?.id || uploadedDocument?.id,
        }));
      }
    } catch (err) {
      setUploadStatus("error");
      setUploadError(getErrorMessage(err));
    }
  };

  const handleDownload = async () => {
    if (!uploadedDocument?.id) return;
    try {
      const res = await downloadDocumentMutation.mutateAsync({
        documentId: uploadedDocument.id,
        tenantId,
      });
      const downloadUrl =
        res?.download_url ||
        res?.url ||
        uploadedDocument.file_url ||
        uploadedDocument.url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }
    } catch (err) {
      setUploadError(getErrorMessage(err));
    }
  };

  const handleDeleteDocument = async () => {
    if (uploadedDocument?.id) {
      try {
        await deleteDocumentMutation.mutateAsync({
          documentId: uploadedDocument.id,
          tenantId,
        });
      } catch (err) {
        // ignore delete error or set message
      }
    }
    setSelectedFile(null);
    setUploadedDocument(null);
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

  const handleRemoveFile = () => {
    handleDeleteDocument();
  };

  const handleRetryUpload = () => {
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
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

    if (!validatePhone(formData.business_phone)) {
      setErrorMessage("Please enter a valid business phone number with country code (e.g. +15559876543).");
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

  const isPending =
    saveMutation.isPending ||
    completeMutation.isPending ||
    uploadStatus === "uploading" ||
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

        {/* Company Logo / Document Upload via /api/tenant/documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">
              Company Logo (JPEG/PNG, max 5MB)
            </Label>
            {uploadStatus === "uploading" && (
              <span className="text-[11px] text-primary flex items-center gap-1 font-medium">
                <Loader2 className="size-3 animate-spin" />
                Uploading document...
              </span>
            )}
            {uploadStatus === "success" && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="size-3" />
                Uploaded to tenant documents
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

            {!selectedFile && (
              <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted font-medium text-foreground transition-colors disabled:opacity-50">
                <Upload className="size-3.5 text-muted-foreground" />
                <span>Select Logo File</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  disabled={uploadStatus === "uploading"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />
              </label>
            )}

            {selectedFile && (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-medium text-foreground border border-border/70 rounded-lg px-2.5 py-1.5 bg-muted/30 max-w-[200px] truncate"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </span>

                {/* Status Badge from /api/tenant/documents/:documentId/status */}
                {uploadedDocument && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-normal gap-1 bg-background"
                  >
                    <ShieldCheck className="size-3 text-emerald-600" />
                    <span className="capitalize">
                      {documentStatusData?.status || uploadedDocument.status || "Verified"}
                    </span>
                  </Badge>
                )}

                {/* Download Document Button (/api/tenant/documents/:documentId/download) */}
                {uploadedDocument?.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={handleDownload}
                    disabled={downloadDocumentMutation.isPending}
                    className="text-xs gap-1 hover:bg-muted h-7 px-2"
                    title="Download document from server"
                  >
                    {downloadDocumentMutation.isPending ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Download className="size-3 text-muted-foreground" />
                    )}
                    <span>Download</span>
                  </Button>
                )}

                {/* Replace File Button (/api/tenant/documents/:documentId/replace) */}
                <label className="inline-flex items-center gap-1 cursor-pointer rounded-lg border border-border/80 px-2 py-1 text-xs hover:bg-muted font-medium text-foreground transition-colors h-7">
                  {replaceDocumentMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3 text-muted-foreground" />
                  )}
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    disabled={uploadStatus === "uploading"}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Delete Document Button (/api/tenant/documents/:documentId) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleDeleteDocument}
                  disabled={deleteDocumentMutation.isPending || uploadStatus === "uploading"}
                  className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7 px-2"
                  title="Delete document"
                >
                  {deleteDocumentMutation.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  <span>Delete</span>
                </Button>
              </div>
            )}

            {uploadStatus === "error" && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleRetryUpload}
                className="text-xs text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                Retry Upload
              </Button>
            )}
          </div>

          {uploadError && (
            <p className="text-[11px] text-destructive">
              Upload failed: {uploadError}
            </p>
          )}

          <p className="text-[10px] text-muted-foreground">
            Files are uploaded to <code className="text-[10px] font-mono">/api/tenant/documents</code> with your tenant ID and attached to your business profile.
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
                Upload official company registration, tax certificates, or address proofs to complete WhatsApp verification via <code className="text-[10px] font-mono">/api/tenant/documents</code>.
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

        {/* Uploader Card */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Document Category</Label>
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground focus:outline-none focus:border-ring"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Select File (PDF, PNG, JPG - max 10MB)</Label>
              <Input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setNewDocFile(file);
                }}
                className="text-xs h-9 cursor-pointer file:cursor-pointer file:text-xs file:font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">
              {newDocFile ? `Selected: ${newDocFile.name} (${(newDocFile.size / 1024).toFixed(0)} KB)` : "Choose a verification document to upload"}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleUploadBusinessDoc}
              disabled={!newDocFile || docUploadLoading}
              className="text-xs gap-1.5 h-8 px-3.5 font-medium"
            >
              {docUploadLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Uploading Document...</span>
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  <span>Upload Document</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-foreground">
            Uploaded Business Documents ({tenantDocuments.filter(d => d.document_type !== "logo" && d.type !== "logo").length})
          </Label>

          {tenantDocuments.filter(d => d.document_type !== "logo" && d.type !== "logo").length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-4 text-center bg-muted/10">
              <FileText className="size-6 text-muted-foreground/60 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-foreground">No verification documents uploaded yet</p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-0.5">
                Upload your Business Registration, Incorporation Certificate, or Tax ID documents above for account verification.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenantDocuments
                .filter((doc) => doc.document_type !== "logo" && doc.type !== "logo")
                .map((doc, idx) => {
                  const docId = doc.id || idx;
                  const isOperating = activeDocActionId === docId;
                  const docTypeLabel =
                    DOCUMENT_TYPES.find((t) => t.value === (doc.document_type || doc.type))?.label ||
                    doc.document_type ||
                    doc.type ||
                    "Business Document";

                  return (
                    <div
                      key={docId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/30 transition-colors gap-2.5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                              {doc.name || doc.title || doc.file_name || `Document #${doc.id}`}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 capitalize ${
                                (doc.status === "verified" || doc.status === "active")
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : doc.status === "rejected"
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              }`}
                            >
                              <ShieldCheck className="size-2.5 mr-1 inline" />
                              {doc.status || "Uploaded"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {docTypeLabel} {doc.file_size ? `• ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        {/* Download Document */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => handleDownloadDoc(doc)}
                          disabled={isOperating}
                          className="text-xs gap-1 h-7 px-2 hover:bg-muted"
                          title="Download document"
                        >
                          {isOperating ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Download className="size-3 text-muted-foreground" />
                          )}
                          <span>Download</span>
                        </Button>

                        {/* Replace Document */}
                        <label className="inline-flex items-center gap-1 cursor-pointer rounded-lg border border-border/80 px-2 py-1 text-xs hover:bg-muted font-medium text-foreground transition-colors h-7">
                          <RefreshCw className="size-3 text-muted-foreground" />
                          <span>Replace</span>
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg"
                            disabled={isOperating}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && doc.id) {
                                handleReplaceDoc(doc.id, file, doc.document_type || doc.type);
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {/* Delete Document */}
                        {doc.id && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteDoc(doc.id!)}
                            disabled={isOperating}
                            className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7 px-2"
                            title="Delete document"
                          >
                            <Trash2 className="size-3" />
                            <span>Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
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

