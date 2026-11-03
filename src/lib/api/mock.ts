import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/user";
import type { Tenant, WhatsAppHealthData } from "@/types/tenant";
import type {
  Conversation,
  Message,
  TeamMember,
  InternalNote,
} from "@/types/whatsapp";
import type {
  DashboardOverviewData,
  ConversationActivityPoint,
  UsageSummaryData,
} from "@/types/dashboard";
import type {
  Contact,
  ContactTag,
  ContactActivity,
  ContactNote,
} from "@/types/contact";
import type {
  Lead,
  PipelineStage,
} from "@/types/lead";
import type {
  Product,
} from "@/types/product";
import type {
  Campaign,
  CampaignAnalytics,
  CampaignRecipient,
} from "@/types/campaign";
import type {
  MetaTemplate,
} from "@/types/template";
import type {
  AiBotConfig,
  AiKnowledgeItem,
  AiTestChatMessage,
} from "@/types/chatbot";
import type {
  AutomationRule,
  AutomationExecutionLog,
} from "@/types/automation";
import type {
  TeamMember as FullTeamMember,
  TeamInvitation,
  TenantRole,
  TenantPermission,
} from "@/types/team";
import type {
  WhatsAppAccount,
  WhatsAppPhoneNumber,
  EmbeddedSignupConfig,
} from "@/types/whatsapp";
import type {
  SubscriptionOverview,
  SubscriptionPlan,
  QuotaUsageSummary,
  Invoice,
} from "@/types/billing";
import type {
  BusinessProfile,
  WorkspacePreferences,
  WorkspaceBranding,
  NotificationPreferences,
  UserSession,
} from "@/types/settings";

/**
 * Development Mock Strategy
 * Provides typed, realistic fixture data matching the backend Postman schema.
 * Only activated when NEXT_PUBLIC_ENABLE_API_MOCKING is explicitly enabled.
 */

const mockUser: User = {
  id: 1,
  name: "Vijay Kumar",
  email: "vijay.kumar@softtonia.com",
  phone: "+919876543210",
  role: "admin",
  avatar_url: null,
  is_active: true,
  tenant_id: 1,
  created_at: "2026-01-15T10:00:00Z",
};

const mockTenants: Tenant[] = [
  {
    id: 1,
    name: "Softtonia Solutions",
    slug: "softtonia",
    status: "active",
    plan: "Enterprise",
    timezone: "Asia/Kolkata",
    currency: "INR",
    default_phone_number: "+91 98765 43210",
    waba_id: "waba_109823485723948",
  },
  {
    id: 2,
    name: "Acme Retail Branch",
    slug: "acme-retail",
    status: "active",
    plan: "Professional",
    timezone: "Asia/Kolkata",
    currency: "INR",
    default_phone_number: "+91 98111 22334",
    waba_id: "waba_209823485723949",
  },
];

const mockWhatsAppHealth: WhatsAppHealthData = {
  status: "connected",
  phone_number_id: "109823485723948",
  display_phone_number: "+91 98765 43210",
  verified_name: "Softtonia Solutions",
  quality_rating: "GREEN",
  messaging_limit: "TIER_10K",
  webhook_status: "active",
  last_synced_at: "2026-11-02T19:00:00.000Z",
};

const mockConversations: Conversation[] = [
  {
    id: 1,
    tenant_id: 1,
    contact_id: 101,
    contact_name: "Aarav Sharma",
    contact_phone: "+91 98111 22233",
    status: "open",
    priority: "high",
    assigned_to: 1,
    assigned_agent_name: "Vijay Kumar",
    last_message_preview: "Hi! Can you share pricing for the enterprise WhatsApp plan?",
    last_message_at: "2026-11-02T18:45:00.000Z",
    last_inbound_at: "2026-11-02T18:45:00.000Z",
    window_expires_at: "2026-11-03T18:45:00.000Z",
    unread_count: 2,
    tags: ["Enterprise", "High Value", "Qualified Lead"],
    contact: {
      id: 101,
      name: "Aarav Sharma",
      phone: "+91 98111 22233",
      email: "aarav.sharma@acmeind.com",
      status: "active",
      tags: ["Enterprise", "High Value", "Qualified Lead"],
      created_at: "2026-10-15T10:00:00.000Z",
      custom_attributes: {
        company: "Acme Industries Ltd",
        lead_source: "Website WhatsApp Widget",
        deal_value: "₹2,50,000",
      },
    },
    created_at: "2026-11-02T16:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    contact_id: 102,
    contact_name: "Priya Patel",
    contact_phone: "+91 98222 33344",
    status: "open",
    priority: "medium",
    assigned_to: null,
    assigned_agent_name: null,
    last_message_preview: "Thank you, payment confirmed! When will the webhook be active?",
    last_message_at: "2026-11-02T18:15:00.000Z",
    last_inbound_at: "2026-11-02T18:15:00.000Z",
    window_expires_at: "2026-11-03T18:15:00.000Z",
    unread_count: 0,
    tags: ["New Customer", "Inbound"],
    contact: {
      id: 102,
      name: "Priya Patel",
      phone: "+91 98222 33344",
      email: "priya@retailhub.in",
      status: "active",
      tags: ["New Customer", "Inbound"],
      created_at: "2026-11-01T09:30:00.000Z",
    },
    created_at: "2026-11-02T14:30:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    contact_id: 103,
    contact_name: "Rajesh Gupta",
    contact_phone: "+91 98333 44455",
    status: "pending",
    priority: "low",
    assigned_to: 2,
    assigned_agent_name: "Ananya Sen",
    last_message_preview: "We have dispatched your invoice PDF. Please let us know if received.",
    last_message_at: "2026-11-02T17:30:00.000Z",
    last_inbound_at: "2026-10-30T10:00:00.000Z", // Outside 24h window!
    window_expires_at: "2026-10-31T10:00:00.000Z",
    unread_count: 0,
    tags: ["Billing", "Follow-up"],
    contact: {
      id: 103,
      name: "Rajesh Gupta",
      phone: "+91 98333 44455",
      email: "rajesh.gupta@tradex.com",
      status: "active",
      tags: ["Billing", "Follow-up"],
      created_at: "2026-09-20T11:00:00.000Z",
    },
    created_at: "2026-11-02T13:00:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    contact_id: 104,
    contact_name: "Sara Khan",
    contact_phone: "+971 50 123 4567",
    status: "resolved",
    priority: "medium",
    assigned_to: 1,
    assigned_agent_name: "Vijay Kumar",
    last_message_preview: "Glad we could assist! Have a great day.",
    last_message_at: "2026-11-02T16:20:00.000Z",
    last_inbound_at: "2026-11-02T16:15:00.000Z",
    window_expires_at: "2026-11-03T16:15:00.000Z",
    unread_count: 0,
    tags: ["Support", "Resolved"],
    contact: {
      id: 104,
      name: "Sara Khan",
      phone: "+971 50 123 4567",
      email: "sara@dubaitech.ae",
      status: "active",
      tags: ["Support", "Resolved"],
      created_at: "2026-10-10T14:00:00.000Z",
    },
    created_at: "2026-11-02T11:00:00.000Z",
  },
];

const mockMessages: Record<string | number, Message[]> = {
  1: [
    {
      id: "msg_101",
      conversation_id: 1,
      direction: "inbound",
      type: "text",
      content: "Hello, I am interested in your WhatsApp CRM Enterprise plan for our sales team of 25 agents.",
      status: "read",
      created_at: "2026-11-02T16:00:00.000Z",
    },
    {
      id: "msg_102",
      conversation_id: 1,
      direction: "outbound",
      type: "text",
      content: "Hi Aarav! Thank you for reaching out to Softtonia. Our Enterprise tier includes unlimited broadcast campaigns, 15+ agent seats with granular RBAC, and official Meta Cloud API integration. Let me share our brochure.",
      status: "read",
      sender_name: "Vijay Kumar",
      created_at: "2026-11-02T16:05:00.000Z",
    },
    {
      id: "msg_103",
      conversation_id: 1,
      direction: "outbound",
      type: "document",
      content: "WhatsApp CRM Enterprise Solution Deck (PDF)",
      media_url: "https://example.com/WhatsApp_CRM_Enterprise_2026.pdf",
      media_name: "WhatsApp_CRM_Enterprise_2026.pdf",
      media_size: "2.4 MB",
      media_mime_type: "application/pdf",
      status: "read",
      sender_name: "Vijay Kumar",
      created_at: "2026-11-02T16:06:00.000Z",
    },
    {
      id: "msg_104",
      conversation_id: 1,
      direction: "outbound",
      type: "internal_note",
      content: "Client has budget approval for Q4. Follow up tomorrow regarding SLA commitments.",
      status: "delivered",
      sender_name: "Vijay Kumar",
      is_internal: true,
      created_at: "2026-11-02T16:10:00.000Z",
    },
    {
      id: "msg_105",
      conversation_id: 1,
      direction: "inbound",
      type: "text",
      content: "Hi! Can you share pricing for the enterprise WhatsApp plan?",
      status: "delivered",
      created_at: "2026-11-02T18:45:00.000Z",
    },
  ],
  2: [
    {
      id: "msg_201",
      conversation_id: 2,
      direction: "inbound",
      type: "text",
      content: "Thank you, payment confirmed! When will the webhook be active?",
      status: "delivered",
      created_at: "2026-11-02T18:15:00.000Z",
    },
  ],
  3: [
    {
      id: "msg_301",
      conversation_id: 3,
      direction: "inbound",
      type: "text",
      content: "Can you send our tax invoice for last month?",
      status: "read",
      created_at: "2026-10-30T10:00:00.000Z",
    },
    {
      id: "msg_302",
      conversation_id: 3,
      direction: "outbound",
      type: "document",
      content: "Invoice_OCT_2026.pdf",
      media_url: "https://example.com/invoice.pdf",
      media_name: "Tax_Invoice_OCT26.pdf",
      media_size: "180 KB",
      status: "read",
      sender_name: "Ananya Sen",
      created_at: "2026-10-30T10:15:00.000Z",
    },
    {
      id: "msg_303",
      conversation_id: 3,
      direction: "outbound",
      type: "text",
      content: "We have dispatched your invoice PDF. Please let us know if received.",
      status: "delivered",
      sender_name: "Ananya Sen",
      created_at: "2026-11-02T17:30:00.000Z",
    },
  ],
  4: [
    {
      id: "msg_401",
      conversation_id: 4,
      direction: "inbound",
      type: "text",
      content: "Our phone number verification succeeded. Thanks for the quick support!",
      status: "read",
      created_at: "2026-11-02T16:15:00.000Z",
    },
    {
      id: "msg_402",
      conversation_id: 4,
      direction: "outbound",
      type: "text",
      content: "Glad we could assist! Have a great day.",
      status: "read",
      sender_name: "Vijay Kumar",
      created_at: "2026-11-02T16:20:00.000Z",
    },
  ],
};

const mockTeamMembers: TeamMember[] = [
  { id: 1, name: "Vijay Kumar", email: "vijay.kumar@softtonia.com", role: "admin", is_active: true, status: "active", availability: "online", created_at: "2026-08-15T10:00:00.000Z" },
  { id: 2, name: "Ananya Sen", email: "ananya.sen@softtonia.com", role: "agent", is_active: true, status: "active", availability: "online", created_at: "2026-09-01T09:30:00.000Z" },
  { id: 3, name: "Rohan Mehta", email: "rohan.mehta@softtonia.com", role: "agent", is_active: true, status: "active", availability: "busy", created_at: "2026-09-15T11:00:00.000Z" },
];

const mockNotes: Record<string | number, InternalNote[]> = {
  1: [
    {
      id: "note_1",
      conversation_id: 1,
      author_id: 1,
      author_name: "Vijay Kumar",
      note: "Customer requested escalation to enterprise account manager. Looking for Q4 rollout.",
      created_at: "2026-11-02T16:10:00.000Z",
    },
  ],
};

