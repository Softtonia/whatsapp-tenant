"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import {
  Zap,
  Plus,
  Trash2,
} from "lucide-react";
import {
  automationRuleSchema,
  type AutomationRuleFormData,
} from "../schemas";
import {
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
} from "../hooks";
import type { AutomationRule } from "@/types/automation";

interface RuleBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: AutomationRule | null;
  onSuccess?: () => void;
}

export function RuleBuilderModal({
  isOpen,
  onClose,
  rule,
  onSuccess,
}: RuleBuilderModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <RuleBuilderInnerForm
          key={rule?.id ?? "new"}
          rule={rule}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function RuleBuilderInnerForm({
  rule,
  onClose,
  onSuccess,
}: {
  rule?: AutomationRule | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(rule?.id);
  const createMutation = useCreateAutomationRuleMutation();
  const updateMutation = useUpdateAutomationRuleMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<AutomationRuleFormData>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: {
      name: rule?.name || "",
      description: rule?.description || "",
      is_active: rule?.is_active ?? true,
      trigger_type: rule?.trigger_type || "incoming_message",
      conditions: rule?.conditions || [
        { field: "message.body", operator: "contains", value: "" },
      ],
      actions: rule?.actions || [
        { type: "send_message", payload: { text: "Thank you for reaching out! We will be with you shortly." } },
      ],
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "conditions",
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const watchedActions = watch("actions");
  const selectedTrigger = watch("trigger_type");

  const onSubmit = async (data: AutomationRuleFormData) => {
    try {
      setErrorMessage(null);
      if (isEditing && rule) {
        await updateMutation.mutateAsync({
          id: rule.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save automation rule"
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isEditing ? "Edit Automation Workflow" : "Build Automation Workflow"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define triggers, condition rules, and automated execution actions for WhatsApp conversations.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      {/* Basic Settings */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Rule Name *
          </Label>
          <Input
            {...register("name")}
            placeholder="e.g. VIP Greeting or After-Hours Auto-Responder"
            className="text-xs"
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Description (Optional)
          </Label>
          <Input
            {...register("description")}
            placeholder="Brief explanation of when and why this workflow runs"
            className="text-xs"
          />
        </div>

        {/* Step 1: Trigger */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                1
              </span>
              When this event happens (Trigger)
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: "incoming_message",
                label: "Incoming Message",
                desc: "Every incoming WhatsApp message from any contact",
              },
              {
                id: "conversation_created",
                label: "New Conversation",
                desc: "First message received from a new contact",
              },
              {
                id: "keyword_matched",
                label: "Keyword Matched",
                desc: "Message matches predefined keyword or hashtag",
              },
              {
                id: "outside_business_hours",
                label: "Outside Business Hours",
                desc: "Incoming chat received after configured working hours",
              },
              {
                id: "tag_added",
                label: "Tag Applied",
                desc: "When a tag like 'Lead' or 'VIP' is added",
              },
            ].map((trig) => (
              <label
                key={trig.id}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors block ${
                  selectedTrigger === trig.id
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-card border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={trig.id}
                    {...register("trigger_type")}
                    className="sr-only"
                  />
                  <div
                    className={`size-3.5 rounded-full border flex items-center justify-center ${
                      selectedTrigger === trig.id
                        ? "border-primary bg-primary"
                        : "border-input"
                    }`}
                  >
                    {selectedTrigger === trig.id && (
                      <div className="size-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className="font-semibold text-foreground">{trig.label}</span>
                </div>
                <p className="text-[11px] mt-1 pl-5 text-muted-foreground">
                  {trig.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Conditions */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                2
              </span>
              And if these conditions match (Optional Filter)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendCondition({ field: "message.body", operator: "contains", value: "" })
              }
              className="h-7 text-xs gap-1"
            >
              <Plus className="size-3.5" />
              Add Condition
            </Button>
          </div>

          {conditionFields.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-2">
              No conditions set. This rule will trigger for all events matching the trigger.
            </p>
          ) : (
            <div className="space-y-2">
              {conditionFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-lg bg-card border border-border text-xs"
                >
                  <select
                    {...register(`conditions.${idx}.field` as const)}
                    className="w-full sm:w-1/3 h-8 rounded-md border border-input bg-background px-2 text-xs font-mono"
                  >
                    <option value="message.body">Message Text (message.body)</option>
                    <option value="contact.tags">Contact Tags (contact.tags)</option>
                    <option value="contact.source">Contact Source (contact.source)</option>
                  </select>

                  <select
                    {...register(`conditions.${idx}.operator` as const)}
                    className="w-full sm:w-1/4 h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="starts_with">Starts with</option>
                    <option value="has_tag">Has tag</option>
                    <option value="is_empty">Is empty</option>
                  </select>

                  <Input
                    {...register(`conditions.${idx}.value` as const)}
                    placeholder="Value (e.g. urgent, pricing)"
                    className="h-8 text-xs flex-1"
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(idx)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Actions */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              Then perform these actions
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendAction({
                  type: "send_message",
                  payload: { text: "Hello, we will get back to you soon!" },
                })
              }
              className="h-7 text-xs gap-1"
            >
              <Plus className="size-3.5" />
              Add Action
            </Button>
          </div>

          <div className="space-y-3">
            {actionFields.map((field, idx) => {
              const currentActionType = watchedActions?.[idx]?.type || "send_message";

              return (
                <div
                  key={field.id}
                  className="p-3 rounded-lg bg-card border border-border text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">Action {idx + 1}</span>
                    {actionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(idx)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Action Type</Label>
                      <select
                        {...register(`actions.${idx}.type` as const)}
                        className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                      >
                        <option value="send_message">Send WhatsApp Text Message</option>
                        <option value="send_template">Send Approved Meta Template</option>
                        <option value="assign_agent">Assign to Agent</option>
                        <option value="add_tag">Add Tag to Contact</option>
                        <option value="resolve_conversation">Resolve Conversation</option>
                        <option value="trigger_webhook">Trigger Webhook URL</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        {currentActionType === "send_message" && "Message Text"}
                        {currentActionType === "send_template" && "Template Name"}
                        {currentActionType === "assign_agent" && "Agent Email or Name"}
                        {currentActionType === "add_tag" && "Tag Name"}
                        {currentActionType === "trigger_webhook" && "Webhook Endpoint URL"}
                        {currentActionType === "resolve_conversation" && "Resolution Note"}
                      </Label>
                      <Input
                        {...register(`actions.${idx}.payload.text` as const)}
                        placeholder={
                          currentActionType === "send_template"
                            ? "e.g. order_confirmation"
                            : currentActionType === "assign_agent"
                            ? "agent@company.com"
                            : currentActionType === "add_tag"
                            ? "VIP"
                            : currentActionType === "trigger_webhook"
                            ? "https://api.crm.com/hook"
                            : "Enter message text..."
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.actions && (
            <p className="text-xs text-rose-500 font-medium">{errors.actions.message}</p>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="gap-1.5 font-semibold text-xs"
        >
          {isPending ? "Saving..." : isEditing ? "Update Workflow" : "Create Workflow"}
        </Button>
      </DialogFooter>
    </form>
  );
}
