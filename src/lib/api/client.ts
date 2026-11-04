import type { ApiResponse } from "@/types/api";
import { getMockResponse } from "./mock";
import { env } from "@/src/lib/env";

type TokenGetter = () => string | null | undefined;
type UnauthorizedHandler = () => void;
type TenantIdGetter = () => string | number | null | undefined;

let tokenGetter: TokenGetter = () => null;
let unauthorizedHandler: UnauthorizedHandler = () => {};
let tenantIdGetter: TenantIdGetter = () => null;

export function setAuthTokenGetter(fn: TokenGetter) {
  tokenGetter = fn;
}

export function setUnauthorizedHandler(fn: UnauthorizedHandler) {
  unauthorizedHandler = fn;
}

export function setTenantIdGetter(fn: TenantIdGetter) {
  tenantIdGetter = fn;
}

export interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  tenantId?: string | number;
}

class ApiClient {
private getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  return (
    process.env.BACKEND_API_URL ||
    "https://whatsappcrmapi.softtonia.com"
  ).replace(/\/+$/, "");
}

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = this.getBaseUrl();
    const formattedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const base = baseUrl ? `${baseUrl}${formattedEndpoint}` : formattedEndpoint;

    if (!params || Object.keys(params).length === 0) return base;

    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `${base}?${queryString}` : base;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // If mock mode is explicitly activated via env
    const useMock =
      process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
      process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === "true";

    if (useMock) {
      try {
        const mockRes = getMockResponse<T>(endpoint, method, data);
        if (mockRes) return mockRes;
      } catch {
        // Fall back to fetch
      }
    }

    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...config?.headers,
    };
    if (isFormData && headers["Content-Type"]) {
      delete headers["Content-Type"];
    }

    if (!config?.skipAuth) {
      const token = tokenGetter();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const effectiveTenantId = config?.tenantId ?? tenantIdGetter();
    if (
      effectiveTenantId !== undefined &&
      effectiveTenantId !== null &&
      effectiveTenantId !== ""
    ) {
      headers["X-Tenant-ID"] = String(effectiveTenantId);
    }

    const url = this.buildUrl(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: isFormData
          ? data
          : data !== undefined
          ? JSON.stringify(data)
          : undefined,
      });

      if (response.status === 401 && !config?.skipAuth) {
        unauthorizedHandler();
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message = errorData.message;
        if (errorData.errors && typeof errorData.errors === "object") {
          const detailMessages = Object.values(errorData.errors).flat().filter(Boolean);
          if (detailMessages.length > 0) {
            message = detailMessages.join(" ");
          }
        }
        if (!message) {
          message = `Request failed with status ${response.status}`;
        }
        const error: any = new Error(message);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const json = await response.json();
      if (json && typeof json === "object" && !Array.isArray(json)) {
        if (!("data" in json)) {
          json.data = json;
        }
      }
      return json;
    } catch (err: any) {
      // If live backend call fails and mocking is permitted, fallback gracefully
      if (useMock) {
        try {
          const mockRes = getMockResponse<T>(endpoint, method, data);
          if (mockRes) return mockRes;
        } catch {
          // ignore
        }
      }
      throw err;
    }
  }

  get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "GET", undefined, config);
  }

  post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "POST", data, config);
  }

  put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "PUT", data, config);
  }

  patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "PATCH", data, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "DELETE", undefined, config);
  }
}

export const apiClient = new ApiClient();