const mockDashboardOverview: DashboardOverviewData = {
  conversations: {
    total: 1248,
    open: 42,
    unresolved: 8,
    change_pct: 12.5,
  },
  contacts: {
    total: 3820,
    new_today: 34,
    change_pct: 8.3,
  },
  campaigns: {
    total_sent: 14200,
    delivery_rate: 98.6,
    read_rate: 76.4,
    change_pct: 4.2,
  },
  response_time: {
    average_minutes: 3.4,
    sla_breaches: 2,
    unresolved_sla_count: 1,
  },
};

const mockConversationActivity: ConversationActivityPoint[] = [
  { date: "2026-10-27", label: "Mon", incoming: 124, outgoing: 180, resolved: 110 },
  { date: "2026-10-28", label: "Tue", incoming: 156, outgoing: 210, resolved: 145 },
  { date: "2026-10-29", label: "Wed", incoming: 189, outgoing: 245, resolved: 172 },
  { date: "2026-10-30", label: "Thu", incoming: 142, outgoing: 195, resolved: 138 },
  { date: "2026-10-31", label: "Fri", incoming: 210, outgoing: 290, resolved: 198 },
  { date: "2026-11-01", label: "Sat", incoming: 98, outgoing: 130, resolved: 90 },
  { date: "2026-11-02", label: "Sun", incoming: 112, outgoing: 165, resolved: 104 },
];

const mockUsageSummary: UsageSummaryData = {
  plan_name: "Enterprise",
  plan_status: "active",
  billing_cycle_end: "2026-11-30T23:59:59.000Z",
  conversations: {
    used: 8420,
    limit: 10000,
    percentage: 84.2,
    unit: "conversations",
  },
  contacts: {
    used: 3820,
    limit: 50000,
    percentage: 7.6,
    unit: "contacts",
  },
  team_seats: {
    used: 6,
    limit: 15,
    percentage: 40.0,
    unit: "seats",
  },
  phone_numbers: {
    used: 2,
    limit: 5,
    percentage: 40.0,
    unit: "numbers",
  },
};

const mockContactTags: ContactTag[] = [
  { id: 1, name: "Enterprise", color: "#6366f1", contacts_count: 2 },
  { id: 2, name: "High Value", color: "#10b981", contacts_count: 3 },
  { id: 3, name: "Qualified Lead", color: "#3b82f6", contacts_count: 2 },
  { id: 4, name: "VIP", color: "#ec4899", contacts_count: 1 },
  { id: 5, name: "Support", color: "#f59e0b", contacts_count: 1 },
  { id: 6, name: "Follow-up", color: "#8b5cf6", contacts_count: 2 },
  { id: 7, name: "E-commerce", color: "#14b8a6", contacts_count: 2 },
];

const mockContacts: Contact[] = [
  {
    id: 101,
    tenant_id: 1,
    name: "Aarav Sharma",
    phone: "+91 98111 22233",
    email: "aarav.sharma@acmeind.com",
    company: "Acme Industries Ltd",
    source: "WhatsApp Widget",
    status: "active",
    tags: ["Enterprise", "High Value", "Qualified Lead"],
    owner_id: 1,
    owner_name: "Vijay Kumar",
    custom_attributes: {
      industry: "Manufacturing",
      deal_size: "₹2,50,000",
      region: "North India",
    },
    created_at: "2026-10-15T10:00:00.000Z",
    avatar_url: null,
  },
  {
    id: 102,
    tenant_id: 1,
    name: "Priya Patel",
    phone: "+91 98222 33344",
    email: "priya.p@nexuslogistics.in",
    company: "Nexus Logistics",
    source: "Inbound Message",
    status: "active",
    tags: ["Support", "High Value"],
    owner_id: 2,
    owner_name: "Neha Gupta",
    custom_attributes: {
      tier: "Gold Support",
      fleet_size: "120 vehicles",
    },
    created_at: "2026-10-20T11:30:00.000Z",
    avatar_url: null,
  },
  {
    id: 103,
    tenant_id: 1,
    name: "Rohan Verma",
    phone: "+91 98333 44455",
    email: "rohan@quickkart.com",
    company: "QuickKart Hyperlocal",
    source: "Diwali Campaign",
    status: "active",
    tags: ["Follow-up", "E-commerce"],
    owner_id: 1,
    owner_name: "Vijay Kumar",
    custom_attributes: {
      interest: "WhatsApp Catalog API",
      gmv_monthly: "₹45,00,000",
    },
    created_at: "2026-10-25T14:15:00.000Z",
    avatar_url: null,
  },
  {
    id: 104,
    tenant_id: 1,
    name: "Ananya Iyer",
    phone: "+91 98444 55566",
    email: "ananya.iyer@fintechpro.com",
    company: "FinTech Pro Solutions",
    source: "Executive Referral",
    status: "active",
    tags: ["VIP", "Enterprise", "High Value"],
    owner_id: 2,
    owner_name: "Neha Gupta",
    custom_attributes: {
      compliance: "RBI Regulated",
      team_seats: "60 agents",
    },
    created_at: "2026-10-28T09:00:00.000Z",
    avatar_url: null,
  },
  {
    id: 105,
    tenant_id: 1,
    name: "Vikram Malhotra",
    phone: "+91 98555 66677",
    email: "vikram@malhotratextiles.com",
    company: "Malhotra Textiles",
    source: "Cold Outreach",
    status: "archived",
    tags: ["Follow-up"],
    owner_id: null,
    owner_name: null,
    custom_attributes: {
      reason_archived: "Postponed purchase to next FY",
    },
    created_at: "2026-09-01T12:00:00.000Z",
    avatar_url: null,
  },
  {
    id: 106,
    tenant_id: 1,
    name: "Sunita Rao",
    phone: "+91 98666 77788",
    email: "sunita@zenithhealth.org",
    company: "Zenith Healthcare",
    source: "Website Contact Form",
    status: "active",
    tags: ["Enterprise", "Qualified Lead"],
    owner_id: 3,
    owner_name: "Rahul Verma",
    custom_attributes: {
      specialty: "Hospital Chain",
      inquiries_daily: "500+",
    },
    created_at: "2026-10-30T16:20:00.000Z",
    avatar_url: null,
  },
  {
    id: 107,
    tenant_id: 1,
    name: "Amit Sengupta",
    phone: "+91 98777 88899",
    email: "amit.s@bengalcrafts.in",
    company: "Bengal Crafts Co.",
    source: "Meta Instagram Ad",
    status: "active",
    tags: ["E-commerce"],
    owner_id: 1,
    owner_name: "Vijay Kumar",
    custom_attributes: {
      catalog_items: "350 SKUs",
    },
    created_at: "2026-11-01T08:45:00.000Z",
    avatar_url: null,
  },
];

const mockContactActivities: Record<string | number, ContactActivity[]> = {
  101: [
    {
      id: "act_1",
      contact_id: 101,
      type: "message_received",
      description: "Inbound WhatsApp message: 'Can you share pricing for the enterprise WhatsApp plan?'",
      actor_name: "Aarav Sharma",
      created_at: "2026-11-02T18:45:00.000Z",
    },
    {
      id: "act_2",
      contact_id: 101,
      type: "tag_added",
      description: "Tags 'Enterprise', 'High Value' assigned",
      actor_name: "Vijay Kumar",
      created_at: "2026-10-15T10:05:00.000Z",
    },
    {
      id: "act_3",
      contact_id: 101,
      type: "lead_created",
      description: "Created lead 'Enterprise 50-Seat WhatsApp Suite'",
      actor_name: "System",
      created_at: "2026-10-15T10:10:00.000Z",
    },
  ],
  102: [
    {
      id: "act_4",
      contact_id: 102,
      type: "message_received",
      description: "Dispatched template 'support_ticket_resolved'",
      actor_name: "Neha Gupta",
      created_at: "2026-11-02T17:15:00.000Z",
    },
  ],
};

const mockContactNotes: Record<string | number, ContactNote[]> = {
  101: [
    {
      id: "cn_1",
      contact_id: 101,
      author_name: "Vijay Kumar",
      note: "Decision maker for 50+ seats. Prefers WhatsApp communication over email. Follow-up proposal sent.",
      created_at: "2026-10-15T10:30:00.000Z",
    },
  ],
  103: [
    {
      id: "cn_2",
      contact_id: 103,
      author_name: "Vijay Kumar",
      note: "CTO wants documentation on automated order confirmation templates.",
      created_at: "2026-10-25T15:00:00.000Z",
    },
  ],
};

const mockPipelineStages: PipelineStage[] = [
  { id: 1, name: "New Lead", order: 1, color: "#3b82f6", stage_key: "new" },
  { id: 2, name: "Contacted", order: 2, color: "#8b5cf6", stage_key: "contacted" },
  { id: 3, name: "Qualified", order: 3, color: "#06b6d4", stage_key: "qualified" },
  { id: 4, name: "Proposal Sent", order: 4, color: "#f59e0b", stage_key: "proposal" },
  { id: 5, name: "Won / Closed", order: 5, color: "#10b981", stage_key: "won" },
  { id: 6, name: "Lost", order: 6, color: "#ef4444", stage_key: "lost" },
];

const mockLeads: Lead[] = [
  {
    id: 1,
    tenant_id: 1,
    contact_id: 101,
    contact_name: "Aarav Sharma",
    contact_phone: "+91 98111 22233",
    pipeline_stage_id: 4,
    stage_name: "Proposal Sent",
    title: "Enterprise 50-Seat WhatsApp Suite",
    status: "open",
    priority: "high",
    value: 250000,
    currency: "INR",
    follow_up_at: "2026-11-04T10:00:00.000Z",
    assigned_to: 1,
    owner_name: "Vijay Kumar",
    notes: "Proposal PDF shared on WhatsApp. Awaiting CFO sign-off.",
    created_at: "2026-10-15T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    contact_id: 103,
    contact_name: "Rohan Verma",
    contact_phone: "+91 98333 44455",
    pipeline_stage_id: 2,
    stage_name: "Contacted",
    title: "Catalog Commerce API Integration",
    status: "open",
    priority: "medium",
    value: 85000,
    currency: "INR",
    follow_up_at: "2026-11-03T14:30:00.000Z",
    assigned_to: 1,
    owner_name: "Vijay Kumar",
    notes: "Requested developer documentation for webhook setup.",
    created_at: "2026-10-25T14:15:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    contact_id: 104,
    contact_name: "Ananya Iyer",
    contact_phone: "+91 98444 55566",
    pipeline_stage_id: 5,
    stage_name: "Won / Closed",
    title: "FinTech Multi-Agent CRM Tier",
    status: "won",
    priority: "urgent",
    value: 420000,
    currency: "INR",
    follow_up_at: null,
    assigned_to: 2,
    owner_name: "Neha Gupta",
    notes: "Contract signed, 1-year prepayment received.",
    created_at: "2026-10-28T09:00:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    contact_id: 106,
    contact_name: "Sunita Rao",
    contact_phone: "+91 98666 77788",
    pipeline_stage_id: 1,
    stage_name: "New Lead",
    title: "Patient Appointment Automation",
    status: "open",
    priority: "high",
    value: 150000,
    currency: "INR",
    follow_up_at: "2026-11-03T11:00:00.000Z",
    assigned_to: 3,
    owner_name: "Rahul Verma",
    notes: "Inquiry regarding HIPAA/data privacy compliance.",
    created_at: "2026-10-30T16:20:00.000Z",
  },
  {
    id: 5,
    tenant_id: 1,
    contact_id: 107,
    contact_name: "Amit Sengupta",
    contact_phone: "+91 98777 88899",
    pipeline_stage_id: 3,
    stage_name: "Qualified",
    title: "Direct WhatsApp Checkout & Catalog",
    status: "open",
    priority: "medium",
    value: 65000,
    currency: "INR",
    follow_up_at: "2026-11-05T15:00:00.000Z",
    assigned_to: 1,
    owner_name: "Vijay Kumar",
    notes: "Catalog synced, demo scheduled on Google Meet.",
    created_at: "2026-11-01T08:45:00.000Z",
  },
];

