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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Activity,
  Phone,
} from "lucide-react";
import type { AutomationExecutionLog } from "@/types/automation";
import { formatDateTime } from "@/lib/formatters";

interface ExecutionHistoryTableProps {
  logs: AutomationExecutionLog[];
  isLoading: boolean;
}

export function ExecutionHistoryTable({
  logs,
  isLoading,
}: ExecutionHistoryTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.contact_phone.includes(searchTerm) ||
        log.trigger_event.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by rule name, contact, or trigger event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Workflow Rule</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Trigger Event</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Recipient Contact</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Duration</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Executed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <Activity className="size-5" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">No execution history found</p>
                    <p className="text-[11px] text-muted-foreground">
                      Execution audits will appear here when automation rules process incoming events.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium align-top py-3">
                    <span className="font-semibold text-xs text-foreground block">
                      {log.rule_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ID: #{log.rule_id}
                    </span>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {log.trigger_event}
                    </Badge>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-foreground block">
                        {log.contact_name}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Phone className="size-3" />
                        {log.contact_phone}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    {log.status === "success" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1 text-[11px]"
                      >
                        <CheckCircle2 className="size-3" />
                        Success
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold gap-1 text-[11px]"
                        >
                          <AlertCircle className="size-3" />
                          Failed
                        </Badge>
                        {log.error_message && (
                          <p className="text-[10px] text-rose-500 max-w-[200px] leading-tight">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="align-top py-3 text-xs font-mono text-muted-foreground">
                    {log.execution_ms}ms
                  </TableCell>

                  <TableCell className="align-top py-3 text-xs text-muted-foreground">
                    {formatDateTime(log.executed_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

