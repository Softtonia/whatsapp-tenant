"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { AppHeader } from "@/src/components/layout/app-header";
import { MobileNavigation } from "@/src/components/layout/mobile-navigation";
import { ReauthDialog } from "@/components/layout/reauth-dialog";
import { useAuthStore } from "@/lib/auth/store";
import { useTenantStore } from "@/lib/tenant/store";
import { useOnboardingProgressQuery, isOnboardingComplete } from "@/features/onboarding/hooks";
import { Loader2 } from "lucide-react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isHydrated, setIsHydrated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isTenantLoading = useTenantStore((s) => s.isLoading);

  // Check onboarding progress for the tenant
  const {
    data: progressData,
    isLoading: isProgressLoading,
    isFetched: isProgressFetched,
  } = useOnboardingProgressQuery();

  const isCompleted = isOnboardingComplete(progressData);

  // 1. Wait for client-side mount & hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 2. Auth & Onboarding Navigation Guard
  useEffect(() => {
    if (!isHydrated) return;

    // Check localStorage directly as a fallback to prevent hydration timing issues
    let hasToken = Boolean(token || isAuthenticated);
    if (!hasToken && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("whatsapp-auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) {
            hasToken = true;
          }
        }
      } catch {
        // ignore
      }
    }

    // If genuinely not authenticated, redirect to /login
    if (!hasToken) {
      router.replace("/login");
      return;
    }

    // If progress check finished and onboarding is NOT completed, redirect to /organization-setup
    if (isProgressFetched && !isCompleted) {
      router.replace("/organization-setup");
    }
  }, [isHydrated, token, isAuthenticated, isProgressFetched, isCompleted, router]);

  // While client hydration is running, show clean workspace loader
  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading workspace...</p>
      </div>
    );
  }

  // Check token existence (including synchronous localStorage fallback)
  let hasToken = Boolean(token || isAuthenticated);
  if (!hasToken && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("whatsapp-auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          hasToken = true;
        }
      }
    } catch {
      // ignore
    }
  }

  // If unauthenticated, show redirecting state
  if (!hasToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Checking authentication...</p>
      </div>
    );
  }

  // While checking onboarding progress, DO NOT render sidebar or dashboard
  if (isProgressLoading || !isProgressFetched) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-foreground">Verifying workspace onboarding status...</p>
        <p className="text-xs text-muted-foreground">Checking multi-tenant configuration</p>
      </div>
    );
  }

  // If onboarding is incomplete, do NOT show dashboard or workspace layout
  if (!isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-foreground">Onboarding Incomplete</p>
        <p className="text-xs text-muted-foreground">Redirecting to organization setup wizard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Session Expiration & Reauthentication Dialog */}
      <ReauthDialog />

      {/* Desktop Collapsible App Sidebar */}
      <AppSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader
          onToggleMobileNav={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {isTenantLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 animate-in fade-in-0 duration-150">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Switching workspace context...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
