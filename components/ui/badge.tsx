import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline: "text-foreground border-border",
  success:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  warning:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  info:
    "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant && badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
