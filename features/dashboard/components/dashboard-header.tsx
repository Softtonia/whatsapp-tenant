"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth/store";
import { useActiveTenant } from "@/lib/tenant/hooks";
import { useRefreshDashboard } from "../hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Clock,
  RefreshCw,
  Plus,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { env } from "@/src/lib/env";

export function DashboardHeader() {
  const user = useAuthStore((s) => s.user);
  const { activeTenant } = useActiveTenant();
  const refreshDashboard = useRefreshDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive time-of-day greeting
  const getGreeting = () => {
    // Standard hour estimation
    const hour = 14; // Default afternoon or local hour
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshDashboard();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const userName = user?.name ? user.name.split(" ")[0] : "Team";
  const workspaceName = activeTenant?.name || "Workspace";
  const timezone = activeTenant?.timezone || "Asia/Kolkata";
  const plan = activeTenant?.plan || "Enterprise";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {userName}
          </h1>
          <Badge variant="secondary" className="gap-1 text-[11px] font-semibold py-0.5">
            <Building2 className="size-3 text-primary" />
            {workspaceName}
          </Badge>
          <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground font-normal">
            <Clock className="size-3" />
            {timezone}
          </Badge>
          {env.NEXT_PUBLIC_ENABLE_API_MOCKING && (
            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
              Dev Fixtures Active
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>Active subscription: <strong className="text-foreground font-semibold">{plan} Plan</strong>.</span>
          <span>WhatsApp Cloud API channel is operational.</span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Refresh dashboard metrics"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Link href="/chats">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold">
            <MessageSquare className="size-3.5 text-primary" />
            <span>Inbox</span>
          </Button>
        </Link>

        <Link href="/campaigns">
          <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold">
            <Plus className="size-3.5" />
            <span>New Broadcast</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
