import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type {
  TenantRegistrationData,
  BusinessInformationData,
  SubscriptionPlanData,
  MarketingComplianceData,
  FinalActivationData,
  OnboardingProgressData,
  Industry,
  TenantDocument,
} from "@/types/onboarding";

// 0. Tenant Industries & Documents
export async function fetchTenantIndustries(tenantId?: string | number): Promise<Industry[]> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.TENANT.INDUSTRIES, {
    tenantId,
  });
  const data = response?.data || response;
  return Array.isArray(data) ? data : data?.industries || [];
}

export async function uploadTenantDocument(
  fileOrFormData: File | FormData,
  metadata?: {
    document_type?: string;
    type?: string;
    name?: string;
    title?: string;
    tenantId?: string | number;
  }
): Promise<any> {
  let formData: FormData;

  if (typeof FormData !== "undefined" && fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else if (typeof File !== "undefined" && fileOrFormData instanceof File) {
    formData = new FormData();
    formData.append("file", fileOrFormData);
    formData.append("document", fileOrFormData);
    const docType = metadata?.document_type || metadata?.type || "logo";
    formData.append("document_type", docType);
    formData.append("type", docType);
    formData.append("name", metadata?.name || fileOrFormData.name);
    formData.append("title", metadata?.title || metadata?.name || fileOrFormData.name);
  } else {
    formData = new FormData();
    formData.append("file", fileOrFormData as any);
  }

  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.DOCUMENTS,
    formData,
    {
      tenantId: metadata?.tenantId,
    }
  );

  return response?.data || response;
}

export async function fetchTenantDocuments(tenantId?: string | number): Promise<TenantDocument[]> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.TENANT.DOCUMENTS, {
    tenantId,
  });
  const data = response?.data || response;
  return Array.isArray(data) ? data : data?.data || data?.documents || [];
}

export async function fetchTenantDocument(
  documentId: string | number,
  tenantId?: string | number
): Promise<TenantDocument> {
  const response: any = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_DETAIL(documentId),
    { tenantId }
  );
  return response?.data || response;
}

export async function updateTenantDocument(
  documentId: string | number,
  data: Partial<TenantDocument>,
  tenantId?: string | number
): Promise<any> {
  const response: any = await apiClient.put<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_UPDATE(documentId),
    data,
    { tenantId }
  );
  return response?.data || response;
}

export async function replaceTenantDocument(
  documentId: string | number,
  fileOrFormData: File | FormData,
  metadata?: { name?: string; title?: string; document_type?: string; tenantId?: string | number }
): Promise<any> {
  let formData: FormData;

  if (typeof FormData !== "undefined" && fileOrFormData instanceof FormData) {
    formData = fileOrFormData;
  } else if (typeof File !== "undefined" && fileOrFormData instanceof File) {
    formData = new FormData();
    formData.append("file", fileOrFormData);
    formData.append("document", fileOrFormData);
    if (metadata?.name || fileOrFormData.name) {
      formData.append("name", metadata?.name || fileOrFormData.name);
      formData.append("title", metadata?.title || metadata?.name || fileOrFormData.name);
    }
    if (metadata?.document_type) {
      formData.append("document_type", metadata.document_type);
      formData.append("type", metadata.document_type);
    }
  } else {
    formData = new FormData();
    formData.append("file", fileOrFormData as any);
  }

  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_REPLACE(documentId),
    formData,
    { tenantId: metadata?.tenantId }
  );

  return response?.data || response;
}

export async function fetchTenantDocumentStatus(
  documentId: string | number,
  tenantId?: string | number
): Promise<any> {
  const response: any = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_STATUS(documentId),
    { tenantId }
  );
  return response?.data || response;
}

export async function downloadTenantDocument(
  documentId: string | number,
  tenantId?: string | number
): Promise<any> {
  const response: any = await apiClient.get<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_DOWNLOAD(documentId),
    { tenantId }
  );
  return response?.data || response;
}

export async function deleteTenantDocument(
  documentId: string | number,
  tenantId?: string | number
): Promise<any> {
  const response: any = await apiClient.delete<any>(
    API_ENDPOINTS.TENANT.DOCUMENT_DELETE(documentId),
    { tenantId }
  );
  return response?.data || response;
}

// 1. Overview & Step Information
export async function fetchOnboardingOverview(): Promise<any> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.ONBOARDING.BASE);
  return response?.data || response;
}

export async function fetchOnboardingSteps(): Promise<any[]> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.ONBOARDING.STEPS);
  const data = response?.data || response;
  return Array.isArray(data) ? data : data?.steps || [];
}

export async function fetchOnboardingProgress(): Promise<OnboardingProgressData> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.ONBOARDING.PROGRESS);
  return response?.data || response;
}