const mockProducts: Product[] = [
  {
    id: 1,
    tenant_id: 1,
    name: "Premium Leather Messenger Bag",
    sku: "PLB-001",
    price: 3499,
    currency: "INR",
    description: "Handcrafted full-grain leather laptop messenger bag with waterproof lining.",
    category: "Bags & Luggage",
    is_active: true,
    stock_quantity: 45,
    image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    catalog_status: "synced",
    last_synced_at: "2026-11-02T18:00:00.000Z",
    created_at: "2026-09-10T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    name: "Wireless Noise-Canceling Earbuds",
    sku: "WNC-202",
    price: 2199,
    currency: "INR",
    description: "Bluetooth 5.3 earbuds with 32h playtime and environmental noise cancellation.",
    category: "Electronics",
    is_active: true,
    stock_quantity: 120,
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
    catalog_status: "synced",
    last_synced_at: "2026-11-02T18:00:00.000Z",
    created_at: "2026-09-15T12:00:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    name: "Organic Single-Origin Coffee Beans (500g)",
    sku: "SOC-500",
    price: 799,
    currency: "INR",
    description: "Medium-dark roasted Arabica beans sourced directly from Chikmagalur estates.",
    category: "Beverages",
    is_active: true,
    stock_quantity: 80,
    image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80",
    catalog_status: "synced",
    last_synced_at: "2026-11-02T18:00:00.000Z",
    created_at: "2026-09-20T14:30:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    name: "Minimalist Mechanical Keyboard (TKL)",
    sku: "MMK-87",
    price: 4999,
    currency: "INR",
    description: "Hot-swappable tactile brown switches with custom PBT dye-sub keycaps.",
    category: "Electronics",
    is_active: false,
    stock_quantity: 0,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
    catalog_status: "pending",
    last_synced_at: null,
    created_at: "2026-10-01T11:00:00.000Z",
  },
  {
    id: 5,
    tenant_id: 1,
    name: "Stainless Steel Insulated Tumbler 750ml",
    sku: "SIT-750",
    price: 1299,
    currency: "INR",
    description: "Double-walled vacuum insulated bottle keeping drinks hot for 12h and cold for 24h.",
    category: "Home & Kitchen",
    is_active: true,
    stock_quantity: 65,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    catalog_status: "synced",
    last_synced_at: "2026-11-02T18:00:00.000Z",
    created_at: "2026-10-10T16:00:00.000Z",
  },
];

const mockTenantCampaigns: Campaign[] = [
  {
    id: 1,
    tenant_id: 1,
    name: "Diwali Festive Promotion 2026",
    template_id: 2,
    template_name: "festive_offer_v2",
    phone_number_id: 1,
    sender_number: "+91 98765 43210",
    status: "completed",
    audience_config: {
      tags: ["All Customers", "High Value"],
      variable_mapping: { "1": "name", "2": "company" },
    },
    total_recipients: 5200,
    sent_count: 5200,
    delivered_count: 5140,
    read_count: 4210,
    failed_count: 60,
    created_at: "2026-10-31T14:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    name: "Product Launch: WhatsApp Flow Checkouts",
    template_id: 1,
    template_name: "flow_feature_announcement",
    phone_number_id: 1,
    sender_number: "+91 98765 43210",
    status: "completed",
    audience_config: {
      tags: ["Enterprise", "VIP"],
      variable_mapping: { "1": "name", "2": "company" },
    },
    total_recipients: 3400,
    sent_count: 3400,
    delivered_count: 3350,
    read_count: 2480,
    failed_count: 50,
    created_at: "2026-10-28T09:00:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    name: "Weekly Customer Re-Engagement",
    template_id: 2,
    template_name: "reengage_discount_code",
    phone_number_id: 1,
    sender_number: "+91 98765 43210",
    status: "scheduled",
    scheduled_at: "2026-11-05T10:00:00.000Z",
    audience_config: {
      tags: ["Follow-up"],
      variable_mapping: { "1": "name" },
    },
    total_recipients: 1800,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    failed_count: 0,
    created_at: "2026-11-01T15:00:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    name: "VIP Early Access Q4 Catalog",
    template_id: 1,
    template_name: "order_confirmation_v1",
    phone_number_id: 1,
    sender_number: "+91 98765 43210",
    status: "running",
    audience_config: {
      tags: ["VIP"],
      variable_mapping: { "1": "name", "2": "company" },
    },
    total_recipients: 950,
    sent_count: 620,
    delivered_count: 590,
    read_count: 410,
    failed_count: 12,
    created_at: "2026-11-02T12:00:00.000Z",
  },
  {
    id: 5,
    tenant_id: 1,
    name: "Cart Abandonment Reminder (Draft)",
    template_id: 2,
    template_name: "reengage_customer_window",
    phone_number_id: 1,
    sender_number: "+91 98765 43210",
    status: "draft",
    audience_config: {
      tags: ["E-commerce"],
      variable_mapping: { "1": "name" },
    },
    total_recipients: 320,
    sent_count: 0,
    delivered_count: 0,
    read_count: 0,
    failed_count: 0,
    created_at: "2026-11-02T14:30:00.000Z",
  },
];

const mockCampaignAnalytics: Record<string | number, CampaignAnalytics> = {
  1: {
    campaign_id: 1,
    campaign_name: "Diwali Festive Promotion 2026",
    total_recipients: 5200,
    sent: 5200,
    delivered: 5140,
    read: 4210,
    failed: 60,
    delivery_rate: 98.8,
    read_rate: 81.9,
    click_rate: 34.2,
  },
  4: {
    campaign_id: 4,
    campaign_name: "VIP Early Access Q4 Catalog",
    total_recipients: 950,
    sent: 620,
    delivered: 590,
    read: 410,
    failed: 12,
    delivery_rate: 95.1,
    read_rate: 69.5,
    click_rate: 22.8,
  },
};

const mockCampaignRecipients: Record<string | number, CampaignRecipient[]> = {
  1: [
    {
      id: "rec_1",
      campaign_id: 1,
      contact_id: 101,
      contact_name: "Aarav Sharma",
      contact_phone: "+91 98111 22233",
      status: "read",
      sent_at: "2026-11-01T10:00:02.000Z",
      delivered_at: "2026-11-01T10:00:04.000Z",
      read_at: "2026-11-01T10:15:30.000Z",
    },
    {
      id: "rec_2",
      campaign_id: 1,
      contact_id: 102,
      contact_name: "Priya Patel",
      contact_phone: "+91 98222 33344",
      status: "delivered",
      sent_at: "2026-11-01T10:00:05.000Z",
      delivered_at: "2026-11-01T10:00:09.000Z",
    },
    {
      id: "rec_3",
      campaign_id: 1,
      contact_id: 103,
      contact_name: "Rohan Verma",
      contact_phone: "+91 98333 44455",
      status: "read",
      sent_at: "2026-11-01T10:00:10.000Z",
      delivered_at: "2026-11-01T10:00:12.000Z",
      read_at: "2026-11-01T10:45:00.000Z",
    },
    {
      id: "rec_4",
      campaign_id: 1,
      contact_id: 105,
      contact_name: "Vikram Malhotra",
      contact_phone: "+91 98555 66677",
      status: "failed",
      sent_at: "2026-11-01T10:00:15.000Z",
      error_message: "User opted out / inactive WhatsApp account",
    },
  ],
};

const mockMetaTemplates: MetaTemplate[] = [
  {
    id: 1,
    tenant_id: 1,
    name: "order_confirmation_v1",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    components: [
      { type: "HEADER", format: "TEXT", text: "Order Confirmed" },
      {
        type: "BODY",
        text: "Hello {{1}}, your order #{{2}} has been confirmed. Tracking updates will follow here.",
      },
      { type: "FOOTER", text: "Reply STOP to unsubscribe from alerts" },
      {
        type: "BUTTONS",
        buttons: [
          { type: "URL", text: "Track Order", url: "https://track.example.com" },
          { type: "QUICK_REPLY", text: "Contact Support" },
        ],
      },
    ],
    example_variables: ["Aarav", "ORD-98234"],
    last_synced_at: "2026-11-02T19:00:00.000Z",
    created_at: "2026-09-01T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    name: "reengage_customer_window",
    category: "MARKETING",
    language: "en_US",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Hi {{1}}, we noticed it has been a while since your last inquiry. Would you like to continue our conversation?",
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Yes, continue" },
          { type: "QUICK_REPLY", text: "Not right now" },
        ],
      },
    ],
    example_variables: ["Priya"],
    last_synced_at: "2026-11-02T19:00:00.000Z",
    created_at: "2026-09-15T12:00:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    name: "appointment_reminder",
    category: "UTILITY",
    language: "en_US",
    status: "APPROVED",
    components: [
      {
        type: "BODY",
        text: "Reminder for your appointment on {{1}} at {{2}} with our customer specialist.",
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Confirm" },
          { type: "QUICK_REPLY", text: "Reschedule" },
        ],
      },
    ],
    example_variables: ["Nov 5", "10:30 AM"],
    last_synced_at: "2026-11-02T19:00:00.000Z",
    created_at: "2026-09-20T14:30:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    name: "festive_discount_vip",
    category: "MARKETING",
    language: "en_US",
    status: "PENDING",
    components: [
      { type: "HEADER", format: "IMAGE" },
      {
        type: "BODY",
        text: "Exclusive Diwali Festive Deal! Get {{1}} off on your next purchase using code {{2}}.",
      },
      {
        type: "BUTTONS",
        buttons: [{ type: "URL", text: "Claim Discount", url: "https://shop.example.com" }],
      },
    ],
    example_variables: ["25%", "FESTIVE25"],
    last_synced_at: "2026-11-02T19:00:00.000Z",
    created_at: "2026-11-02T10:00:00.000Z",
  },
  {
    id: 5,
    tenant_id: 1,
    name: "unauthorized_promo_v1",
    category: "MARKETING",
    language: "en_US",
    status: "REJECTED",
    rejection_reason: "Meta policy violation: Prohibited claims and misleading promo wording.",
    components: [
      {
        type: "BODY",
        text: "Click here to claim instant cash prizes and cryptocurrency rewards!",
      },
    ],
    last_synced_at: "2026-11-02T19:00:00.000Z",
    created_at: "2026-10-25T11:00:00.000Z",
  },
];

const mockAiConfig: AiBotConfig = {
  is_enabled: true,
  provider: "gemini-2.5-flash",
  system_prompt:
    "You are an intelligent customer support assistant for Softtonia Solutions. Answer inquiries politely, provide product details, and escalate to human agents when requested.",
  temperature: 0.3,
  confidence_threshold: 0.75,
  handoff_keywords: ["human", "agent", "support", "representative", "manager", "help"],
  fallback_message:
    "I'm connecting you with a human specialist who will assist you shortly. Please hold on.",
  business_hours_only: false,
  reply_delay_seconds: 2,
  updated_at: "2026-11-02T18:00:00.000Z",
};

