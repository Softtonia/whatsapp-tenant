import { describe, it, expect } from "vitest";
import { contactSchema, bulkActionSchema, tagCreateSchema } from "@/features/contacts/schemas";
import { leadSchema } from "@/features/leads/schemas";
import { productSchema } from "@/features/products/schemas";
import { contactKeys } from "@/features/contacts/hooks";
import { leadKeys } from "@/features/leads/hooks";
import { productKeys } from "@/features/products/hooks";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { getMockResponse } from "@/src/lib/api/mock";
import type { Contact } from "@/types/contact";
import type { Lead } from "@/types/lead";
import type { Product } from "@/types/product";

describe("Contacts, Leads, and Products Modules", () => {
  describe("Zod Validation Schemas", () => {
    it("validates a valid contact form submission", () => {
      const validContact = {
        name: "Aarav Sharma",
        phone: "+919811122233",
        email: "aarav@example.com",
        company: "Acme Industries",
        source: "WhatsApp Widget",
        tags: ["Enterprise", "High Value"],
      };

      const result = contactSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it("rejects an invalid phone number or invalid email for contacts", () => {
      const invalidPhone = {
        name: "Aarav Sharma",
        phone: "invalid-phone",
        email: "not-an-email",
      };

      const result = contactSchema.safeParse(invalidPhone);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorFields = result.error.issues.map((i) => i.path[0]);
        expect(errorFields).toContain("phone");
        expect(errorFields).toContain("email");
      }
    });

    it("validates bulk action payload with required contact IDs", () => {
      const validBulk = {
        action: "assign_tags" as const,
        contact_ids: [101, 102, "103"],
        tags: ["VIP"],
      };
      expect(bulkActionSchema.safeParse(validBulk).success).toBe(true);

      const emptyBulk = {
        action: "archive" as const,
        contact_ids: [],
      };
      expect(bulkActionSchema.safeParse(emptyBulk).success).toBe(false);
    });

    it("validates contact tag creation hex color code", () => {
      expect(tagCreateSchema.safeParse({ name: "VIP", color: "#3b82f6" }).success).toBe(true);
      expect(tagCreateSchema.safeParse({ name: "VIP", color: "invalid-color" }).success).toBe(false);
    });

    it("validates lead opportunity schema with non-negative deal value", () => {
      const validLead = {
        title: "50-Seat Enterprise WhatsApp Suite",
        contact_id: 101,
        pipeline_stage_id: 2,
        priority: "high" as const,
        value: 250000,
        currency: "INR",
        follow_up_at: "2026-11-04",
      };
      expect(leadSchema.safeParse(validLead).success).toBe(true);

      const negativeLead = {
        ...validLead,
        value: -500,
      };
      expect(leadSchema.safeParse(negativeLead).success).toBe(false);
    });

    it("validates product schema with price, SKU, and image URL format", () => {
      const validProduct = {
        name: "Wireless Noise-Canceling Earbuds",
        sku: "WNC-202",
        price: 2199,
        currency: "INR",
        description: "Bluetooth 5.3 earbuds with 32h playtime.",
        category: "Electronics",
        is_active: true,
        stock_quantity: 50,
        image_url: "https://images.example.com/item.jpg",
      };
      expect(productSchema.safeParse(validProduct).success).toBe(true);

      const invalidProduct = {
        ...validProduct,
        price: -10,
        image_url: "invalid-url",
      };
      expect(productSchema.safeParse(invalidProduct).success).toBe(false);
    });
  });

  describe("API Endpoints & Tenant Isolation", () => {
    it("defines centralized, strongly typed endpoints for contacts, leads, and products", () => {
      expect(API_ENDPOINTS.CONTACTS.LIST).toBe("/api/contacts");
      expect(API_ENDPOINTS.CONTACTS.DETAIL(101)).toBe("/api/contacts/101");
      expect(API_ENDPOINTS.CONTACTS.TAGS).toBe("/api/contact-tags");
      expect(API_ENDPOINTS.CONTACTS.BULK).toBe("/api/contacts/bulk");
      expect(API_ENDPOINTS.CONTACTS.IMPORTS).toBe("/api/contacts/imports");
      expect(API_ENDPOINTS.CONTACTS.EXPORTS).toBe("/api/contacts/exports");

      expect(API_ENDPOINTS.LEADS.LIST).toBe("/api/leads");
      expect(API_ENDPOINTS.LEADS.DETAIL(5)).toBe("/api/leads/5");
      expect(API_ENDPOINTS.LEADS.STAGES).toBe("/api/lead-pipeline/stages");

      expect(API_ENDPOINTS.PRODUCTS.LIST).toBe("/api/products");
      expect(API_ENDPOINTS.PRODUCTS.DETAIL(12)).toBe("/api/products/12");
      expect(API_ENDPOINTS.PRODUCTS.SYNC_CATALOG).toBe("/api/products/sync-catalog");
    });

    it("isolates query cache keys per active tenant workspace", () => {
      const tenantA = "tenant-100";
      const tenantB = "tenant-200";

      // Contacts cache isolation
      const contactKeyA = contactKeys.list(tenantA, { search: "Aarav" });
      const contactKeyB = contactKeys.list(tenantB, { search: "Aarav" });
      expect(contactKeyA).not.toEqual(contactKeyB);
      expect(contactKeyA).toEqual(["contacts", "tenant-100", "list", { search: "Aarav" }]);

      // Leads cache isolation
      const leadKeyA = leadKeys.list(tenantA, { priority: "high" });
      const leadKeyB = leadKeys.list(tenantB, { priority: "high" });
      expect(leadKeyA).not.toEqual(leadKeyB);
      expect(leadKeyA).toEqual(["leads", "tenant-100", "list", { priority: "high" }]);

      // Products cache isolation
      const productKeyA = productKeys.list(tenantA, { is_active: true });
      const productKeyB = productKeys.list(tenantB, { is_active: true });
      expect(productKeyA).not.toEqual(productKeyB);
      expect(productKeyA).toEqual(["products", "tenant-100", "list", { is_active: true }]);
    });
  });

  describe("Mock Adapter Integration", () => {
    it("returns filtered contacts from mock adapter", () => {
      const res = getMockResponse<Contact[]>("/api/contacts?search=Aarav", "GET");
      expect(res).not.toBeNull();
      expect(res?.success).toBe(true);
      expect(res?.data.length).toBeGreaterThan(0);
      expect(res?.data[0].name).toContain("Aarav");
    });

    it("returns pipeline stages and leads from mock adapter", () => {
      const stagesRes = getMockResponse("/api/lead-pipeline/stages", "GET");
      expect(stagesRes).not.toBeNull();
      expect(stagesRes?.success).toBe(true);

      const leadsRes = getMockResponse<Lead[]>("/api/leads", "GET");
      expect(leadsRes).not.toBeNull();
      expect(leadsRes?.success).toBe(true);
      expect(leadsRes?.data.length).toBeGreaterThan(0);
    });

    it("returns products catalog and supports catalog sync mutation from mock adapter", () => {
      const productsRes = getMockResponse<Product[]>("/api/products", "GET");
      expect(productsRes).not.toBeNull();
      expect(productsRes?.success).toBe(true);
      expect(productsRes?.data.length).toBeGreaterThan(0);

      const syncRes = getMockResponse<{ status: string; synced_count: number }>(
        "/api/products/sync-catalog",
        "POST"
      );
      expect(syncRes).not.toBeNull();
      expect(syncRes?.success).toBe(true);
      expect(syncRes?.data.status).toBe("synced");
    });
  });
});

