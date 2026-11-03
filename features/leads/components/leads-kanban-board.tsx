"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead, PipelineStage } from "@/types/lead";
import { formatCurrency } from "@/lib/formatters";
import { useLeadsQuery, usePipelineStagesQuery } from "../hooks";
import { LeadCard } from "./lead-card";
import { LeadFormModal } from "./lead-form-modal";
import { Search, Plus, Filter, Kanban, TrendingUp } from "lucide-react";

export function LeadsKanbanBoard() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStageId, setTargetStageId] = useState<string | number | undefined>(undefined);

  const { data: stages = [], isLoading: loadingStages } = usePipelineStagesQuery();
  const { data: leads = [], isLoading: loadingLeads } = useLeadsQuery({
    search: search.trim() || undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  const handleOpenAddLead = (stageId?: string | number) => {
    setSelectedLead(null);
    setTargetStageId(stageId);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setTargetStageId(lead.pipeline_stage_id);
    setIsModalOpen(true);
  };

  const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search, Filter, and KPI Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by title or contact..."
              className="pl-8 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 border border-input rounded-lg px-2 h-9 bg-background">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-none border-none pr-1"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-2 py-1 bg-muted/30 rounded-lg">
            <TrendingUp className="size-3.5 text-primary" />
            <span>Total Pipeline:</span>
            <span className="font-bold text-foreground">
              {formatCurrency(totalPipelineValue, "INR")}
            </span>
          </div>

          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            onClick={() => handleOpenAddLead()}
          >
            <Plus className="size-3.5" />
            <span>New Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Kanban Multi-Column Grid */}
      {loadingStages || loadingLeads ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-muted/10 p-3 space-y-3"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Kanban className="size-8 text-muted-foreground/30 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-foreground">No Pipeline Stages Found</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Configure pipeline stages in workspace settings or verify your API connection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {stages.map((stage: PipelineStage) => {
            const stageLeads = leads.filter(
              (l) => String(l.pipeline_stage_id) === String(stage.id)
            );
            const stageTotalValue = stageLeads.reduce(
              (acc, curr) => acc + (curr.value || 0),
              0
            );

            return (
              <div
                key={stage.id}
                className="rounded-xl border border-border/80 bg-muted/20 flex flex-col h-full min-h-[450px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-border/80 space-y-1.5 bg-card/60 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: stage.color || "#3b82f6" }}
                      />
                      <h3 className="text-xs font-bold text-foreground truncate max-w-[120px]">
                        {stage.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Value</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(stageTotalValue, "INR")}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[600px]">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center border-2 border-dashed border-border/50 rounded-lg">
                      <p className="text-[10px] font-medium text-muted-foreground">
                        No deals here
                      </p>
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        stages={stages}
                        onEdit={handleEditLead}
                      />
                    ))
                  )}
                </div>

                {/* Quick Add Button per Stage */}
                <div className="p-2 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-[11px] text-muted-foreground hover:text-foreground justify-center gap-1 font-medium"
                    onClick={() => handleOpenAddLead(stage.id)}
                  >
                    <Plus className="size-3" />
                    <span>Add Deal</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Form Dialog */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        leadToEdit={selectedLead}
        stages={stages}
        initialStageId={targetStageId}
      />
    </div>
  );
}

