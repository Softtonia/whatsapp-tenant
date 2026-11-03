import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  ShoppingBag,
  Bot,
  Zap,
  UsersRound,
  Radio,
  FileCode2,
  CreditCard,
  Gauge,
  Settings,
  ShieldCheck,
  Palette,
} from "lucide-react";
import type { UserRole } from "@/types/user";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "info" | "secondary";
  roles?: UserRole[];
  description?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    title: "Operations",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview, metrics, and real-time SLA tracking",
      },
      {
        title: "Shared Inbox",
        href: "/chats",
        icon: MessageSquare,
        badge: "Live",
        badgeVariant: "success",
        description: "Two-way customer communication and agent routing",
      },
      {
        title: "Contacts & Leads",
        href: "/contacts",
        icon: Users,
        description: "Directory, audience tags, and CSV import",
      },
    ],
  },
  {
    title: "Marketing & Growth",
    items: [
      {
        title: "Broadcast Campaigns",
        href: "/campaigns",
        icon: Megaphone,
        description: "Bulk marketing campaigns via Meta templates",
      },
      {
        title: "Products",
        href: "/products",
        icon: ShoppingBag,
        description: "WhatsApp Catalog products and services",
      },
      {
        title: "AI Chatbot",
        href: "/ai-chatbot",
        icon: Bot,
        badge: "AI",
        badgeVariant: "info",
        description: "Automated sales assistant and bot workflows",
      },
      {
        title: "Automation",
        href: "/automation",
        icon: Zap,
        description: "Webhook rules, routing triggers, and auto-replies",
      },
    ],
  },
  {
    title: "WhatsApp Channel",
    items: [
      {
        title: "WhatsApp Connections",
        href: "/whatsapp-connections",
        icon: Radio,
        description: "Meta Cloud API credentials, phone numbers, and WABA",
      },
      {
        title: "Message Templates",
        href: "/templates",
        icon: FileCode2,
        description: "Meta-approved marketing, utility & auth templates",
      },
    ],
  },
  {
    title: "Management & Billing",
    items: [
      {
        title: "Team Members",
        href: "/team",
        icon: UsersRound,
        roles: ["owner", "admin", "super_admin"],
        description: "Workspace agents, invite links, and RBAC",
      },
      {
        title: "Billing & Plans",
        href: "/billing",
        icon: CreditCard,
        roles: ["owner", "admin", "super_admin"],
        description: "Subscription tiers, invoices, and payment gateways",
      },
      {
        title: "Usage & Quotas",
        href: "/usage",
        icon: Gauge,
        roles: ["owner", "admin", "super_admin"],
        description: "Monthly conversation quotas and message throughput",
      },
      {
        title: "Workspace Settings",
        href: "/settings",
        icon: Settings,
        roles: ["owner", "admin", "super_admin"],
        description: "Branding, timezone, and webhook endpoints",
      },
      {
        title: "Profile & Security",
        href: "/profile",
        icon: ShieldCheck,
        description: "Personal credentials, sessions, and MFA",
      },
      {
        title: "Design System",
        href: "/design-system",
        icon: Palette,
        badge: "Tokens",
        badgeVariant: "secondary",
        description: "Semantic tokens and component showcase",
      },
    ],
  },
];

/**
 * Filter navigation items based on current active user role
 */
export function getFilteredNavigation(userRole?: UserRole | string): NavSection[] {
  if (!userRole) {
    return navigationConfig;
  }

  return navigationConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.roles || item.roles.length === 0) return true;
        return item.roles.includes(userRole as UserRole);
      }),
    }))
    .filter((section) => section.items.length > 0);
}

