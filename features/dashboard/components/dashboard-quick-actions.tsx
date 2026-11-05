"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Users,
  Send,
  FileText,
  Bot,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useOnboardingRequirementsQuery } from "@/features/onboarding/hooks";

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

interface MilestoneItem {
  title: string;
  completed: boolean;
  href?: string;
}

const DEFAULT_MILESTONES: MilestoneItem[] = [
  { title: "Tenant Account Registration", completed: true },
  { title: "Business Information & Legal Profile", completed: true },
  { title: "Business Verification Documents Uploaded", completed: true },
  { title: "Subscription Plan Configured", completed: true },
  { title: "Marketing & WhatsApp Compliance Verified", completed: true },
  { title: "Workspace Final Activation Completed", completed: true },
  { title: "Meta Business Portfolio Connection", completed: false, href: "/whatsapp-connections" },
  { title: "WhatsApp Business Account (WABA) Setup", completed: false, href: "/whatsapp-connections" },
];

export function DashboardQuickActions() {
  const { data: requirementsRes } = useOnboardingRequirementsQuery();
  const reqData = requirementsRes?.data || requirementsRes;

  const completionPercentage = reqData?.summary?.completion_percentage ?? 75;
  const completedSteps = reqData?.completed_steps;
  const pendingSteps = reqData?.pending_steps;

  // Build dynamic milestone items if available from /api/onboarding/requirements
  const milestones: MilestoneItem[] =
    Array.isArray(completedSteps) && Array.isArray(pendingSteps)
      ? [
          ...completedSteps.map((s: any): MilestoneItem => ({
            title: s.step_title || s.step_key,
            completed: true,
          })),
          ...pendingSteps.map((s: any): MilestoneItem => ({
            title: s.step_title || s.step_key,
            completed: false,
            href: "/whatsapp-connections",
          })),
        ]
      : DEFAULT_MILESTONES;

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
              {completionPercentage}% Ready
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                {milestone.completed ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Clock className="size-3.5 text-amber-500 shrink-0" />
                )}
                <span
                  className={`text-[11px] truncate ${
                    milestone.completed
                      ? "text-foreground font-medium"
                      : "text-muted-foreground font-medium"
                  }`}
                >
                  {milestone.title}
                </span>
              </div>

              {!milestone.completed && milestone.href && (
                <Link
                  href={milestone.href}
                  className="text-[10px] text-primary hover:underline font-semibold shrink-0"
                >
                  Connect
                </Link>
              )}
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
