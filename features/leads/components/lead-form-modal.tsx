"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { leadSchema, type LeadFormData } from "../schemas";
import { useCreateLeadMutation, useUpdateLeadMutation } from "../hooks";
import { useContactsQuery } from "@/features/contacts/hooks";
import type { Lead, PipelineStage } from "@/types/lead";
import { DollarSign, User, Tag, Calendar, Loader2 } from "lucide-react";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
  stages: PipelineStage[];
  initialStageId?: string | number;
}

interface FormContentProps {
  leadToEdit?: Lead | null;
  stages: PipelineStage[];
  initialStageId?: string | number;
  onClose: () => void;
}

function LeadFormContent({
  leadToEdit,
  stages,
  initialStageId,
  onClose,
}: FormContentProps) {
  const isEditing = Boolean(leadToEdit);
  const createMutation = useCreateLeadMutation();
  const updateMutation = useUpdateLeadMutation(leadToEdit?.id);

  const { data: contactsData } = useContactsQuery({ per_page: 50 });
  const contacts = useMemo(() => contactsData?.data || [], [contactsData?.data]);

  const defaultStageId = initialStageId || stages[0]?.id || 1;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as never,
    defaultValues: {
      title: leadToEdit?.title || "",
      contact_id: leadToEdit?.contact_id || contacts[0]?.id || 101,
      pipeline_stage_id: leadToEdit?.pipeline_stage_id || defaultStageId,
      priority: leadToEdit?.priority || "medium",
      value: leadToEdit?.value ?? 0,
      currency: leadToEdit?.currency || "INR",
      follow_up_at: leadToEdit?.follow_up_at
        ? new Date(leadToEdit.follow_up_at).toISOString().split("T")[0]
        : "",
      notes: leadToEdit?.notes || "",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      const payload = {
        ...data,
        follow_up_at: data.follow_up_at ? new Date(data.follow_up_at).toISOString() : null,
      };

      if (isEditing && leadToEdit) {
        await updateMutation.mutateAsync({
          id: leadToEdit.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-foreground">
          {isEditing ? "Edit Opportunity" : "Create New Lead"}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Track deal value, pipeline stage, and follow-up SLAs linked to your WhatsApp contacts.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
        {/* Opportunity Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Opportunity / Deal Title *
          </label>
          <Input
            {...register("title")}
            placeholder="e.g. Enterprise WhatsApp Suite (50 Seats)"
            className="h-9 text-xs"
          />
          {errors.title && (
            <p className="text-[11px] text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Linked Contact */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground" />
            Linked Contact *
          </label>
          <select
            {...register("contact_id")}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            {contacts.length === 0 ? (
              <option value="101">Aarav Sharma (+91 98111 22233)</option>
            ) : (
              contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.company || "Individual"}
                </option>
              ))
            )}
          </select>
          {errors.contact_id && (
            <p className="text-[11px] text-destructive">{errors.contact_id.message}</p>
          )}
        </div>

        {/* Pipeline Stage & Priority (Two-Column) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              Pipeline Stage *
            </label>
            <select
              {...register("pipeline_stage_id")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Priority</label>
            <select
              {...register("priority")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Deal Value & Currency (Two-Column) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-muted-foreground" />
              Estimated Value
            </label>
            <Input
              type="number"
              {...register("value")}
              placeholder="50000"
              className="h-9 text-xs"
            />
            {errors.value && (
              <p className="text-[11px] text-destructive">{errors.value.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Currency</label>
            <select
              {...register("currency")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>
        </div>

        {/* Follow-up Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Calendar className="size-3.5 text-muted-foreground" />
            Follow-up Due Date
          </label>
          <Input
            type="date"
            {...register("follow_up_at")}
            className="h-9 text-xs"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Internal Deal Notes
          </label>
          <Textarea
            {...register("notes")}
            placeholder="Requirements, customer budget, timeline, or next steps..."
            className="text-xs min-h-[60px] resize-none"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            <span>{isEditing ? "Save Changes" : "Create Opportunity"}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function LeadFormModal({
  isOpen,
  onClose,
  leadToEdit,
  stages,
  initialStageId,
}: LeadFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <LeadFormContent
          key={leadToEdit?.id ?? `new_${initialStageId ?? "default"}`}
          leadToEdit={leadToEdit}
          stages={stages}
          initialStageId={initialStageId}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
