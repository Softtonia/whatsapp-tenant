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
} from "@/types/onboarding";

// 0. Tenant Industries
export async function fetchTenantIndustries(tenantId?: string | number): Promise<Industry[]> {
  const response: any = await apiClient.get<any>(API_ENDPOINTS.TENANT.INDUSTRIES, {
    tenantId,
  });
  const data = response?.data || response;
  return Array.isArray(data) ? data : data?.industries || [];
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
