import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { setTenantIdGetter } from "@/src/lib/api/client";
import type { Tenant } from "@/types/tenant";

export interface TenantWithDetails extends Tenant {
  timezone?: string;
  currency?: string;
  [key: string]: any;
}

export interface TenantStore {
  activeTenant: TenantWithDetails | null;
  availableTenants: TenantWithDetails[];
  isLoading: boolean;
  setActiveTenant: (tenant: TenantWithDetails | null) => void;
  setAvailableTenants: (tenants: TenantWithDetails[]) => void;
  setLoading: (isLoading: boolean) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantStore>()(
  persist(
    (set) => ({
      activeTenant: null,
      availableTenants: [],
      isLoading: false,

      setActiveTenant: (tenant) => set({ activeTenant: tenant }),
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setLoading: (isLoading) => set({ isLoading }),
      clearTenant: () => set({ activeTenant: null, availableTenants: [] }),
    }),
    {
      name: "whatsapp-tenant-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as any)
      ),
      partialize: (state) => ({
        activeTenant: state.activeTenant,
        availableTenants: state.availableTenants,
      }),
    }
  )
);

// Register active tenant ID resolver for ApiClient
setTenantIdGetter(() => {
  const activeTenant = useTenantStore.getState().activeTenant;
  if (activeTenant?.id) return activeTenant.id;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("whatsapp-tenant-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.state?.activeTenant?.id || null;
      }
    } catch {
      // ignore
    }
  }
  return null;
});