const mockAiKnowledge: AiKnowledgeItem[] = [
  {
    id: 1,
    tenant_id: 1,
    question: "What are your business support hours?",
    answer: "Our team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.",
    keywords: ["hours", "timings", "working hours", "support hours"],
    is_active: true,
    created_at: "2026-10-01T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    question: "How can I track my order delivery?",
    answer: "You can track your order using the tracking link sent on WhatsApp or by replying with your Order ID.",
    keywords: ["track", "order", "delivery", "shipping", "courier"],
    is_active: true,
    created_at: "2026-10-05T12:00:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    question: "What payment methods are supported?",
    answer: "We support UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, NetBanking, and direct WhatsApp Pay.",
    keywords: ["payment", "pay", "upi", "cards", "cod"],
    is_active: true,
    created_at: "2026-10-10T14:30:00.000Z",
  },
  {
    id: 4,
    tenant_id: 1,
    question: "What is your refund and return policy?",
    answer: "Products can be returned within 7 days of delivery for a full refund if unused and in original packaging.",
    keywords: ["refund", "return", "replacement", "damaged item"],
    is_active: true,
    created_at: "2026-10-15T16:00:00.000Z",
  },
];

const mockAutomationRules: AutomationRule[] = [
  {
    id: 1,
    tenant_id: 1,
    name: "Auto-Welcome Inbound WhatsApp Contacts",
    description: "Sends welcome template when a new contact sends their first WhatsApp message",
    is_active: true,
    trigger_type: "conversation_created",
    conditions: [{ field: "is_first_inbound", operator: "equals", value: "true" }],
    actions: [{ type: "send_template", payload: { template_name: "reengage_customer_window" } }],
    executions_count: 342,
    last_executed_at: "2026-11-02T18:30:00.000Z",
    created_at: "2026-09-15T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    name: "Urgent Keyword Escalation",
    description: "Detects 'urgent' or 'complaint' and tags conversation for priority agent handling",
    is_active: true,
    trigger_type: "keyword_matched",
    conditions: [{ field: "message_text", operator: "contains", value: "urgent,complaint,broken" }],
    actions: [
      { type: "add_tag", payload: { tag: "Escalated" } },
      { type: "assign_agent", payload: { agent_id: 1 } },
    ],
    executions_count: 58,
    last_executed_at: "2026-11-02T16:15:00.000Z",
    created_at: "2026-09-20T11:00:00.000Z",
  },
  {
    id: 3,
    tenant_id: 1,
    name: "Out-of-Hours Autoresponder",
    description: "Replies with business hours notice when customer messages outside 9am-6pm IST",
    is_active: false,
    trigger_type: "outside_business_hours",
    conditions: [],
    actions: [
      {
        type: "send_message",
        payload: {
          text: "Thank you for reaching out! Our team is currently offline and will reply at 9:00 AM IST.",
        },
      },
    ],
    executions_count: 120,
    last_executed_at: "2026-11-01T21:00:00.000Z",
    created_at: "2026-10-01T09:00:00.000Z",
  },
];

const mockAutomationLogs: AutomationExecutionLog[] = [
  {
    id: "log_1",
    rule_id: 1,
    rule_name: "Auto-Welcome Inbound WhatsApp Contacts",
    trigger_event: "conversation_created",
    contact_name: "Aarav Sharma",
    contact_phone: "+91 98111 22233",
    status: "success",
    execution_ms: 142,
    executed_at: "2026-11-02T18:45:00.000Z",
  },
  {
    id: "log_2",
    rule_id: 2,
    rule_name: "Urgent Keyword Escalation",
    trigger_event: "keyword_matched",
    contact_name: "Priya Patel",
    contact_phone: "+91 98222 33344",
    status: "success",
    execution_ms: 98,
    executed_at: "2026-11-02T17:15:00.000Z",
  },
  {
    id: "log_3",
    rule_id: 3,
    rule_name: "Out-of-Hours Autoresponder",
    trigger_event: "outside_business_hours",
    contact_name: "Vikram Malhotra",
    contact_phone: "+91 98555 66677",
    status: "failed",
    execution_ms: 320,
    error_message: "Contact opted out of automated messages",
    executed_at: "2026-11-01T21:05:00.000Z",
  },
];

const mockTenantTeam: FullTeamMember[] = [
  {
    id: 1,
    name: "Vijay Kumar",
    email: "vijay.kumar@softtonia.com",
    phone: "+91 98111 22334",
    role: "owner",
    status: "active",
    availability: "online",
    is_active: true,
    last_active_at: "2026-11-02T16:20:00.000Z",
    created_at: "2026-08-15T10:00:00.000Z",
    assigned_conversations_count: 14,
  },
  {
    id: 2,
    name: "Ananya Sen",
    email: "ananya.sen@softtonia.com",
    phone: "+91 98222 33445",
    role: "admin",
    status: "active",
    availability: "online",
    is_active: true,
    last_active_at: "2026-11-02T16:15:00.000Z",
    created_at: "2026-09-01T09:30:00.000Z",
    assigned_conversations_count: 22,
  },
  {
    id: 3,
    name: "Rohan Mehta",
    email: "rohan.mehta@softtonia.com",
    phone: "+91 98333 44556",
    role: "agent",
    status: "active",
    availability: "busy",
    is_active: true,
    last_active_at: "2026-11-02T15:45:00.000Z",
    created_at: "2026-09-15T11:00:00.000Z",
    assigned_conversations_count: 18,
  },
  {
    id: 4,
    name: "Priya Sharma",
    email: "priya.sharma@softtonia.com",
    phone: "+91 98444 55667",
    role: "agent",
    status: "inactive",
    availability: "offline",
    is_active: false,
    last_active_at: "2026-10-28T14:00:00.000Z",
    created_at: "2026-10-01T12:00:00.000Z",
    assigned_conversations_count: 0,
  },
  {
    id: 5,
    name: "David Lee",
    email: "david.lee@softtonia.com",
    phone: "+1 555 234 5678",
    role: "viewer",
    status: "active",
    availability: "offline",
    is_active: true,
    last_active_at: "2026-11-01T18:00:00.000Z",
    created_at: "2026-10-10T16:00:00.000Z",
    assigned_conversations_count: 0,
  },
];

const mockTenantInvitations: TeamInvitation[] = [
  {
    id: "inv_1",
    email: "sarah.connor@example.com",
    role: "agent",
    status: "pending",
    invited_by: "Vijay Kumar",
    invited_by_name: "Vijay Kumar",
    expires_at: "2026-11-09T10:00:00.000Z",
    created_at: "2026-11-02T10:00:00.000Z",
  },
  {
    id: "inv_2",
    email: "alex.turner@example.com",
    role: "viewer",
    status: "pending",
    invited_by: "Ananya Sen",
    invited_by_name: "Ananya Sen",
    expires_at: "2026-11-08T14:30:00.000Z",
    created_at: "2026-11-01T14:30:00.000Z",
  },
];

const mockTenantRoles: TenantRole[] = [
  {
    key: "owner",
    name: "Workspace Owner",
    description: "Full control over subscription, billing, team, WhatsApp connections, and data export.",
    permissions_count: 24,
  },
  {
    key: "admin",
    name: "Administrator",
    description: "Can manage team members, message templates, campaigns, automations, and settings.",
    permissions_count: 20,
  },
  {
    key: "agent",
    name: "Support Agent",
    description: "Can send messages, handle inbox chats, manage assigned leads, and create contacts.",
    permissions_count: 12,
  },
  {
    key: "viewer",
    name: "Auditor / Read-Only",
    description: "Read-only access to analytics, audit logs, reports, and conversation transcripts.",
    permissions_count: 5,
  },
];

const mockTenantPermissions: TenantPermission[] = [
  { id: "conversations.read", name: "Read Conversations", category: "conversations", description: "View shared inbox threads" },
  { id: "conversations.write", name: "Send Messages", category: "conversations", description: "Reply and send WhatsApp messages" },
  { id: "campaigns.manage", name: "Manage Campaigns", category: "campaigns", description: "Create and dispatch broadcasts" },
  { id: "templates.manage", name: "Manage Templates", category: "templates", description: "Submit and sync Meta templates" },
  { id: "team.manage", name: "Manage Team", category: "team", description: "Invite, update roles, and deactivate users" },
  { id: "billing.manage", name: "Manage Billing", category: "billing", description: "Update plans and view invoices" },
  { id: "settings.manage", name: "Manage Settings", category: "settings", description: "Update business profile and branding" },
];

const mockWhatsAppAccounts: WhatsAppAccount[] = [
  {
    id: 1,
    tenant_id: 1,
    waba_id: "waba_789123456789",
    business_name: "Softtonia Solutions India",
    status: "connected",
    phone_number_id: "phone_100000001",
    display_phone_number: "+91 98765 43210",
    verified_name: "Softtonia Solutions",
    quality_rating: "GREEN",
    messaging_limit: "TIER_10K",
    is_default: true,
    templates_synced_at: "2026-11-02T20:30:00.000Z",
    webhook_verified: true,
    created_at: "2026-08-20T10:00:00.000Z",
  },
  {
    id: 2,
    tenant_id: 1,
    waba_id: "waba_789123456789",
    business_name: "Softtonia Support Desk",
    status: "connected",
    phone_number_id: "phone_100000002",
    display_phone_number: "+1 555-0199",
    verified_name: "Softtonia Global Support",
    quality_rating: "GREEN",
    messaging_limit: "TIER_1K",
    is_default: false,
    templates_synced_at: "2026-11-02T18:00:00.000Z",
    webhook_verified: true,
    created_at: "2026-09-10T12:00:00.000Z",
  },
];

const mockWhatsAppPhoneNumbers: WhatsAppPhoneNumber[] = [
  {
    id: 1,
    phone_number_id: "phone_100000001",
    waba_id: "waba_789123456789",
    display_phone_number: "+91 98765 43210",
    verified_name: "Softtonia Solutions",
    quality_rating: "GREEN",
    status: "CONNECTED",
    is_default: true,
  },
  {
    id: 2,
    phone_number_id: "phone_100000002",
    waba_id: "waba_789123456789",
    display_phone_number: "+1 555-0199",
    verified_name: "Softtonia Global Support",
    quality_rating: "GREEN",
    status: "CONNECTED",
    is_default: false,
  },
];

const mockEmbeddedSignupConfig: EmbeddedSignupConfig = {
  app_id: "1098765432109876",
  config_id: "cfg_softtonia_embedded_v2",
  session_info_version: "2",
  features: ["waba_creation", "phone_registration", "business_verification"],
};

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Starter",
    tier: "starter",
    price_monthly: 29,
    price_annual: 290,
    currency: "USD",
    description: "Ideal for boutique businesses starting with WhatsApp customer support.",
    features: [
      "1,000 Free Service Conversations / month",
      "Up to 2,500 Contacts",
      "1 Registered WhatsApp Number",
      "3 Agent Seats",
      "Basic Message Templates",
      "Community Support",
    ],
    limits: {
      monthly_service_conversations: 1000,
      monthly_marketing_messages: 5000,
      contacts_limit: 2500,
      team_members_limit: 3,
      whatsapp_numbers_limit: 1,
    },
  },
  {
    id: 2,
    name: "Growth",
    tier: "growth",
    price_monthly: 79,
    price_annual: 790,
    currency: "USD",
    description: "Full broadcast capabilities, AI assistant, and multi-agent shared inbox.",
    features: [
      "10,000 Free Service Conversations / month",
      "Up to 15,000 Contacts",
      "3 Registered WhatsApp Numbers",
      "10 Agent Seats",
      "AI Chatbot with Gemini 2.5",
      "Broadcast Campaigns & Analytics",
      "Workflow Automations",
      "Priority Email & Chat Support",
    ],
    limits: {
      monthly_service_conversations: 10000,
      monthly_marketing_messages: 50000,
      contacts_limit: 15000,
      team_members_limit: 10,
      whatsapp_numbers_limit: 3,
    },
    is_popular: true,
  },
  {
    id: 3,
    name: "Enterprise",
    tier: "enterprise",
    price_monthly: 199,
    price_annual: 1990,
    currency: "USD",
    description: "High-volume broadcast delivery, dedicated WABA tier, and custom webhooks.",
    features: [
      "Unlimited Service Conversations",
      "Up to 100,000 Contacts",
      "10 Registered WhatsApp Numbers",
      "Unlimited Agent Seats",
      "Custom SLA & Account Manager",
      "Audit Logs & SSO Integration",
      "Custom Webhooks & REST API Access",
    ],
    limits: {
      monthly_service_conversations: 100000,
      monthly_marketing_messages: 500000,
      contacts_limit: 100000,
      team_members_limit: 50,
      whatsapp_numbers_limit: 10,
    },
  },
];

