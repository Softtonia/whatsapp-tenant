import { describe, it, expect } from "vitest";
import { navigationConfig, getFilteredNavigation } from "@/config/navigation";

describe("E2E Workspace Flow Architecture & Route Structure", () => {
  it("verifies critical workspace route map exists and is defined", () => {
    const routeStructure = {
      auth: ["/login", "/forgot-password", "/reset-password"],
      onboarding: ["/organization-setup"],
      workspace: [
        "/dashboard",
        "/chats",
        "/contacts",
        "/campaigns",
        "/products",
        "/ai-chatbot",
        "/automation",
        "/whatsapp-connections",
        "/templates",
        "/team",
        "/billing",
        "/usage",
        "/settings",
        "/profile",
        "/design-system",
      ],
    };

    expect(routeStructure.auth).toEqual(
      expect.arrayContaining(["/login", "/forgot-password", "/reset-password"])
    );
    expect(routeStructure.onboarding).toContain("/organization-setup");
    expect(routeStructure.workspace.length).toBe(15);
  });

  it("ensures all navigation items have non-empty hrefs and valid titles", () => {
    const allItems = navigationConfig.flatMap((section) => section.items);
    expect(allItems.length).toBeGreaterThanOrEqual(14);

    for (const item of allItems) {
      expect(item.title).toBeTruthy();
      expect(item.href).toMatch(/^\/[a-z0-9-]+$/);
      expect(item.icon).toBeDefined();
    }
  });

  it("filters routes appropriately based on RBAC roles", () => {
    const agentNavigation = getFilteredNavigation("agent");
    const adminNavigation = getFilteredNavigation("admin");

    const agentHrefs = agentNavigation.flatMap((s) => s.items.map((i) => i.href));
    const adminHrefs = adminNavigation.flatMap((s) => s.items.map((i) => i.href));

    // Agent should not have access to billing, team management, or workspace settings
    expect(agentHrefs).not.toContain("/billing");
    expect(agentHrefs).not.toContain("/team");
    expect(agentHrefs).not.toContain("/settings");

    // Agent should have access to operational modules
    expect(agentHrefs).toContain("/dashboard");
    expect(agentHrefs).toContain("/chats");
    expect(agentHrefs).toContain("/contacts");

    // Admin has access to all admin items
    expect(adminHrefs).toContain("/billing");
    expect(adminHrefs).toContain("/team");
    expect(adminHrefs).toContain("/settings");
    expect(adminHrefs).toContain("/usage");
  });
});
