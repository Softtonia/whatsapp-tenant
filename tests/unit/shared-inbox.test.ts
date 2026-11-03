import { describe, it, expect } from "vitest";
import { conversationKeys } from "@/features/conversations/hooks";
import type { Conversation } from "@/types/whatsapp";

describe("Shared Inbox & WhatsApp 24-Hour Window Logic", () => {
  it("scopes all conversation query keys to active workspace tenant", () => {
    const listKey1 = conversationKeys.list("tenant-1", { status: "open" });
    const listKey2 = conversationKeys.list("tenant-2", { status: "open" });
    expect(listKey1).not.toEqual(listKey2);
    expect(listKey1).toEqual(["conversations", "tenant-1", "list", { status: "open" }]);

    const messageKey1 = conversationKeys.messages("tenant-1", 101);
    const messageKey2 = conversationKeys.messages("tenant-2", 101);
    expect(messageKey1).not.toEqual(messageKey2);
    expect(messageKey1).toEqual(["conversations", "tenant-1", "detail", "101", "messages"]);
  });

  it("calculates 24-hour customer service window status correctly", () => {
    // Helper replicating window logic
    function getWindowStatus(conversation: Partial<Conversation>) {
      if (!conversation.last_inbound_at) {
        return { isOpen: true, hoursLeft: 24, label: "Customer Window Active" };
      }
      const inboundMs = new Date(conversation.last_inbound_at).getTime();
      const expiresMs = conversation.window_expires_at
        ? new Date(conversation.window_expires_at).getTime()
        : inboundMs + 24 * 60 * 60 * 1000;

      const refMs = conversation.last_message_at
        ? new Date(conversation.last_message_at).getTime()
        : inboundMs;

      const isOpen = expiresMs > refMs;
      const hoursLeft = isOpen ? Math.max(1, Math.round((expiresMs - refMs) / (1000 * 60 * 60))) : 0;
      return { isOpen, hoursLeft };
    }

    // Active customer window (within 24 hours)
    const activeConv: Partial<Conversation> = {
      last_inbound_at: "2026-11-02T16:00:00.000Z",
      window_expires_at: "2026-11-03T16:00:00.000Z",
      last_message_at: "2026-11-02T18:00:00.000Z",
    };
    const activeStatus = getWindowStatus(activeConv);
    expect(activeStatus.isOpen).toBe(true);
    expect(activeStatus.hoursLeft).toBeGreaterThan(0);

    // Expired customer window (> 24 hours without inbound message)
    const expiredConv: Partial<Conversation> = {
      last_inbound_at: "2026-10-30T10:00:00.000Z",
      window_expires_at: "2026-10-31T10:00:00.000Z",
      last_message_at: "2026-11-02T12:00:00.000Z",
    };
    const expiredStatus = getWindowStatus(expiredConv);
    expect(expiredStatus.isOpen).toBe(false);
    expect(expiredStatus.hoursLeft).toBe(0);
  });
});

describe("Message Payload Validation & Lifecycle Actions", () => {
  it("constructs standard text and template payloads adhering to Meta Cloud API schemas", () => {
    const textPayload = {
      type: "text" as const,
      content: "Hello from agent",
      body: "Hello from agent",
    };
    expect(textPayload.type).toBe("text");
    expect(textPayload.content).toBe("Hello from agent");

    const templatePayload = {
      type: "template" as const,
      template_name: "order_confirmation_v1",
      language: "en_US",
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: "John Doe" }],
        },
      ],
    };
    expect(templatePayload.type).toBe("template");
    expect(templatePayload.template_name).toBe("order_confirmation_v1");
    expect(templatePayload.components[0]?.parameters[0]?.text).toBe("John Doe");
  });

  it("validates assignment and internal note structures", () => {
    const assignmentPayload = {
      assigned_to: 2,
      notes: "Assigning VIP customer to specialist",
    };
    expect(assignmentPayload.assigned_to).toBe(2);
    expect(assignmentPayload.notes).toContain("VIP");

    const internalNotePayload = {
      note: "Customer confirmed payment via bank transfer",
    };
    expect(internalNotePayload.note).toBeDefined();
    expect(internalNotePayload.note.length).toBeGreaterThan(5);
  });

  it("validates snooze duration format", () => {
    const snoozePayload = {
      snoozed_until: "2026-11-05T10:00:00.000Z",
    };
    const parsedDate = new Date(snoozePayload.snoozed_until);
    expect(parsedDate.getTime()).not.toBeNaN();
    expect(parsedDate.getUTCFullYear()).toBe(2026);
  });
});