export async function fetchOnboardingRequirements(): Promise<any> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.ONBOARDING.REQUIREMENTS);
  return response?.data || response;
}

/**
 * Validates whether an onboarding progress payload indicates full onboarding completion.
 */
export function isOnboardingComplete(progress: any): boolean {
  if (!progress) return false;

  // Unwrap if nested under { success: true, data: { ... } }
  const target =
    progress?.data && typeof progress.data === "object" && !Array.isArray(progress.data)
      ? progress.data
      : progress;

  // 1. Explicit boolean flags
  if (target.is_completed === true || target.completed === true) {
    return true;
  }

  // 2. Status check (handles onboarding_status and status)
  const rawStatus = target.onboarding_status || target.status;
  if (typeof rawStatus === "string") {
    const s = rawStatus.toLowerCase();
    if (["completed", "active", "done", "finished"].includes(s)) {
      return true;
    }
  }

  // 3. Progress percentage check (handles percentage and progress_percentage)
  const pct = target.percentage ?? target.progress_percentage;
  if (typeof pct === "number" && pct >= 100) {
    return true;
  }

  // 4. Message indicating completion
  if (typeof target.message === "string") {
    const m = target.message.toLowerCase();
    if (m.includes("already completed") || m.includes("onboarding completed")) {
      return true;
    }
  }

  // 5. Current step marked as completed / done / dashboard
  if (typeof target.current_step === "string") {
    const cs = target.current_step.toLowerCase();
    if (["completed", "done", "finished", "active", "dashboard"].includes(cs)) {
      return true;
    }
  }

  // 6. Check numeric completed_steps vs total_steps
  if (
    typeof target.completed_steps === "number" &&
    typeof target.total_steps === "number" &&
    target.total_steps > 0 &&
    target.completed_steps >= target.total_steps
  ) {
    return true;
  }

  // 7. Check if required steps are in completed_steps array
  const requiredSteps = [
    "tenant_registration",
    "business_information",
    "subscription_plan",
    "marketing_compliance",
    "final_activation",
  ];
  if (
    Array.isArray(target.completed_steps) &&
    (target.completed_steps.includes("final_activation") ||
      (target.completed_steps.length >= requiredSteps.length &&
        requiredSteps.every((step) => target.completed_steps.includes(step))))
  ) {
    return true;
  }

  return false;
}

// 2. Step: Tenant Registration
export async function saveTenantRegistration(data: TenantRegistrationData): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.TENANT_REGISTRATION_SAVE,
    data
  );
  return response?.data || response;
}

export async function completeTenantRegistration(data?: TenantRegistrationData): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.TENANT_REGISTRATION_COMPLETE,
    data || {}
  );
  return response?.data || response;
}

// 3. Step: Business Information (Save Draft & Complete)
export async function saveBusinessInformation(
  data: Partial<BusinessInformationData> | FormData
): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.BUSINESS_INFO_SAVE,
    data
  );
  return response?.data || response;
}

export async function completeBusinessInformation(
  data: BusinessInformationData | FormData
): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.BUSINESS_INFO_COMPLETE,
    data
  );
  return response?.data || response;
}

// 4. Step: Subscription Plan
export async function completeSubscriptionPlan(data: SubscriptionPlanData): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.SUBSCRIPTION_PLAN_COMPLETE,
    data
  );
  return response?.data || response;
}

// 5. Step: Marketing & Compliance
export async function completeMarketingCompliance(data: MarketingComplianceData): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.MARKETING_COMPLIANCE_COMPLETE,
    data
  );
  return response?.data || response;
}

// 6. Step: Final Activation
export async function completeFinalActivation(data?: FinalActivationData): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.FINAL_ACTIVATION_COMPLETE,
    data || {}
  );
  return response?.data || response;
}

// 7. Submit Onboarding
export async function submitOnboarding(): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.SUBMIT,
    {}
  );
  return response?.data || response;
}

// Backwards-compatible legacy helpers
export async function fetchOnboardingStatus(): Promise<any> {
  try {
    return await fetchOnboardingProgress();
  } catch {
    return { current_step: "business_information", is_completed: false };
  }
}

export async function saveBusinessProfile(data: any): Promise<any> {
  const response: any = await apiClient.post<any>(
    API_ENDPOINTS.ONBOARDING.BUSINESS_INFO_COMPLETE,
    data
  );
  return response?.data || response;
}

export async function saveRegionalPreferences(data: any): Promise<any> {
  return completeBusinessInformation(data);
}

export async function saveWhatsAppConnection(data: any): Promise<any> {
  return completeMarketingCompliance(data);
}

export async function saveTeamInvitations(data: any): Promise<any> {
  return completeFinalActivation(data);
}

export async function completeOnboarding(): Promise<any> {
  return submitOnboarding();
}
