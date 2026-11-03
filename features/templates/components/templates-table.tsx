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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Eye,
  Copy,
  Check,
  FileCode2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import type { MetaTemplate } from "@/types/template";
import { TemplatePreviewCard } from "./template-preview-card";
import { formatDateTime } from "@/lib/formatters";

interface TemplatesTableProps {
  templates: MetaTemplate[];
  isLoading: boolean;
  onRefresh?: () => void;
  onCreateNew?: () => void;
}

export function TemplatesTable({
  templates,
  isLoading,
  onRefresh,
  onCreateNew,
}: TemplatesTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = React.useState<MetaTemplate | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | number | null>(null);

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        searchTerm === "" ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.components?.some((c) => c.text?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchTerm, categoryFilter, statusFilter]);

  const handleCopy = (id: string | number, name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1 text-[11px]">
            <CheckCircle2 className="size-3" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold gap-1 text-[11px]">
            <Clock className="size-3" />
            Pending Review
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold gap-1 text-[11px]">
            <AlertTriangle className="size-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Categories</option>
            <option value="MARKETING">Marketing</option>
            <option value="UTILITY">Utility</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending Review</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 w-9 p-0"
              title="Refresh templates"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}

          {onCreateNew && (
            <Button
              size="sm"
              onClick={onCreateNew}
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-4" />
              New Template
            </Button>
          )}
        </div>
      </div>

      {/* Templates Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Template</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Category</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Language</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Components</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Last Synced</TableHead>
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
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <FileCode2 className="size-5" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">No templates found</p>
                    <p className="text-[11px] text-muted-foreground">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search or filters."
                        : "Create a template or sync existing templates from Meta Cloud."}
                    </p>
                    {onCreateNew && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onCreateNew}
                        className="mt-2 text-xs"
                      >
                        Create First Template
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => {
                const header = template.components?.find((c) => c.type === "HEADER");
                const body = template.components?.find((c) => c.type === "BODY");
                const buttons = template.components?.find((c) => c.type === "BUTTONS");
                const varCount = (body?.text?.match(/\{\{\d+\}\}/g) || []).length;

                return (
                  <TableRow
                    key={template.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-foreground block">
                          {template.name}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]">
                          {body?.text || template.body_text || "No preview"}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {template.category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {template.language}
                      </span>
                    </TableCell>

                    <TableCell>{getStatusBadge(template.status)}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {header && (
                          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                            Header
                          </span>
                        )}
                        {varCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-medium">
                            {varCount} {varCount === 1 ? "var" : "vars"}
                          </span>
                        )}
                        {buttons?.buttons && buttons.buttons.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono font-medium">
                            {buttons.buttons.length} {buttons.buttons.length === 1 ? "btn" : "btns"}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {template.last_synced_at
                        ? formatDateTime(template.last_synced_at)
                        : template.created_at
                        ? formatDateTime(template.created_at)
                        : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(template.id, template.name)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Copy template name"
                        >
                          {copiedId === template.id ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template)}
                          className="h-8 text-xs gap-1.5"
                        >
                          <Eye className="size-3.5" />
                          Preview
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={Boolean(selectedTemplate)}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Template Preview & Tester
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <TemplatePreviewCard
              template={selectedTemplate}
              showVariableInputs={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

