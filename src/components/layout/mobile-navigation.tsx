"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { getFilteredNavigation } from "@/src/config/navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Badge } from "@/components/ui/badge";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const navSections = getFilteredNavigation(user?.role);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <div className="relative flex w-80 max-w-[85vw] flex-col bg-card border-r border-border p-4 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="size-4" />
            </div>
            <span className="font-bold text-sm text-foreground">WhatsApp CRM</span>
          </div>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Workspace Switcher in Drawer */}
        <div className="py-3 border-b border-border/60">
          <WorkspaceSwitcher isCollapsed={false} />
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || "secondary"} className="text-[9px] py-0 h-4">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

