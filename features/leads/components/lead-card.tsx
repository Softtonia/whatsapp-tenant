"use client";

import type { Lead, PipelineStage } from "@/types/lead";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { useUpdateLeadStageMutation } from "../hooks";
import { Phone, Calendar, ArrowRight, UserCheck } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  stages: PipelineStage[];
  onEdit: (lead: Lead) => void;
}

const PRIORITY_BADGES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "outline" },
  high: { label: "High", variant: "default" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export function LeadCard({ lead, stages, onEdit }: LeadCardProps) {
  const updateStageMutation = useUpdateLeadStageMutation();

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStageId = e.target.value;
    if (newStageId && String(newStageId) !== String(lead.pipeline_stage_id)) {
      await updateStageMutation.mutateAsync({
        id: lead.id,
        pipelineStageId: newStageId,
      });
    }
  };

  const priorityMeta = PRIORITY_BADGES[lead.priority] || PRIORITY_BADGES.medium;

  return (
    <div
      onClick={() => onEdit(lead)}
      className="group relative rounded-xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-primary/50 hover:shadow-md transition-all cursor-pointer space-y-2.5"
    >
      {/* Top Header: Title & Priority */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {lead.title}
        </h4>
        <Badge
          variant={priorityMeta.variant}
          className="text-[9px] px-1.5 py-0 uppercase font-bold shrink-0 tracking-wider"
        >
          {priorityMeta.label}
        </Badge>
      </div>

      {/* Value */}
      <div className="text-sm font-extrabold text-foreground">
        {formatCurrency(lead.value, lead.currency)}
      </div>

      {/* Linked Contact */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        <span className="font-semibold text-foreground/90 truncate max-w-[140px]">
          {lead.contact_name}
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <Phone className="size-2.5" />
          {lead.contact_phone}
        </span>
      </div>

      {/* Follow-up & Owner */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        {lead.follow_up_at ? (
          <span className="flex items-center gap-1 font-medium text-foreground/80">
            <Calendar className="size-3 text-primary" />
            {new Date(lead.follow_up_at).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : (
          <span className="italic text-muted-foreground/60">No follow-up set</span>
        )}

        {lead.owner_name && (
          <span className="flex items-center gap-1 font-medium text-foreground/80">
            <UserCheck className="size-3 text-muted-foreground" />
            {lead.owner_name}
          </span>
        )}
      </div>

      {/* Quick Stage Switcher */}
      <div
        className="pt-1.5 flex items-center justify-between gap-1.5 border-t border-border/30"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
          <ArrowRight className="size-2.5 text-primary" />
          Stage
        </span>
        <select
          value={lead.pipeline_stage_id}
          onChange={handleStageChange}
          disabled={updateStageMutation.isPending}
          className="text-[10px] bg-muted/40 hover:bg-muted/70 rounded px-1.5 py-0.5 border border-border/60 text-foreground font-medium outline-none cursor-pointer max-w-[120px]"
        >
          {stages.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

