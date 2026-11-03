import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatDurationMinutes,
  formatRelativeTime,
  formatDateShort,
} from "@/lib/formatters";
import { dashboardKeys } from "@/features/dashboard/hooks";

describe("Dashboard Formatters", () => {
  it("formats numbers safely with locale grouping and handles missing values", () => {
    expect(formatNumber(1248)).toBe("1,248");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(NaN)).toBe("0");
  });

  it("formats percentages with specified decimals and handles missing values", () => {
    expect(formatPercent(98.6)).toBe("98.6%");
    expect(formatPercent(98.654, 2)).toBe("98.65%");
    expect(formatPercent(0)).toBe("0.0%");
    expect(formatPercent(undefined)).toBe("0.0%");
    expect(formatPercent(null)).toBe("0.0%");
    expect(formatPercent(NaN)).toBe("0.0%");
  });

  it("formats currencies without throwing exceptions", () => {
    const formattedInr = formatCurrency(5000, "INR");
    expect(formattedInr).toContain("5,000");

    const formattedUsd = formatCurrency(120, "USD");
    expect(formattedUsd).toContain("120");

    expect(formatCurrency(0, "INR")).toContain("0");
    expect(formatCurrency(null, "INR")).toBe("INR 0");
    expect(formatCurrency(undefined, "INR")).toBe("INR 0");
  });

  it("formats duration minutes to minutes and seconds accurately", () => {
    expect(formatDurationMinutes(3.5)).toBe("3m 30s");
    expect(formatDurationMinutes(1)).toBe("1m");
    expect(formatDurationMinutes(0.5)).toBe("30s");
    expect(formatDurationMinutes(0)).toBe("0s");
    expect(formatDurationMinutes(undefined)).toBe("0s");
    expect(formatDurationMinutes(null)).toBe("0s");
  });

  it("formats relative timestamps safely", () => {
    // Exact recent past
    const oneMinAgo = new Date(Date.now() - 1000 * 60 * 2).toISOString();
    expect(formatRelativeTime(oneMinAgo)).toContain("m ago");

    const oneHourAgo = new Date(Date.now() - 1000 * 60 * 65).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe("1h ago");

    // Missing or invalid
    expect(formatRelativeTime(undefined)).toBe("Recently");
    expect(formatRelativeTime(null)).toBe("Recently");
    expect(formatRelativeTime("invalid-date-string")).toBe("Recently");
  });

  it("formats dates safely", () => {
    expect(formatDateShort("2026-11-02T12:00:00.000Z")).toContain("2026");
    expect(formatDateShort(undefined)).toBe("-");
    expect(formatDateShort(null)).toBe("-");
    expect(formatDateShort("not-a-date")).toBe("-");
  });
});

describe("Dashboard Query Keys Tenant Scoping", () => {
  it("scopes all dashboard query keys to the active tenant to prevent cross-tenant cache leaks", () => {
    const tenant1Keys = dashboardKeys.overview("tenant-alpha");
    const tenant2Keys = dashboardKeys.overview("tenant-beta");

    expect(tenant1Keys).toEqual(["dashboard", "tenant-alpha", "overview"]);
    expect(tenant2Keys).toEqual(["dashboard", "tenant-beta", "overview"]);
    expect(tenant1Keys).not.toEqual(tenant2Keys);

    const activityKeys = dashboardKeys.activity("tenant-alpha");
    expect(activityKeys).toEqual(["dashboard", "tenant-alpha", "activity"]);

    const recentChatKeys = dashboardKeys.recentConversations("tenant-alpha");
    expect(recentChatKeys).toEqual(["dashboard", "tenant-alpha", "recent-conversations"]);

    const usageKeys = dashboardKeys.usage("tenant-alpha");
    expect(usageKeys).toEqual(["dashboard", "tenant-alpha", "usage"]);
  });
});

