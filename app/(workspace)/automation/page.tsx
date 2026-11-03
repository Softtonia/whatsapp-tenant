"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Activity,
  Plus,
  Info,
  CheckCircle2,
  Play,
} from "lucide-react";
import {
  useAutomationRulesQuery,
  useAutomationLogsQuery,
} from "@/features/automation/hooks";
import { AutomationRulesTable } from "@/features/automation/components/automation-rules-table";
import { ExecutionHistoryTable } from "@/features/automation/components/execution-history-table";
import { RuleBuilderModal } from "@/features/automation/components/rule-builder-modal";

export default function AutomationPage() {
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);

  const {
    data: rules,
    isLoading: loadingRules,
    refetch: refetchRules,
  } = useAutomationRulesQuery();

  const {
    data: logs,
    isLoading: loadingLogs,
  } = useAutomationLogsQuery();

  const rulesList = rules || [];
  const logsList = logs || [];

  const activeCount = rulesList.filter((r) => r.is_active).length;
  const totalExecutions = rulesList.reduce(
    (sum, r) => sum + (r.executions_count || 0),
    0
  );
  const successLogsCount = logsList.filter((l) => l.status === "success").length;
  const successRate =
    logsList.length > 0
      ? ((successLogsCount / logsList.length) * 100).toFixed(0)
      : "100";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Workflow Automations"
        description="Configure event-driven triggers, keyword responders, tag automation, and external webhooks for WhatsApp."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Automation" },
        ]}
      >
        <Button
          onClick={() => setIsBuilderOpen(true)}
          size="sm"
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" />
          Create Workflow
        </Button>
      </PageHeader>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Total Workflows</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{rulesList.length}</span>
            <Zap className="size-4 text-primary" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Active Rules</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-success">
              {activeCount}
            </span>
            <CheckCircle2 className="size-4 text-success" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Total Executions</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">
              {totalExecutions.toLocaleString()}
            </span>
            <Play className="size-4 text-primary" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Success Rate</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{successRate}%</span>
            <Badge variant="success" className="text-[10px]">
              Optimal
            </Badge>
          </div>
        </div>
      </div>

      {/* Development Environment Callout */}
      <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-start gap-3 text-xs text-muted-foreground">
        <Info className="size-4 text-primary mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-semibold text-foreground">
            Development Fixture Environment
          </span>
          <p className="text-[11px] leading-relaxed">
            The Automation Engine routes are running in simulated development mode (`/api/automation/rules`) pending backend trigger worker deployment. Rule mutations persist in memory and execute against test contacts.
          </p>
        </div>
      </div>

      {/* Tabs for Rules and Execution Logs */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full sm:w-[380px] grid-cols-2 h-10">
          <TabsTrigger value="rules" className="text-xs font-semibold gap-1.5">
            <Zap className="size-3.5" />
            Rules &amp; Triggers ({rulesList.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold gap-1.5">
            <Activity className="size-3.5" />
            Execution Logs ({logsList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-4">
          <AutomationRulesTable
            rules={rulesList}
            isLoading={loadingRules}
            onRefresh={() => refetchRules()}
            onCreateNew={() => setIsBuilderOpen(true)}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <ExecutionHistoryTable
            logs={logsList}
            isLoading={loadingLogs}
          />
        </TabsContent>
      </Tabs>

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSuccess={() => refetchRules()}
      />
    </div>
  );
}
