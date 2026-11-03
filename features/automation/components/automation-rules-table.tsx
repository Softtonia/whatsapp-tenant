"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Zap,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { AutomationRule } from "@/types/automation";
import { useDeleteAutomationRuleMutation, useToggleRuleMutation } from "../hooks";
import { RuleBuilderModal } from "./rule-builder-modal";
import { RuleStatusDialog } from "./rule-status-dialog";
import { formatDateTime } from "@/lib/formatters";

interface AutomationRulesTableProps {
  rules: AutomationRule[];
  isLoading: boolean;
  onRefresh?: () => void;
  onCreateNew?: () => void;
}

export function AutomationRulesTable({
  rules,
  isLoading,
  onRefresh,
  onCreateNew,
}: AutomationRulesTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [triggerFilter, setTriggerFilter] = React.useState<string>("all");
  const [editingRule, setEditingRule] = React.useState<AutomationRule | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = React.useState(false);
  const [statusDialogRule, setStatusDialogRule] = React.useState<AutomationRule | null>(null);

  const deleteMutation = useDeleteAutomationRuleMutation();
  const toggleMutation = useToggleRuleMutation();

  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        searchTerm === "" ||
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTrigger =
        triggerFilter === "all" || rule.trigger_type === triggerFilter;

      return matchesSearch && matchesTrigger;
    });
  }, [rules, searchTerm, triggerFilter]);

  const handleConfirmToggle = async () => {
    if (!statusDialogRule) return;
    try {
      await toggleMutation.mutateAsync(statusDialogRule.id);
      setStatusDialogRule(null);
    } catch {
      // Handled by error boundaries / notifications
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to permanently delete this automation rule?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const handleOpenNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setEditingRule(null);
      setIsBuilderOpen(true);
    }
  };

  const getTriggerBadge = (trigger: string) => {
    switch (trigger) {
      case "incoming_message":
        return <Badge variant="outline" className="font-mono text-[10px]">Incoming Chat</Badge>;
      case "conversation_created":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">New Lead</Badge>;
      case "keyword_matched":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono text-[10px]">Keyword</Badge>;
      case "outside_business_hours":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-mono text-[10px]">After Hours</Badge>;
      case "tag_added":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[10px]">Tag Event</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{trigger}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search automation rules by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Triggers</option>
            <option value="incoming_message">Incoming Message</option>
            <option value="conversation_created">New Conversation</option>
            <option value="keyword_matched">Keyword Matched</option>
            <option value="outside_business_hours">Outside Business Hours</option>
            <option value="tag_added">Tag Event</option>
          </select>

          <Button
            size="sm"
            onClick={handleOpenNew}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="size-4" />
            New Workflow Rule
          </Button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Rule Name</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Trigger</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Actions Executed</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Executions</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Last Run</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <Zap className="size-5" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">No automation rules configured</p>
                    <p className="text-[11px] text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "Create automated reply, routing, or tagging workflows to save agent time."}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenNew}
                      className="mt-2 text-xs"
                    >
                      Build First Workflow
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow key={rule.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium align-top py-3">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block">
                        {rule.name}
                      </span>
                      {rule.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    {getTriggerBadge(rule.trigger_type)}
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {rule.actions.map((act, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[10px] font-mono px-1.5 py-0"
                        >
                          {act.type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <button
                      type="button"
                      onClick={() => setStatusDialogRule(rule)}
                      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer group"
                      title="Click to toggle status safely"
                    >
                      {rule.is_active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="size-3.5" />
                          Enabled
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Clock className="size-3.5" />
                          Paused
                        </span>
                      )}
                    </button>
                  </TableCell>

                  <TableCell className="align-top py-3 text-xs font-mono">
                    <span className="font-semibold text-foreground">
                      {rule.executions_count.toLocaleString()}
                    </span>
                  </TableCell>

                  <TableCell className="align-top py-3 text-xs text-muted-foreground">
                    {rule.last_executed_at
                      ? formatDateTime(rule.last_executed_at)
                      : "Never run"}
                  </TableCell>

                  <TableCell className="text-right align-top py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit rule"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                        title="Delete rule"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rule Builder Modal */}
      <RuleBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingRule(null);
        }}
        rule={editingRule}
        onSuccess={onRefresh}
      />

      {/* Safety Confirmation Dialog for Toggling Rule */}
      <RuleStatusDialog
        isOpen={Boolean(statusDialogRule)}
        onClose={() => setStatusDialogRule(null)}
        rule={statusDialogRule}
        onConfirm={handleConfirmToggle}
        isPending={toggleMutation.isPending}
      />
    </div>
  );
}