const mockSubscriptionOverview: SubscriptionOverview = {
  id: "sub_growth_001",
  tenant_id: 1,
  plan: mockSubscriptionPlans[1],
  status: "active",
  billing_cycle: "monthly",
  current_period_start: "2026-11-01T00:00:00.000Z",
  current_period_end: "2026-11-30T23:59:59.000Z",
  cancel_at_period_end: false,
  payment_method: {
    brand: "Visa",
    last4: "4242",
    exp_month: 12,
    exp_year: 2028,
  },
};

const mockBillingInvoices: Invoice[] = [
  {
    id: "inv_101",
    invoice_number: "INV-2026-003",
    amount_due: 79,
    amount_paid: 79,
    currency: "USD",
    status: "paid",
    billing_period_start: "2026-10-01T00:00:00.000Z",
    billing_period_end: "2026-10-31T23:59:59.000Z",
    paid_at: "2026-10-01T02:14:00.000Z",
    download_url: "/api/billing/invoices/inv_101/download",
    created_at: "2026-10-01T00:00:00.000Z",
  },
  {
    id: "inv_102",
    invoice_number: "INV-2026-002",
    amount_due: 79,
    amount_paid: 79,
    currency: "USD",
    status: "paid",
    billing_period_start: "2026-09-01T00:00:00.000Z",
    billing_period_end: "2026-09-30T23:59:59.000Z",
    paid_at: "2026-09-01T04:22:00.000Z",
    download_url: "/api/billing/invoices/inv_102/download",
    created_at: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "inv_103",
    invoice_number: "INV-2026-001",
    amount_due: 79,
    amount_paid: 79,
    currency: "USD",
    status: "paid",
    billing_period_start: "2026-08-01T00:00:00.000Z",
    billing_period_end: "2026-08-31T23:59:59.000Z",
    paid_at: "2026-08-01T06:05:00.000Z",
    download_url: "/api/billing/invoices/inv_103/download",
    created_at: "2026-08-01T00:00:00.000Z",
  },
];

const mockQuotaUsageSummary: QuotaUsageSummary = {
  service_conversations: {
    used: 4820,
    limit: 10000,
    percentage: 48.2,
    reset_date: "2026-11-30T23:59:59.000Z",
  },
  marketing_broadcasts: {
    used: 18450,
    limit: 50000,
    percentage: 36.9,
    reset_date: "2026-11-30T23:59:59.000Z",
  },
  contacts: {
    used: 3820,
    limit: 15000,
    percentage: 25.4,
  },
  team_members: {
    used: 5,
    limit: 10,
    percentage: 50.0,
  },
  whatsapp_numbers: {
    used: 2,
    limit: 3,
    percentage: 66.7,
  },
  updated_at: "2026-11-02T21:00:00.000Z",
};

const mockBusinessProfile: BusinessProfile = {
  name: "Softtonia Solutions Corp",
  email: "support@softtonia.com",
  phone: "+91 98765 43210",
  address: "Tech Hub Tower 4, Suite 802, Bangalore",
  country: "India",
  currency: "USD",
};

const mockWorkspacePreferences: WorkspacePreferences = {
  timezone: "Asia/Kolkata",
  locale: "en",
  date_format: "DD/MM/YYYY",
  time_format: "12h",
  default_whatsapp_account_id: 1,
  business_hours: {
    monday: { start: "09:00", end: "18:00", open: true },
    tuesday: { start: "09:00", end: "18:00", open: true },
    wednesday: { start: "09:00", end: "18:00", open: true },
    thursday: { start: "09:00", end: "18:00", open: true },
    friday: { start: "09:00", end: "18:00", open: true },
    saturday: { start: "10:00", end: "15:00", open: true },
    sunday: { start: "10:00", end: "14:00", open: false },
  },
};

const mockWorkspaceBranding: WorkspaceBranding = {
  brand_name: "Softtonia WhatsApp CRM",
  logo_url: "/logo.png",
  logo_media_id: 101,
  primary_color: "#10b981",
  secondary_color: "#047857",
  support_email: "support@softtonia.com",
};

const mockNotificationPreferences: NotificationPreferences = {
  inbound_message_alerts: true,
  campaign_delivery_reports: true,
  quota_warning_alerts: true,
  email_daily_digest: false,
  sound_notifications: true,
  security_alerts: true,
};

const mockUserSessions: UserSession[] = [
  {
    id: "sess_curr",
    ip_address: "103.21.124.50",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/130.0",
    device_name: "MacBook Pro 16\"",
    browser: "Google Chrome",
    location: "Bangalore, India",
    is_current: true,
    last_activity_at: "2026-11-02T21:30:00.000Z",
  },
  {
    id: "sess_mobile",
    ip_address: "103.21.124.52",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15",
    device_name: "iPhone 15 Pro",
    browser: "Mobile Safari",
    location: "Bangalore, India",
    is_current: false,
    last_activity_at: "2026-11-02T18:15:00.000Z",
  },
];

