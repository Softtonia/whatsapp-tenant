"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  FileCheck2,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Calendar,
  X,
  UserCheck,
  Building,
} from "lucide-react";
import {
  useTenantDocumentsQuery,
  useUploadTenantDocumentMutation,
  useReplaceTenantDocumentMutation,
  useDeleteTenantDocumentMutation,
  useDownloadTenantDocumentMutation,
  useCompleteBusinessDocumentsMutation,
} from "../hooks";
import { useTenantStore } from "@/lib/tenant/store";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { TenantDocument, ServerOnboardingStep } from "@/types/onboarding";

export const DOCUMENT_TYPES = [
  { label: "GST Certificate", value: "gst_certificate" },
  { label: "PAN Card", value: "pan_card" },
  { label: "Business Registration", value: "business_registration" },
  { label: "Tax ID", value: "tax_id" },
  { label: "Tax Certificate", value: "tax_certificate" },
  { label: "Certificate of Incorporation", value: "certificate_of_incorporation" },
  { label: "Articles of Incorporation", value: "articles_of_incorporation" },
  { label: "Partnership Deed", value: "partnership_deed" },
  { label: "Shop Establishment Certificate", value: "shop_establishment_certificate" },
  { label: "Business Address Proof", value: "business_address_proof" },
  { label: "Utility Bill", value: "utility_bill" },
  { label: "Director ID", value: "director_id" },
  { label: "Passport", value: "passport" },
  { label: "National ID", value: "national_id" },
  { label: "Bank Statement", value: "bank_statement" },
  { label: "Board Resolution", value: "board_resolution" },
  { label: "Memorandum of Association", value: "memorandum_of_association" },
  { label: "Other", value: "other" },
];

interface StepBusinessDocumentsProps {
  onNext: () => void;
  onBack: () => void;
  isCompleted?: boolean;
  stepData?: ServerOnboardingStep;
}

