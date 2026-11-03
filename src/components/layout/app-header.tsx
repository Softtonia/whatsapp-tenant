"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface AppHeaderProps {
  onToggleMobileNav: () => void;
}

// Generate friendly breadcrumb labels based on pathname
function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Workspace", href: "/dashboard" }];

  return parts.map((segment, index) => {
    const href = "/" + parts.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, href };
  });
}

export function AppHeader({ onToggleMobileNav }: AppHeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left side: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted"
          aria-label="Open navigation drawer"
        >
          <Menu className="size-4" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <Link href="/dashboard" className="hover:text-foreground font-medium">
            Workspace
          </Link>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3 text-muted-foreground/60 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-foreground truncate max-w-[160px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-foreground truncate max-w-[120px]">
                    {crumb.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right side: Global Search + Notifications + Theme Toggle + User Menu */}
      <div className="flex items-center gap-2">
        <div className="relative hidden md:flex items-center">
          <Search className="size-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, phone, chats (Ctrl+K)..."
            className="h-9 w-52 lg:w-64 rounded-lg border border-border/80 bg-muted/40 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>

        <ThemeToggle />

        <Link href="/chats">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground relative"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          </Button>
        </Link>

        <div className="h-4 w-px bg-border mx-1" />

        <UserNav />
      </div>
    </header>
  );
}

