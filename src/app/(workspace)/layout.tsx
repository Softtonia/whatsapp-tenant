"use client";

import { useState } from "react";
import { AppSidebar } from "@/src/components/layout/app-sidebar";
import { AppHeader } from "@/src/components/layout/app-header";
import { MobileNavigation } from "@/src/components/layout/mobile-navigation";
import { ReauthDialog } from "@/components/layout/reauth-dialog";
import { useTenantStore } from "@/lib/tenant/store";
import { Loader2 } from "lucide-react";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isTenantLoading = useTenantStore((s) => s.isLoading);

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

