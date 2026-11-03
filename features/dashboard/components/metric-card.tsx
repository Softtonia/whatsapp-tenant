"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
  link?: string;
  warningText?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  isLoading = false,
  link,
  warningText,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const content = (
    <Card className={`border-border/80 shadow-xs transition-all ${
      link ? "hover:border-primary/40 hover:shadow-sm cursor-pointer" : ""
    } ${warningText ? "border-warning/40 bg-warning/[0.02]" : ""}`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className={`flex size-8 items-center justify-center rounded-lg ${
            warningText
              ? "bg-warning/15 text-warning-foreground dark:text-warning"
              : "bg-muted text-foreground"
          }`}>
            <Icon className={`size-4 ${warningText ? "text-warning" : "text-primary"}`} />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </span>
          {change && (
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {changeType === "positive" ? (
                <ArrowUpRight className="size-3.5 mr-0.5" />
              ) : changeType === "negative" ? (
                <ArrowDownRight className="size-3.5 mr-0.5" />
              ) : null}
              {change}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          {description && (
            <p className="text-[11px] text-muted-foreground truncate">{description}</p>
          )}
          {warningText && (
            <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
              <AlertTriangle className="size-2.5" />
              {warningText}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
