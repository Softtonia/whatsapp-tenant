import { useTenantStore } from "./store";

export function useActiveTenant() {
  const activeTenant = useTenantStore((s) => s.activeTenant);
  const availableTenants = useTenantStore((s) => s.availableTenants);
  const isLoading = useTenantStore((s) => s.isLoading);
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);

  return {
    activeTenant,
    availableTenants,
    isLoading,
    setActiveTenant,
  };
}

export function useAvailableTenants() {
  return useTenantStore((s) => s.availableTenants);
}