export function getMockResponse<T>(path: string, method = "GET"): ApiResponse<T> | null {
  const normalized = path.split("?")[0];

  if (normalized === "/api/auth/me" && method === "GET") {
    return {
      success: true,
      message: "Current user retrieved successfully",
      data: {
        ...mockUser,
        workspaces: mockTenants,
      } as unknown as T,
    };
  }

  if (normalized === "/api/auth/login" && method === "POST") {
    return {
      success: true,
      message: "Login successful",
      data: {
        token: "mock-jwt-token-for-development-mode",
        user: mockUser,
        workspaces: mockTenants,
      } as unknown as T,
    };
  }

  if (normalized === "/api/auth/forgot-password" && method === "POST") {
    return {
      success: true,
      message: "If your email is registered, you will receive a password reset link shortly.",
      data: { status: "sent" } as unknown as T,
    };
  }

  if (normalized === "/api/auth/reset-password" && method === "POST") {
    return {
      success: true,
      message: "Password has been successfully updated. Please sign in with your new password.",
      data: { status: "reset_complete" } as unknown as T,
    };
  }

  if (normalized === "/api/auth/mfa/verify" && method === "POST") {
    return {
      success: true,
      message: "MFA challenge verified successfully",
      data: {
        token: "mock-jwt-token-verified-via-mfa",
        user: mockUser,
      } as unknown as T,
    };
  }

  if (normalized === "/api/auth/switch-workspace" && method === "POST") {
    return {
      success: true,
      message: "Switched workspace successfully",
      data: {
        active_tenant_id: 1,
        tenant: mockTenants[0],
      } as unknown as T,
    };
  }

  if (normalized === "/api/workspaces" && method === "GET") {
    return {
      success: true,
      message: "Workspaces retrieved",
      data: mockTenants as unknown as T,
    };
  }

  if (normalized === "/api/onboarding/status" && (method === "GET" || method === "POST" || method === "PATCH")) {
    return {
      success: true,
      message: "Onboarding step updated",
      data: {
        current_step: "business_profile",
        is_completed: false,
        business_profile: {
          company_name: "Softtonia Solutions",
          timezone: "Asia/Kolkata",
          currency: "INR",
        },
      } as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/health" && method === "GET") {
    return {
      success: true,
      message: "WhatsApp health status retrieved",
      data: mockWhatsAppHealth as unknown as T,
    };
  }

  if (normalized === "/api/conversations" && method === "GET") {
    return {
      success: true,
      message: "Conversations list retrieved",
      data: mockConversations as unknown as T,
      meta: {
        current_page: 1,
        per_page: 25,
        total: mockConversations.length,
        last_page: 1,
      },
    };
  }

  if (normalized === "/api/reports/overview" && method === "GET") {
    return {
      success: true,
      message: "Reports overview retrieved",
      data: mockDashboardOverview as unknown as T,
    };
  }

  if (normalized === "/api/reports/conversations" && method === "GET") {
    return {
      success: true,
      message: "Conversation activity metrics retrieved",
      data: mockConversationActivity as unknown as T,
    };
  }

  if (normalized === "/api/campaigns" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const search = urlParams.get("search")?.toLowerCase().trim();
    const status = urlParams.get("status");

    let filtered = [...mockTenantCampaigns];
    if (status && status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          (c.template_name && c.template_name.toLowerCase().includes(search))
      );
    }

    return {
      success: true,
      message: "Campaigns list retrieved",
      data: filtered as unknown as T,
      meta: {
        current_page: 1,
        per_page: 20,
        total: filtered.length,
        last_page: 1,
      },
    };
  }

  if (normalized === "/api/billing/usage" && method === "GET") {
    return {
      success: true,
      message: "Quota usage summary retrieved",
      data: mockUsageSummary as unknown as T,
    };
  }

  // Conversation Detail: GET /api/conversations/:id
  const convDetailMatch = normalized.match(/^\/api\/conversations\/(\d+)$/);
  if (convDetailMatch && method === "GET") {
    const id = Number(convDetailMatch[1]);
    const found = mockConversations.find((c) => c.id === id) || mockConversations[0];
    return {
      success: true,
      message: "Conversation details retrieved",
      data: found as unknown as T,
    };
  }

  // Conversation Messages: GET /api/conversations/:id/messages
  const convMessagesMatch = normalized.match(/^\/api\/conversations\/(\d+)\/messages$/);
  if (convMessagesMatch && method === "GET") {
    const id = Number(convMessagesMatch[1]);
    const messages = mockMessages[id] || [];
    return {
      success: true,
      message: "Messages retrieved",
      data: messages as unknown as T,
    };
  }

  // Send Message: POST /api/conversations/:id/messages
  if (convMessagesMatch && method === "POST") {
    const id = Number(convMessagesMatch[1]);
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: id,
      direction: "outbound",
      type: "text",
      content: "Message sent",
      status: "delivered",
      sender_name: "Vijay Kumar",
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Message dispatched via WhatsApp Cloud API",
      data: newMsg as unknown as T,
    };
  }

  // Internal Notes: POST /api/conversations/:id/notes
  const convNotesMatch = normalized.match(/^\/api\/conversations\/(\d+)\/notes$/);
  if (convNotesMatch && method === "POST") {
    const id = Number(convNotesMatch[1]);
    const newNote: InternalNote = {
      id: `note_${Date.now()}`,
      conversation_id: id,
      author_name: "Vijay Kumar",
      note: "Internal note added",
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Internal note recorded",
      data: newNote as unknown as T,
    };
  }

  if (convNotesMatch && method === "GET") {
    const id = Number(convNotesMatch[1]);
    return {
      success: true,
      message: "Notes retrieved",
      data: (mockNotes[id] || []) as unknown as T,
    };
  }

  // Status transitions
  const assignMatch = normalized.match(/^\/api\/conversations\/(\d+)\/assign$/);
  if (assignMatch && method === "POST") {
    return {
      success: true,
      message: "Conversation assigned",
      data: { conversation_id: Number(assignMatch[1]), assigned_to: 1 } as unknown as T,
    };
  }

  const resolveMatch = normalized.match(/^\/api\/conversations\/(\d+)\/resolve$/);
  if (resolveMatch && method === "POST") {
    return {
      success: true,
      message: "Conversation resolved",
      data: { conversation_id: Number(resolveMatch[1]), status: "resolved" } as unknown as T,
    };
  }

  const reopenMatch = normalized.match(/^\/api\/conversations\/(\d+)\/reopen$/);
  if (reopenMatch && method === "POST") {
    return {
      success: true,
      message: "Conversation reopened",
      data: { conversation_id: Number(reopenMatch[1]), status: "open" } as unknown as T,
    };
  }

  const snoozeMatch = normalized.match(/^\/api\/conversations\/(\d+)\/snooze$/);
  if (snoozeMatch && method === "POST") {
    return {
      success: true,
      message: "Conversation snoozed",
      data: { conversation_id: Number(snoozeMatch[1]), status: "snoozed" } as unknown as T,
    };
  }

  // Templates
  if (normalized === "/api/whatsapp/templates" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const search = urlParams.get("search")?.toLowerCase().trim();
    const category = urlParams.get("category");
    const status = urlParams.get("status");
    const language = urlParams.get("language");

    let filtered = [...mockMetaTemplates];
    if (category && category !== "all") {
      filtered = filtered.filter((t) => t.category === category);
    }
    if (status && status !== "all") {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (language && language !== "all") {
      filtered = filtered.filter((t) => t.language === language);
    }
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.components.some((c) => c.text && c.text.toLowerCase().includes(search))
      );
    }

    return {
      success: true,
      message: "WhatsApp message templates retrieved",
      data: filtered as unknown as T,
      meta: {
        current_page: 1,
        per_page: 20,
        total: filtered.length,
        last_page: 1,
      },
    };
  }

  // Team Members
  if (normalized === "/api/team/members" && method === "GET") {
    return {
      success: true,
      message: "Team members retrieved",
      data: mockTeamMembers as unknown as T,
    };
  }

  // --- CONTACTS API ---
  if (normalized === "/api/contacts" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const search = urlParams.get("search")?.toLowerCase().trim() || "";
    const status = urlParams.get("status") || "";
    const tag = urlParams.get("tag") || "";

    let filtered = [...mockContacts];
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (tag) {
      filtered = filtered.filter((c) => c.tags.includes(tag));
    }
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.toLowerCase().includes(search) ||
          (c.email && c.email.toLowerCase().includes(search)) ||
          (c.company && c.company.toLowerCase().includes(search))
      );
    }

    return {
      success: true,
      message: "Contacts retrieved",
      data: filtered as unknown as T,
      meta: {
        current_page: 1,
        per_page: 25,
        total: filtered.length,
        last_page: 1,
      },
    };
  }

  if (normalized === "/api/contacts" && method === "POST") {
    const newContact: Contact = {
      id: Date.now(),
      tenant_id: 1,
      name: "New Contact",
      phone: "+91 99999 88888",
      status: "active",
      tags: ["New Lead"],
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Contact created successfully",
      data: newContact as unknown as T,
    };
  }

  const contactDetailMatch = normalized.match(/^\/api\/contacts\/(\d+)$/);
  if (contactDetailMatch && method === "GET") {
    const id = Number(contactDetailMatch[1]);
    const found = mockContacts.find((c) => c.id === id) || mockContacts[0];
    return {
      success: true,
      message: "Contact details retrieved",
      data: found as unknown as T,
    };
  }

  if (contactDetailMatch && method === "PATCH") {
    const id = Number(contactDetailMatch[1]);
    const found = mockContacts.find((c) => c.id === id) || mockContacts[0];
    return {
      success: true,
      message: "Contact updated successfully",
      data: { ...found } as unknown as T,
    };
  }

  const contactArchiveMatch = normalized.match(/^\/api\/contacts\/(\d+)\/archive$/);
  if (contactArchiveMatch && method === "POST") {
    const id = Number(contactArchiveMatch[1]);
    return {
      success: true,
      message: "Contact archived",
      data: { id, status: "archived" } as unknown as T,
    };
  }

  const contactRestoreMatch = normalized.match(/^\/api\/contacts\/(\d+)\/restore$/);
  if (contactRestoreMatch && method === "POST") {
    const id = Number(contactRestoreMatch[1]);
    return {
      success: true,
      message: "Contact restored",
      data: { id, status: "active" } as unknown as T,
    };
  }

  const contactActivitiesMatch = normalized.match(/^\/api\/contacts\/(\d+)\/activities$/);
  if (contactActivitiesMatch && method === "GET") {
    const id = Number(contactActivitiesMatch[1]);
    return {
      success: true,
      message: "Contact activities retrieved",
      data: (mockContactActivities[id] || []) as unknown as T,
    };
  }

  const contactNotesMatch = normalized.match(/^\/api\/contacts\/(\d+)\/notes$/);
  if (contactNotesMatch && method === "GET") {
    const id = Number(contactNotesMatch[1]);
    return {
      success: true,
      message: "Contact notes retrieved",
      data: (mockContactNotes[id] || []) as unknown as T,
    };
  }

  if (contactNotesMatch && method === "POST") {
    const id = Number(contactNotesMatch[1]);
    const newNote: ContactNote = {
      id: `cn_${Date.now()}`,
      contact_id: id,
      author_name: "Vijay Kumar",
      note: "Follow-up note recorded",
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Note added to contact",
      data: newNote as unknown as T,
    };
  }

  if (normalized === "/api/contact-tags" && method === "GET") {
    return {
      success: true,
      message: "Contact tags retrieved",
      data: mockContactTags as unknown as T,
    };
  }

  if (normalized === "/api/contact-tags" && method === "POST") {
    const newTag: ContactTag = {
      id: Date.now(),
      name: "New Tag",
      color: "#3b82f6",
      contacts_count: 0,
    };
    return {
      success: true,
      message: "Tag created",
      data: newTag as unknown as T,
    };
  }

  const contactTagsMatch = normalized.match(/^\/api\/contacts\/(\d+)\/tags$/);
  if (contactTagsMatch && method === "POST") {
    return {
      success: true,
      message: "Tag assigned to contact",
      data: { contact_id: Number(contactTagsMatch[1]) } as unknown as T,
    };
  }

  const contactTagDeleteMatch = normalized.match(/^\/api\/contacts\/(\d+)\/tags\/([^/]+)$/);
  if (contactTagDeleteMatch && method === "DELETE") {
    return {
      success: true,
      message: "Tag removed from contact",
      data: { contact_id: Number(contactTagDeleteMatch[1]), tag: contactTagDeleteMatch[2] } as unknown as T,
    };
  }

  if (normalized === "/api/contacts/bulk" && method === "POST") {
    return {
      success: true,
      message: "Bulk action applied successfully",
      data: { affected_count: 2 } as unknown as T,
    };
  }

  if (normalized === "/api/contacts/import/template" && method === "GET") {
    return {
      success: true,
      message: "Template headers retrieved",
      data: {
        fields: ["name", "phone", "email", "company", "tags", "source"],
        example: "Aarav Sharma,+919811122233,aarav@example.com,Acme,Enterprise;High Value,Website",
      } as unknown as T,
    };
  }

  if (normalized === "/api/contacts/imports" && method === "POST") {
    return {
      success: true,
      message: "Contacts imported successfully",
      data: { imported: 45, failed: 0, skipped: 2 } as unknown as T,
    };
  }

  if (normalized === "/api/contacts/exports" && method === "POST") {
    return {
      success: true,
      message: "Export generated",
      data: {
        download_url: "https://api.softtonia.com/exports/contacts-export-20261102.csv",
        expires_in_seconds: 3600,
      } as unknown as T,
    };
  }

  // --- LEADS & PIPELINE API ---
  if (normalized === "/api/lead-pipeline/stages" && method === "GET") {
    return {
      success: true,
      message: "Pipeline stages retrieved",
      data: mockPipelineStages as unknown as T,
    };
  }

  if (normalized === "/api/leads" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const stageId = urlParams.get("pipeline_stage_id");
    const priority = urlParams.get("priority");
    const search = urlParams.get("search")?.toLowerCase().trim();

    let filtered = [...mockLeads];
    if (stageId) {
      filtered = filtered.filter((l) => String(l.pipeline_stage_id) === String(stageId));
    }
    if (priority) {
      filtered = filtered.filter((l) => l.priority === priority);
    }
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.contact_name.toLowerCase().includes(search) ||
          l.contact_phone.includes(search)
      );
    }

    return {
      success: true,
      message: "Leads retrieved",
      data: filtered as unknown as T,
    };
  }

  if (normalized === "/api/leads" && method === "POST") {
    const newLead: Lead = {
      id: Date.now(),
      tenant_id: 1,
      contact_id: 101,
      contact_name: "Aarav Sharma",
      contact_phone: "+91 98111 22233",
      pipeline_stage_id: 1,
      stage_name: "New Lead",
      title: "New Inbound Opportunity",
      status: "open",
      priority: "medium",
      value: 50000,
      currency: "INR",
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Lead created successfully",
      data: newLead as unknown as T,
    };
  }

  const leadDetailMatch = normalized.match(/^\/api\/leads\/(\d+)$/);
  if (leadDetailMatch && method === "GET") {
    const id = Number(leadDetailMatch[1]);
    const found = mockLeads.find((l) => l.id === id) || mockLeads[0];
    return {
      success: true,
      message: "Lead details retrieved",
      data: found as unknown as T,
    };
  }

  if (leadDetailMatch && method === "PATCH") {
    const id = Number(leadDetailMatch[1]);
    const found = mockLeads.find((l) => l.id === id) || mockLeads[0];
    return {
      success: true,
      message: "Lead updated successfully",
      data: { ...found } as unknown as T,
    };
  }

  // --- PRODUCTS API ---
  if (normalized === "/api/products" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const search = urlParams.get("search")?.toLowerCase().trim();
    const isActive = urlParams.get("is_active");
    const category = urlParams.get("category");

    let filtered = [...mockProducts];
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      const activeBool = isActive === "true";
      filtered = filtered.filter((p) => p.is_active === activeBool);
    }
    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    return {
      success: true,
      message: "Products retrieved",
      data: filtered as unknown as T,
      meta: {
        current_page: 1,
        per_page: 25,
        total: filtered.length,
        last_page: 1,
      },
    };
  }

  if (normalized === "/api/products" && method === "POST") {
    const newProduct: Product = {
      id: Date.now(),
      tenant_id: 1,
      name: "New Catalog Product",
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      price: 999,
      currency: "INR",
      description: "Product description",
      is_active: true,
      stock_quantity: 10,
      catalog_status: "synced",
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Product created successfully",
      data: newProduct as unknown as T,
    };
  }

  const productDetailMatch = normalized.match(/^\/api\/products\/(\d+)$/);
  if (productDetailMatch && method === "GET") {
    const id = Number(productDetailMatch[1]);
    const found = mockProducts.find((p) => p.id === id) || mockProducts[0];
    return {
      success: true,
      message: "Product details retrieved",
      data: found as unknown as T,
    };
  }

  if (productDetailMatch && method === "PATCH") {
    const id = Number(productDetailMatch[1]);
    const found = mockProducts.find((p) => p.id === id) || mockProducts[0];
    return {
      success: true,
      message: "Product updated successfully",
      data: { ...found } as unknown as T,
    };
  }

  if (productDetailMatch && method === "DELETE") {
    const id = Number(productDetailMatch[1]);
    return {
      success: true,
      message: "Product deleted",
      data: { id } as unknown as T,
    };
  }

  if (normalized === "/api/products/sync-catalog" && method === "POST") {
    return {
      success: true,
      message: "WhatsApp Meta Commerce Catalog synchronization initiated",
      data: {
        status: "synced",
        synced_count: mockProducts.filter((p) => p.is_active).length,
        last_synced_at: "2026-11-02T19:00:00.000Z",
      } as unknown as T,
    };
  }

  // --- CAMPAIGN MANAGEMENT API ---
  if (normalized === "/api/campaigns" && method === "POST") {
    const newCamp: Campaign = {
      id: Date.now(),
      tenant_id: 1,
      name: "New Broadcast Campaign",
      template_id: 1,
      template_name: "order_confirmation_v1",
      phone_number_id: 1,
      sender_number: "+91 98765 43210",
      status: "scheduled",
      audience_config: { tags: ["VIP"] },
      total_recipients: 450,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      failed_count: 0,
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Campaign created successfully",
      data: newCamp as unknown as T,
    };
  }

  const campaignDetailMatch = normalized.match(/^\/api\/campaigns\/(\d+)$/);
  if (campaignDetailMatch && method === "GET") {
    const id = Number(campaignDetailMatch[1]);
    const found = mockTenantCampaigns.find((c) => c.id === id) || mockTenantCampaigns[0];
    return {
      success: true,
      message: "Campaign details retrieved",
      data: found as unknown as T,
    };
  }

  if (campaignDetailMatch && method === "PATCH") {
    const id = Number(campaignDetailMatch[1]);
    const found = mockTenantCampaigns.find((c) => c.id === id) || mockTenantCampaigns[0];
    return {
      success: true,
      message: "Campaign updated successfully",
      data: { ...found } as unknown as T,
    };
  }

  const campaignValidateMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/validate$/);
  if (campaignValidateMatch && method === "POST") {
    return {
      success: true,
      message: "Campaign validation passed",
      data: {
        valid: true,
        eligible_recipients: 840,
        unsubscribed_count: 12,
        estimated_cost_inr: 280,
      } as unknown as T,
    };
  }

  const campaignTestMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/test$/);
  if (campaignTestMatch && method === "POST") {
    return {
      success: true,
      message: "Test message sent to test phone recipient successfully",
      data: { test_sent: true } as unknown as T,
    };
  }

  const campaignSendMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/send$/);
  if (campaignSendMatch && method === "POST") {
    const id = Number(campaignSendMatch[1]);
    return {
      success: true,
      message: "Campaign dispatch triggered via Meta Cloud API",
      data: { id, status: "running" } as unknown as T,
    };
  }

  const campaignPauseMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/pause$/);
  if (campaignPauseMatch && method === "POST") {
    const id = Number(campaignPauseMatch[1]);
    return {
      success: true,
      message: "Campaign execution paused",
      data: { id, status: "paused" } as unknown as T,
    };
  }

  const campaignResumeMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/resume$/);
  if (campaignResumeMatch && method === "POST") {
    const id = Number(campaignResumeMatch[1]);
    return {
      success: true,
      message: "Campaign execution resumed",
      data: { id, status: "running" } as unknown as T,
    };
  }

  const campaignCancelMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/cancel$/);
  if (campaignCancelMatch && method === "POST") {
    const id = Number(campaignCancelMatch[1]);
    return {
      success: true,
      message: "Campaign cancelled",
      data: { id, status: "cancelled" } as unknown as T,
    };
  }

  const campaignAnalyticsMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/analytics$/);
  if (campaignAnalyticsMatch && method === "GET") {
    const id = Number(campaignAnalyticsMatch[1]);
    const found = mockCampaignAnalytics[id] || mockCampaignAnalytics[1];
    return {
      success: true,
      message: "Campaign analytics retrieved",
      data: found as unknown as T,
    };
  }

  const campaignRecipientsMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/recipients$/);
  if (campaignRecipientsMatch && method === "GET") {
    const id = Number(campaignRecipientsMatch[1]);
    const recs = mockCampaignRecipients[id] || mockCampaignRecipients[1];
    return {
      success: true,
      message: "Campaign recipients retrieved",
      data: recs as unknown as T,
      meta: { current_page: 1, per_page: 20, total: recs.length, last_page: 1 },
    };
  }

  const campaignExportMatch = normalized.match(/^\/api\/campaigns\/(\d+)\/export$/);
  if (campaignExportMatch && method === "GET") {
    return {
      success: true,
      message: "Campaign report generated",
      data: {
        download_url: "https://api.softtonia.com/exports/campaign-report-20261102.csv",
        expires_in_seconds: 3600,
      } as unknown as T,
    };
  }

  // --- WHATSAPP TEMPLATES API ---
  if (normalized === "/api/whatsapp/templates" && method === "POST") {
    const newTemplate: MetaTemplate = {
      id: Date.now(),
      tenant_id: 1,
      name: "custom_template_v1",
      category: "MARKETING",
      language: "en_US",
      status: "PENDING",
      components: [
        { type: "BODY", text: "Hello {{1}}, thank you for choosing our service!" },
      ],
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Template submitted to Meta for approval",
      data: newTemplate as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/templates/sync" && method === "POST") {
    return {
      success: true,
      message: "WhatsApp templates successfully synced with Meta Cloud",
      data: {
        synced_count: mockMetaTemplates.length,
        last_synced_at: "2026-11-02T19:00:00.000Z",
      } as unknown as T,
    };
  }

  const templateDetailMatch = normalized.match(/^\/api\/whatsapp\/templates\/(\d+)$/);
  if (templateDetailMatch && method === "GET") {
    const id = Number(templateDetailMatch[1]);
    const found = mockMetaTemplates.find((t) => t.id === id) || mockMetaTemplates[0];
    return {
      success: true,
      message: "Template details retrieved",
      data: found as unknown as T,
    };
  }

  // --- AI CHATBOT API ---
  if (normalized === "/api/ai/config" && method === "GET") {
    return {
      success: true,
      message: "AI Chatbot configuration retrieved",
      data: mockAiConfig as unknown as T,
    };
  }

  if (normalized === "/api/ai/config" && method === "PATCH") {
    return {
      success: true,
      message: "AI Chatbot configuration saved",
      data: mockAiConfig as unknown as T,
    };
  }

  if (normalized === "/api/ai/knowledge" && method === "GET") {
    return {
      success: true,
      message: "AI knowledge items retrieved",
      data: mockAiKnowledge as unknown as T,
    };
  }

  if (normalized === "/api/ai/knowledge" && method === "POST") {
    const newItem: AiKnowledgeItem = {
      id: Date.now(),
      tenant_id: 1,
      question: "Sample FAQ Question",
      answer: "Sample FAQ Answer",
      keywords: ["sample", "faq"],
      is_active: true,
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Knowledge base item added",
      data: newItem as unknown as T,
    };
  }

  const aiKnowledgeDetailMatch = normalized.match(/^\/api\/ai\/knowledge\/(\d+)$/);
  if (aiKnowledgeDetailMatch && method === "PATCH") {
    const id = Number(aiKnowledgeDetailMatch[1]);
    const found = mockAiKnowledge.find((k) => k.id === id) || mockAiKnowledge[0];
    return {
      success: true,
      message: "Knowledge item updated",
      data: { ...found } as unknown as T,
    };
  }

  if (aiKnowledgeDetailMatch && method === "DELETE") {
    const id = Number(aiKnowledgeDetailMatch[1]);
    return {
      success: true,
      message: "Knowledge item deleted",
      data: { id } as unknown as T,
    };
  }

  if (normalized === "/api/ai/test-chat" && method === "POST") {
    const simulatedResponse: AiTestChatMessage = {
      id: `sim_${Date.now()}`,
      sender: "bot",
      text: "Our team is available Monday to Saturday, 9:00 AM to 6:00 PM IST. How else may I assist you today?",
      timestamp: "2026-11-02T19:00:00.000Z",
      matched_knowledge_id: 1,
      confidence_score: 0.94,
    };
    return {
      success: true,
      message: "Simulated response generated",
      data: simulatedResponse as unknown as T,
    };
  }

  // --- AUTOMATION API ---
  if (normalized === "/api/automation/rules" && method === "GET") {
    return {
      success: true,
      message: "Automation rules retrieved",
      data: mockAutomationRules as unknown as T,
    };
  }

  if (normalized === "/api/automation/rules" && method === "POST") {
    const newRule: AutomationRule = {
      id: Date.now(),
      tenant_id: 1,
      name: "New Automation Workflow",
      description: "Automated trigger action",
      is_active: true,
      trigger_type: "incoming_message",
      conditions: [],
      actions: [{ type: "send_message", payload: { text: "Hello!" } }],
      executions_count: 0,
      created_at: "2026-11-02T19:00:00.000Z",
    };
    return {
      success: true,
      message: "Automation rule created",
      data: newRule as unknown as T,
    };
  }

  const automationDetailMatch = normalized.match(/^\/api\/automation\/rules\/(\d+)$/);
  if (automationDetailMatch && method === "PATCH") {
    const id = Number(automationDetailMatch[1]);
    const found = mockAutomationRules.find((r) => r.id === id) || mockAutomationRules[0];
    return {
      success: true,
      message: "Automation rule updated",
      data: { ...found } as unknown as T,
    };
  }

  if (automationDetailMatch && method === "DELETE") {
    const id = Number(automationDetailMatch[1]);
    return {
      success: true,
      message: "Automation rule deleted",
      data: { id } as unknown as T,
    };
  }

  const automationToggleMatch = normalized.match(/^\/api\/automation\/rules\/(\d+)\/toggle$/);
  if (automationToggleMatch && method === "POST") {
    const id = Number(automationToggleMatch[1]);
    return {
      success: true,
      message: "Rule activation toggled",
      data: { id, is_active: true } as unknown as T,
    };
  }

  if (normalized === "/api/automation/logs" && method === "GET") {
    return {
      success: true,
      message: "Automation execution logs retrieved",
      data: mockAutomationLogs as unknown as T,
    };
  }

  // ==========================================
  // --- TEAM & RBAC MANAGEMENT ---
  // ==========================================
  if (normalized === "/api/team/members" && method === "GET") {
    const urlParams = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
    const search = urlParams.get("search")?.toLowerCase().trim() || "";
    const role = urlParams.get("role") || "";
    const status = urlParams.get("status") || "";

    let filtered = [...mockTenantTeam];
    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search)
      );
    }
    if (role && role !== "all") {
      filtered = filtered.filter((m) => m.role === role);
    }
    if (status && status !== "all") {
      filtered = filtered.filter((m) => m.status === status);
    }

    return {
      success: true,
      message: "Team members retrieved",
      data: filtered as unknown as T,
      meta: {
        current_page: 1,
        per_page: 20,
        total: filtered.length,
        last_page: 1,
      },
    };
  }

  const teamMemberDetailMatch = normalized.match(/^\/api\/team\/members\/(\d+)$/);
  if (teamMemberDetailMatch && method === "GET") {
    const id = Number(teamMemberDetailMatch[1]);
    const found = mockTenantTeam.find((m) => m.id === id) || mockTenantTeam[0];
    return {
      success: true,
      message: "Team member details retrieved",
      data: found as unknown as T,
    };
  }

  if (teamMemberDetailMatch && (method === "PATCH" || method === "PUT")) {
    const id = Number(teamMemberDetailMatch[1]);
    const found = mockTenantTeam.find((m) => m.id === id) || mockTenantTeam[0];
    return {
      success: true,
      message: "Team member updated successfully",
      data: { ...found } as unknown as T,
    };
  }

  const teamDeactivateMatch = normalized.match(/^\/api\/team\/members\/(\d+)\/deactivate$/);
  if (teamDeactivateMatch && method === "POST") {
    const id = Number(teamDeactivateMatch[1]);
    return {
      success: true,
      message: "Team member deactivated",
      data: { id, status: "inactive", is_active: false } as unknown as T,
    };
  }

  const teamReactivateMatch = normalized.match(/^\/api\/team\/members\/(\d+)\/reactivate$/);
  if (teamReactivateMatch && method === "POST") {
    const id = Number(teamReactivateMatch[1]);
    return {
      success: true,
      message: "Team member reactivated",
      data: { id, status: "active", is_active: true } as unknown as T,
    };
  }

  const teamAvailabilityMatch = normalized.match(/^\/api\/team\/members\/(\d+)\/availability$/);
  if (teamAvailabilityMatch && method === "POST") {
    const id = Number(teamAvailabilityMatch[1]);
    return {
      success: true,
      message: "Availability status updated",
      data: { id, availability: "online" } as unknown as T,
    };
  }

  if (normalized === "/api/team/invitations" && method === "GET") {
    return {
      success: true,
      message: "Pending team invitations retrieved",
      data: mockTenantInvitations as unknown as T,
    };
  }

  if (normalized === "/api/team/invitations" && method === "POST") {
    const newInv: TeamInvitation = {
      id: `inv_${Date.now()}`,
      email: "newinvitee@example.com",
      role: "agent",
      status: "pending",
      invited_by: "Vijay Kumar",
      invited_by_name: "Vijay Kumar",
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };
    return {
      success: true,
      message: "Invitation sent successfully via email",
      data: newInv as unknown as T,
    };
  }

  const teamInvResendMatch = normalized.match(/^\/api\/team\/invitations\/([a-zA-Z0-9_-]+)\/resend$/);
  if (teamInvResendMatch && method === "POST") {
    return {
      success: true,
      message: "Invitation email re-dispatched to candidate",
      data: { success: true } as unknown as T,
    };
  }

  const teamInvRevokeMatch = normalized.match(/^\/api\/team\/invitations\/([a-zA-Z0-9_-]+)\/revoke$/);
  if (teamInvRevokeMatch && method === "POST") {
    const id = teamInvRevokeMatch[1];
    return {
      success: true,
      message: "Invitation revoked",
      data: { id, status: "revoked" } as unknown as T,
    };
  }

  const teamInvDeleteMatch = normalized.match(/^\/api\/team\/invitations\/([a-zA-Z0-9_-]+)$/);
  if (teamInvDeleteMatch && method === "DELETE") {
    const id = teamInvDeleteMatch[1];
    return {
      success: true,
      message: "Invitation removed",
      data: { id } as unknown as T,
    };
  }

  if (normalized === "/api/team/roles" && method === "GET") {
    return {
      success: true,
      message: "Tenant roles retrieved",
      data: mockTenantRoles as unknown as T,
    };
  }

  if (normalized === "/api/team/permissions" && method === "GET") {
    return {
      success: true,
      message: "Tenant permissions retrieved",
      data: mockTenantPermissions as unknown as T,
    };
  }

  // ==========================================
  // --- WHATSAPP CONNECTION MANAGEMENT ---
  // ==========================================
  if (normalized === "/api/whatsapp/accounts" && method === "GET") {
    return {
      success: true,
      message: "Connected WhatsApp accounts retrieved",
      data: mockWhatsAppAccounts as unknown as T,
    };
  }

  const waAccountDetailMatch = normalized.match(/^\/api\/whatsapp\/accounts\/(\d+)$/);
  if (waAccountDetailMatch && method === "GET") {
    const id = Number(waAccountDetailMatch[1]);
    const found = mockWhatsAppAccounts.find((a) => a.id === id) || mockWhatsAppAccounts[0];
    return {
      success: true,
      message: "WhatsApp account details retrieved",
      data: found as unknown as T,
    };
  }

  const waAccountSyncMatch = normalized.match(/^\/api\/whatsapp\/accounts\/(\d+)\/sync$/);
  if (waAccountSyncMatch && method === "POST") {
    return {
      success: true,
      message: "WhatsApp account metadata and templates successfully synchronized from Meta",
      data: { synced_at: new Date().toISOString() } as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/numbers" && method === "GET") {
    return {
      success: true,
      message: "WhatsApp phone numbers retrieved",
      data: mockWhatsAppPhoneNumbers as unknown as T,
    };
  }

  const waNumberDefaultMatch = normalized.match(/^\/api\/whatsapp\/numbers\/(\d+)\/default$/);
  if (waNumberDefaultMatch && (method === "PATCH" || method === "POST")) {
    const id = Number(waNumberDefaultMatch[1]);
    return {
      success: true,
      message: "Default WhatsApp sending number updated",
      data: { id, is_default: true } as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/connect" && method === "POST") {
    const newAccount: WhatsAppAccount = {
      id: Date.now(),
      waba_id: "waba_new_connected",
      business_name: "Connected Business",
      status: "connected",
      phone_number_id: "phone_new_connected",
      display_phone_number: "+1 555-0123",
      verified_name: "Verified Brand",
      quality_rating: "GREEN",
      messaging_limit: "TIER_1K",
      is_default: false,
      templates_synced_at: new Date().toISOString(),
      webhook_verified: true,
      created_at: new Date().toISOString(),
    };
    return {
      success: true,
      message: "WhatsApp business account verified and connected successfully",
      data: newAccount as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/embedded-signup/config" && method === "GET") {
    return {
      success: true,
      message: "Embedded signup configuration retrieved",
      data: mockEmbeddedSignupConfig as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/embedded-signup/initiate" && method === "POST") {
    return {
      success: true,
      message: "Embedded signup session initiated",
      data: { session_id: "sess_meta_12345", state: "state_crypt_98765" } as unknown as T,
    };
  }

  if (normalized === "/api/whatsapp/embedded-signup/callback" && method === "POST") {
    return {
      success: true,
      message: "Meta OAuth embedded signup completed and WABA linked",
      data: mockWhatsAppAccounts[0] as unknown as T,
    };
  }

  // ==========================================
  // --- BILLING & SUBSCRIPTIONS ---
  // ==========================================
  if (normalized === "/api/billing/subscription" && method === "GET") {
    return {
      success: true,
      message: "Subscription overview retrieved",
      data: mockSubscriptionOverview as unknown as T,
    };
  }

  if (normalized === "/api/billing/usage" && method === "GET") {
    return {
      success: true,
      message: "Quota usage summary retrieved",
      data: mockQuotaUsageSummary as unknown as T,
    };
  }

  if (normalized === "/api/billing/invoices" && method === "GET") {
    return {
      success: true,
      message: "Invoices retrieved",
      data: mockBillingInvoices as unknown as T,
    };
  }

  const invoiceDetailMatch = normalized.match(/^\/api\/billing\/invoices\/([a-zA-Z0-9_-]+)$/);
  if (invoiceDetailMatch && method === "GET") {
    const id = invoiceDetailMatch[1];
    const found = mockBillingInvoices.find((inv) => inv.id === id) || mockBillingInvoices[0];
    return {
      success: true,
      message: "Invoice details retrieved",
      data: found as unknown as T,
    };
  }

  if (normalized === "/api/billing/change-plan" && method === "POST") {
    return {
      success: true,
      message: "Subscription plan updated successfully",
      data: {
        ...mockSubscriptionOverview,
        plan: mockSubscriptionPlans[2], // upgraded to enterprise
        updated_at: new Date().toISOString(),
      } as unknown as T,
    };
  }

  if (normalized === "/api/billing/cancel" && method === "POST") {
    return {
      success: true,
      message: "Subscription scheduled for cancellation at end of current billing period",
      data: {
        ...mockSubscriptionOverview,
        cancel_at_period_end: true,
      } as unknown as T,
    };
  }

  const checkoutStatusMatch = normalized.match(/^\/api\/billing\/checkout-status\/([a-zA-Z0-9_-]+)$/);
  if (checkoutStatusMatch && method === "GET") {
    return {
      success: true,
      message: "Payment verified successfully",
      data: { status: "completed", paid: true } as unknown as T,
    };
  }

  // ==========================================
  // --- WORKSPACE SETTINGS & BRANDING ---
  // ==========================================
  if (normalized === "/api/settings" && method === "GET") {
    return {
      success: true,
      message: "Workspace settings overview retrieved",
      data: {
        profile: mockBusinessProfile,
        preferences: mockWorkspacePreferences,
        branding: mockWorkspaceBranding,
        notification_preferences: mockNotificationPreferences,
      } as unknown as T,
    };
  }

  if (normalized === "/api/settings/profile" && (method === "GET" || method === "PATCH" || method === "PUT")) {
    return {
      success: true,
      message: method === "GET" ? "Business profile retrieved successfully" : "Business profile updated successfully",
      data: mockBusinessProfile as unknown as T,
    };
  }

  if (normalized === "/api/settings/preferences" && (method === "GET" || method === "PATCH" || method === "PUT")) {
    return {
      success: true,
      message: method === "GET" ? "Workspace preferences retrieved successfully" : "Workspace preferences updated successfully",
      data: mockWorkspacePreferences as unknown as T,
    };
  }

  if (normalized === "/api/settings/branding" && method === "GET") {
    return {
      success: true,
      message: "Workspace branding retrieved",
      data: mockWorkspaceBranding as unknown as T,
    };
  }

  if (normalized === "/api/settings/branding" && (method === "PATCH" || method === "PUT")) {
    return {
      success: true,
      message: "Workspace branding updated successfully",
      data: mockWorkspaceBranding as unknown as T,
    };
  }

  if (normalized === "/api/notification-preferences" && method === "GET") {
    return {
      success: true,
      message: "Notification preferences retrieved",
      data: mockNotificationPreferences as unknown as T,
    };
  }

  if (normalized === "/api/notification-preferences" && (method === "PATCH" || method === "PUT")) {
    return {
      success: true,
      message: "Notification preferences saved",
      data: mockNotificationPreferences as unknown as T,
    };
  }

  // ==========================================
  // --- USER PROFILE & SECURITY ---
  // ==========================================
  if (normalized === "/api/users/me/profile" && (method === "GET" || method === "PATCH" || method === "PUT")) {
    return {
      success: true,
      message: method === "GET" ? "Profile retrieved successfully" : "Profile updated successfully",
      data: {
        id: 1,
        name: "Vijay Kumar",
        email: "vijay.kumar@softtonia.com",
        phone: "+91 98111 22334",
        role: "owner",
      } as unknown as T,
    };
  }

  if (normalized === "/api/users/me/change-password" && method === "POST") {
    return {
      success: true,
      message: "Password changed successfully",
      data: { success: true } as unknown as T,
    };
  }

  if (normalized === "/api/users/me/sessions" && method === "GET") {
    return {
      success: true,
      message: "Active login sessions retrieved",
      data: mockUserSessions as unknown as T,
    };
  }

  const sessionRevokeMatch = normalized.match(/^\/api\/users\/me\/sessions\/([a-zA-Z0-9_-]+)$/);
  if (sessionRevokeMatch && method === "DELETE") {
    const id = sessionRevokeMatch[1];
    return {
      success: true,
      message: "Session revoked successfully",
      data: { id } as unknown as T,
    };
  }

  if (normalized === "/api/auth/mfa/enroll" && method === "POST") {
    return {
      success: true,
      message: "MFA enrollment initiated",
      data: {
        secret: "JBSWY3DPEHPK3PXP",
        qr_code_url: "otpauth://totp/WhatsAppCRM:vijay.kumar@softtonia.com?secret=JBSWY3DPEHPK3PXP&issuer=WhatsAppCRM",
        recovery_codes: ["ABC1-DEF2", "GHI3-JKL4", "MNO5-PQR6", "STU7-VWX8"],
      } as unknown as T,
    };
  }

  if (normalized === "/api/auth/mfa/confirm" && method === "POST") {
    return {
      success: true,
      message: "MFA enabled and verified successfully",
      data: { mfa_enabled: true } as unknown as T,
    };
  }

  if (normalized === "/api/auth/mfa/disable" && method === "POST") {
    return {
      success: true,
      message: "MFA disabled",
      data: { mfa_enabled: false } as unknown as T,
    };
  }

  return null;
}
