import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
  bordered = true,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        bordered && "pb-6 border-b border-border/60",
        className
      )}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground pb-1" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="size-3 text-muted-foreground/60" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-foreground font-medium" : ""}>
                      {crumb.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

