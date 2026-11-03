/**
 * Centralized formatting utilities for dates, numbers, percentages, and currencies
 * Designed to handle missing, null, and zero values safely without throwing errors.
 */

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0.0%";
  }
  return `${value.toFixed(decimals)}%`;
}

export function formatCurrency(
  value: number | undefined | null,
  currency = "INR"
): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return `${currency} 0`;
  }
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${formatNumber(value)}`;
  }
}

export function formatDurationMinutes(minutes: number | undefined | null): string {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes) || minutes <= 0) {
    return "0s";
  }
  const totalSeconds = Math.round(minutes * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Recently";

    // Use fixed reference or now
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (diffMs < 0) return "Just now";

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export function formatDateShort(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}


