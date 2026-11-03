"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig, getFilteredNavigation } from "@/src/config/navigation";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { useAuthStore } from "@/lib/auth/store";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const userRole = (user?.role || "admin") as any;

  const filteredSections = getFilteredNavigation(userRole);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 relative select-none",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-border/80">
        <WorkspaceSwitcher isCollapsed={isCollapsed} />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.title}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border/80 flex items-center justify-end">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}

