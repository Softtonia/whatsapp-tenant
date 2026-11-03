import { describe, it, expect } from "vitest";
import { navigationConfig, getFilteredNavigation } from "@/src/config/navigation";

describe("Navigation Configuration & RBAC", () => {
  it("should define valid routes for all navigation sections", () => {
    expect(navigationConfig.length).toBeGreaterThan(0);

    for (const section of navigationConfig) {
      expect(section.title).toBeDefined();
      expect(section.items.length).toBeGreaterThan(0);

      for (const item of section.items) {
        expect(item.title).toBeDefined();
        expect(item.href.startsWith("/")).toBe(true);
        expect(item.icon).toBeDefined();
      }
    }
  });

  it("should include core WhatsApp CRM routes", () => {
    const allHrefs = navigationConfig.flatMap((s) => s.items.map((i) => i.href));

    expect(allHrefs).toContain("/dashboard");
    expect(allHrefs).toContain("/chats");
    expect(allHrefs).toContain("/contacts");
    expect(allHrefs).toContain("/campaigns");
    expect(allHrefs).toContain("/products");
    expect(allHrefs).toContain("/ai-chatbot");
    expect(allHrefs).toContain("/automation");
    expect(allHrefs).toContain("/whatsapp-connections");
    expect(allHrefs).toContain("/templates");
    expect(allHrefs).toContain("/team");
    expect(allHrefs).toContain("/billing");
    expect(allHrefs).toContain("/usage");
    expect(allHrefs).toContain("/settings");
    expect(allHrefs).toContain("/profile");
  });

  it("should filter restricted management routes for agent role", () => {
    const filtered = getFilteredNavigation("agent");
    const agentHrefs = filtered.flatMap((s) => s.items.map((i) => i.href));

    expect(agentHrefs).toContain("/dashboard");
    expect(agentHrefs).toContain("/chats");
    expect(agentHrefs).toContain("/contacts");

    // Agent should not have access to admin-only management items
    expect(agentHrefs).not.toContain("/team");
    expect(agentHrefs).not.toContain("/billing");
    expect(agentHrefs).not.toContain("/usage");
    expect(agentHrefs).not.toContain("/settings");
  });

  it("should allow admin role access to management routes", () => {
    const filtered = getFilteredNavigation("admin");
    const adminHrefs = filtered.flatMap((s) => s.items.map((i) => i.href));

    expect(adminHrefs).toContain("/team");
    expect(adminHrefs).toContain("/billing");
    expect(adminHrefs).toContain("/usage");
    expect(adminHrefs).toContain("/settings");
  });
});

