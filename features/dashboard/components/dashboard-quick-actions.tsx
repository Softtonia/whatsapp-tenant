"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  Send,
  FileText,
  Bot,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface QuickActionItem {
  title: string;
  description: string;
  icon: typeof MessageSquare;
  href: string;
  badge?: string;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    title: "Shared Inbox",
    description: "Assign chats and reply to customers in real-time",
    icon: MessageSquare,
    href: "/chats",
  },
  {
    title: "Launch Broadcast",
    description: "Send personalized campaigns with approved templates",
    icon: Send,
    href: "/campaigns",
  },
  {
    title: "Import Contacts",
    description: "Upload customer phone lists via CSV spreadsheet",
    icon: Users,
    href: "/contacts",
  },
  {
    title: "Meta Templates",
    description: "Submit and sync pre-approved message templates",
    icon: FileText,
    href: "/templates",
  },
  {
    title: "AI Chatbot & Flows",
    description: "Configure automated interactive response trees",
    icon: Bot,
    href: "/ai-chatbot",
  },
];

const ONBOARDING_MILESTONES = [
  { title: "WhatsApp Cloud API Connected", completed: true },
  { title: "Business Profile & Timezone Configured", completed: true },
  { title: "Meta Templates Submitted & Synced", completed: true },
  { title: "Team Members Invited to Workspace", completed: true },
  { title: "First Customer Broadcast Dispatched", completed: true },
];

export function DashboardQuickActions() {
  return (
    <div className="space-y-6">
      {/* Workspace Readiness / Onboarding Checklist */}
      <Card className="border-border/80 shadow-xs bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold">Workspace Launch Readiness</CardTitle>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full font-mono">
              100% Ready
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {ONBOARDING_MILESTONES.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
              <span className="text-foreground text-[11px] font-medium">{milestone.title}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Navigation Actions */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-border/70 hover:border-border hover:bg-muted/40 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {action.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {action.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