export function StepBusinessDocuments({
  onNext,
  onBack,
  isCompleted = false,
  stepData,
}: StepBusinessDocumentsProps) {
  const activeTenant = useTenantStore((s) => s.activeTenant);
  const user = useAuthStore((s) => s.user);
  const tenantId = activeTenant?.id || user?.tenant_id || undefined;

  // Document server queries & mutations
  const { data: serverDocs, isLoading: isLoadingDocs, refetch: refetchDocs } = useTenantDocumentsQuery(tenantId);
  const uploadDocMutation = useUploadTenantDocumentMutation();
  const replaceDocMutation = useReplaceTenantDocumentMutation();
  const deleteDocMutation = useDeleteTenantDocumentMutation();
  const downloadDocMutation = useDownloadTenantDocumentMutation();
  const completeDocsMutation = useCompleteBusinessDocumentsMutation();

  // Local state for documents list
  const [documents, setDocuments] = useState<TenantDocument[]>([]);

  // Form state
  const [selectedDocType, setSelectedDocType] = useState<string>("pan_card");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [isSubmittingStep, setIsSubmittingStep] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize server documents
  useEffect(() => {
    if (Array.isArray(serverDocs)) {
      setDocuments(serverDocs);
    }
  }, [serverDocs]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setErrorMessage("File exceeds the maximum allowed size of 10 MB.");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setErrorMessage("Only PDF, JPG, and PNG files are accepted.");
      return;
    }
    setSelectedFile(file);
  };

  // Upload Document Action
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload.");
      return;
    }
    if (!selectedDocType) {
      setErrorMessage("Please select a document type.");
      return;
    }

    setErrorMessage(null);
    setSuccessFeedback(null);

    const typeObj = DOCUMENT_TYPES.find((t) => t.value === selectedDocType);
    const docTitle = typeObj?.label || selectedDocType;

    try {
      const res = await uploadDocMutation.mutateAsync({
        file: selectedFile,
        document_type: selectedDocType,
        document_number: documentNumber || undefined,
        expiry_date: expiryDate || undefined,
        name: selectedFile.name,
        title: docTitle,
        tenantId,
      });

      const uploadedItem = res?.data || res;
      const newDoc: TenantDocument = {
        id: uploadedItem?.id || Date.now(),
        name: uploadedItem?.name || docTitle,
        title: uploadedItem?.title || docTitle,
        file_name: uploadedItem?.file_name || selectedFile.name,
        document_type: uploadedItem?.document_type || selectedDocType,
        type: uploadedItem?.type || selectedDocType,
        document_number: documentNumber || uploadedItem?.document_number,
        expiry_date: expiryDate || uploadedItem?.expiry_date,
        file_size: selectedFile.size,
        file_url: uploadedItem?.file_url || uploadedItem?.url,
        status: uploadedItem?.status || "uploaded",
        created_at: new Date().toISOString(),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedFile(null);
      setDocumentNumber("");
      setExpiryDate("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setSuccessFeedback(`${docTitle} uploaded successfully.`);
      refetchDocs();
      setTimeout(() => setSuccessFeedback(null), 4000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId: string | number) => {
    setActiveActionId(docId);
    setErrorMessage(null);
    try {
      await deleteDocMutation.mutateAsync({ documentId: docId, tenantId });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      refetchDocs();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setActiveActionId(null);
    }
  };

  // Replace Document
  const handleReplaceDocument = async (docId: string | number, file: File, docType?: string) => {
    setActiveActionId(docId);
    setErrorMessage(null);
    try {
      const res = await replaceDocMutation.mutateAsync({
        documentId: docId,
        file,
        document_type: docType,
        tenantId,
      });
      const updated = res?.data || res;
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                file_name: file.name,
                file_size: file.size,
                status: updated?.status || "uploaded",
              }
            : d
        )
      );
      refetchDocs();
      setSuccessFeedback("Document replaced successfully.");
      setTimeout(() => setSuccessFeedback(null), 3000);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setActiveActionId(null);
    }
  };

  // Download / Preview Document
  const handleDownloadDocument = async (doc: TenantDocument) => {
    if (!doc.id) return;
    setActiveActionId(doc.id);
    try {
      const res = await downloadDocMutation.mutateAsync({
        documentId: doc.id,
        tenantId,
      });
      const downloadUrl = res?.download_url || res?.url || doc.file_url || doc.url;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setActiveActionId(null);
    }
  };

  // Step Completion (Requires at least 2 valid documents)
  const handleContinue = async () => {
    if (documents.length < 2) {
      setErrorMessage("Please upload at least 2 valid documents to complete this step.");
      return;
    }

    try {
      setIsSubmittingStep(true);
      setErrorMessage(null);

      try {
        await completeDocsMutation.mutateAsync({});
      } catch (completeErr) {
        console.warn("Step completion non-fatal warning:", completeErr);
      }

      onNext();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSubmittingStep(false);
    }
  };

  const uploadedCount = documents.length;
  const progressPercent = Math.min(100, Math.round((uploadedCount / 2) * 100));
  const canContinue = uploadedCount >= 2;

  // Icon resolver based on document type
  const getDocumentIcon = (type?: string, name?: string) => {
    const isPdf = name?.toLowerCase().endsWith(".pdf") || type?.includes("pdf");
    if (isPdf) {
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
          <FileText className="size-4" />
        </div>
      );
    }
    if (type?.includes("pan") || type?.includes("passport") || type?.includes("id")) {
      return (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <UserCheck className="size-4" />
        </div>
      );
    }
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Building className="size-4" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Business Documents
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
            Upload your business documents
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Upload any 2 valid documents to complete this step. Select a document type for each file.
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start sm:self-auto text-xs px-2.5 py-1 font-semibold text-primary border-primary/30 bg-primary/5"
        >
          Step 3 of 6
        </Badge>
      </div>

      {/* Upload Progress Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground">Upload progress</span>
          <span className={canContinue ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
            {uploadedCount} / 2 documents
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              canContinue ? "bg-emerald-500" : "bg-zinc-800 dark:bg-zinc-200"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {canContinue
            ? "Minimum 2 valid documents uploaded. You can continue or upload additional verification proofs."
            : "Minimum 2 valid documents required."}
        </p>
      </div>

      {/* Error & Success Feedback */}
      {errorMessage && (
        <div className="p-3.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successFeedback && (
        <div className="p-3.5 text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 font-medium">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successFeedback}</span>
        </div>
      )}

      {/* Add a Document Card */}
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Add a document</h3>

        {/* 1. Select document type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            1. Select document type *
          </label>
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="w-full text-xs h-10 rounded-xl border border-border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Upload document (Drag & drop zone) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            2. Upload document *
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
              isDragging
                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-border"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud className="size-5" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">
                Drag and drop your file here
              </p>
              <p className="text-[11px] text-muted-foreground">
                or click below to browse files
              </p>
            </div>

            <button
              type="button"
              className="px-3.5 py-1 rounded-full text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition-colors"
            >
              Choose File
            </button>

            <span className="text-[10px] text-muted-foreground pt-1">
              PDF, JPG, PNG - Maximum 10 MB
            </span>
          </div>

          {/* Selected File Preview Box */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="size-4 text-primary shrink-0" />
                <span className="font-medium text-foreground truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-muted-foreground hover:text-foreground p-1"
                title="Remove file"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Document number (optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            3. Document number (optional)
          </label>
          <Input
            type="text"
            placeholder="Enter document number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            className="text-xs h-10 rounded-xl"
          />
        </div>

        {/* 4. Expiry date (optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            4. Expiry date (optional)
          </label>
          <div className="relative">
            <Input
              type="date"
              placeholder="Select expiry date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-xs h-10 rounded-xl pr-9 cursor-pointer"
            />
            <Calendar className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Upload Button */}
        <Button
          type="button"
          onClick={handleUploadDocument}
          disabled={!selectedFile || uploadDocMutation.isPending}
          className="w-full h-10 font-bold text-xs bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 shadow-sm"
        >
          {uploadDocMutation.isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-2" />
              Uploading Document...
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">
          Uploaded documents {documents.length > 0 ? `(${documents.length})` : ""}
        </h3>

        {isLoadingDocs && documents.length === 0 ? (
          <div className="p-6 rounded-xl border border-border/60 bg-muted/10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>Loading uploaded documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border/80 bg-muted/10 text-center flex flex-col items-center justify-center space-y-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <FileCheck2 className="size-5" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              No documents uploaded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {documents.map((doc, idx) => {
              const docId = doc.id || `doc-${idx}`;
              const docLabel =
                DOCUMENT_TYPES.find((t) => t.value === (doc.document_type || doc.type))?.label ||
                doc.title ||
                doc.name ||
                doc.document_type ||
                "Business Document";

              const fileSizeText = doc.file_size
                ? doc.file_size > 1024 * 1024
                  ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
                  : `${(doc.file_size / 1024).toFixed(0)} KB`
                : null;

              const isActionActive = activeActionId === docId;

              return (
                <div
                  key={docId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {getDocumentIcon(doc.document_type || doc.type, doc.file_name || doc.name)}

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {docLabel}
                        </h4>
                        {doc.document_number && (
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            #{doc.document_number}
                          </span>
                        )}
                        {doc.expiry_date && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            Exp: {doc.expiry_date}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {doc.file_name || doc.name}
                        {fileSizeText && ` • ${fileSizeText}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
                    <Badge
                      variant="outline"
                      className="text-[10px] capitalize bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold px-2 py-0.5"
                    >
                      Uploaded
                    </Badge>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleDownloadDocument(doc)}
                        disabled={isActionActive}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                      >
                        <Download className="size-3" />
                        <span>Preview</span>
                      </button>

                      <label className="cursor-pointer text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
                        <RefreshCw className="size-3" />
                        <span>Replace</span>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && doc.id) {
                              handleReplaceDocument(doc.id, file, doc.document_type || doc.type);
                            }
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => doc.id && handleDeleteDocument(doc.id)}
                        disabled={isActionActive}
                        className="text-[11px] text-destructive hover:underline font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="size-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Important Callout */}
      <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground font-semibold block mb-0.5">Important</strong>
          <p className="text-[11px] leading-relaxed">
            You can upload any document type. You do not need to upload specific mandatory document names. Two valid documents are required.
          </p>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isSubmittingStep || uploadDocMutation.isPending}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleContinue}
          disabled={!canContinue || isSubmittingStep || uploadDocMutation.isPending}
          className={`text-xs gap-1.5 font-bold transition-all shadow-sm ${
            canContinue
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "opacity-60 cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          {isSubmittingStep ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving Step...</span>
            </>
          ) : canContinue ? (
            <>
              <span>Continue to Subscription Plan</span>
              <ArrowRight className="size-3.5" />
            </>
          ) : (
            <span>Continue after 2 valid uploads</span>
          )}
        </Button>
      </div>
    </div>
  );
}

