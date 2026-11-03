"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { campaignCreateSchema, type CampaignCreateData } from "../schemas";
import { useCreateCampaignMutation } from "../hooks";
import { useContactTagsQuery, useContactsQuery } from "@/features/contacts/hooks";
import { useTemplatesQuery } from "@/features/templates/hooks";
import {
  Megaphone,
  Users,
  FileCode2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  MessageSquare,
} from "lucide-react";

interface CampaignWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CampaignWizardContent({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>(["VIP"]);

  const createMutation = useCreateCampaignMutation();

  const { data: tags = [] } = useContactTagsQuery();
  const { data: templatesData } = useTemplatesQuery({ status: "APPROVED" });
  const { data: contactsData } = useContactsQuery({ per_page: 100 });

  const templates = useMemo(() => templatesData?.data || [], [templatesData?.data]);
  const contacts = useMemo(() => contactsData?.data || [], [contactsData?.data]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CampaignCreateData>({
    resolver: zodResolver(campaignCreateSchema) as never,
    defaultValues: {
      name: "",
      template_id: templates[0]?.id || 1,
      phone_number_id: 1,
      audience_tags: ["VIP"],
      send_type: "now",
      scheduled_at: "",
      variable_mapping: { "1": "name", "2": "company" },
    },
  });

  const selectedTemplateId = watch("template_id");
  const sendType = watch("send_type");
  const campaignName = watch("name");

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => String(t.id) === String(selectedTemplateId)) || templates[0];
  }, [templates, selectedTemplateId]);

  const handleToggleTag = (tagName: string) => {
    let next: string[];
    if (selectedTags.includes(tagName)) {
      next = selectedTags.filter((t) => t !== tagName);
    } else {
      next = [...selectedTags, tagName];
    }
    if (next.length === 0) next = [tagName];
    setSelectedTags(next);
    setValue("audience_tags", next);
  };

  const estimatedRecipients = useMemo(() => {
    if (selectedTags.includes("All Customers")) return contacts.length * 15;
    return Math.max(
      selectedTags.length * 140,
      contacts.filter((c) => c.tags.some((t) => selectedTags.includes(t))).length || 45
    );
  }, [selectedTags, contacts]);

  const onSubmit = async (data: CampaignCreateData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        audience_tags: selectedTags,
      });
      onClose();
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending;

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Megaphone className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Create WhatsApp Broadcast
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Step {step} of 4:{" "}
                {step === 1 && "Campaign Setup"}
                {step === 2 && "Select Audience Segment"}
                {step === 3 && "Template & Variables"}
                {step === 4 && "Review & Schedule"}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Campaign Name *
              </label>
              <Input
                {...register("name")}
                placeholder="e.g. Diwali Festive Flash Sale 2026"
                className="h-9 text-xs"
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Sending WhatsApp Phone Number
              </label>
              <select
                {...register("phone_number_id")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="1">+91 98765 43210 (Verified Business API)</option>
                <option value="2">+91 98111 22334 (Branch Support Line)</option>
              </select>
            </div>

            <div className="p-3 bg-muted/20 border border-border/80 rounded-lg space-y-1 text-xs">
              <p className="font-semibold text-foreground">Messaging Limit & Compliance</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your WhatsApp Business Account is rated <strong>Tier 10K (High Quality)</strong>.
                Messages will be sent using approved Meta templates without 24h customer window limits.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {step === 2 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-muted-foreground" />
                Select Contact Segments / Tags
              </label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Contacts matching any of the selected audience tags will be targeted.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-foreground border-border hover:bg-muted/40"
                    }`}
                  >
                    <span>{tag.name}</span>
                    {isSelected && <CheckCircle2 className="size-3" />}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Estimated Audience Size:</span>
              <span className="font-extrabold text-foreground font-mono">
                ~{estimatedRecipients.toLocaleString()} Verified Contacts
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Template & Variables */}
        {step === 3 && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileCode2 className="size-3.5 text-muted-foreground" />
                Approved WhatsApp Template *
              </label>
              <select
                {...register("template_id")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.category} - {tpl.language})
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && (
              <div className="rounded-xl border border-border/80 bg-muted/10 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {selectedTemplate.name}
                  </span>
                  <Badge variant="default" className="text-[10px] font-semibold">
                    {selectedTemplate.status}
                  </Badge>
                </div>
                <p className="text-xs text-foreground bg-background p-2.5 rounded-lg border border-border/60 whitespace-pre-wrap leading-relaxed">
                  {selectedTemplate.components?.find((c) => c.type === "BODY")?.text ||
                    selectedTemplate.body_text}
                </p>
              </div>
            )}

            {/* Variable Mapping */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Dynamic Variable Mapping
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-mono">{"{{1}}"} (Customer Name)</span>
                  <Input value="Contact: Full Name" disabled className="h-8 text-xs bg-muted/30" />
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-mono">{"{{2}}"} (Company / Detail)</span>
                  <Input value="Contact: Company" disabled className="h-8 text-xs bg-muted/30" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule & Preview */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                Delivery Schedule
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("send_type", "now")}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    sendType === "now"
                      ? "border-primary bg-primary/5 text-foreground font-bold shadow-xs"
                      : "border-border text-muted-foreground hover:bg-muted/20"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1 text-foreground">
                    <Clock className="size-3.5 text-primary" />
                    Dispatch Now
                  </p>
                  <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                    Send immediately to all recipients
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("send_type", "schedule")}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    sendType === "schedule"
                      ? "border-primary bg-primary/5 text-foreground font-bold shadow-xs"
                      : "border-border text-muted-foreground hover:bg-muted/20"
                  }`}
                >
                  <p className="font-bold flex items-center gap-1 text-foreground">
                    <Calendar className="size-3.5 text-primary" />
                    Schedule for Later
                  </p>
                  <p className="text-[11px] font-normal text-muted-foreground mt-0.5">
                    Pick a specific date & time
                  </p>
                </button>
              </div>

              {sendType === "schedule" && (
                <div className="pt-1">
                  <Input
                    type="datetime-local"
                    {...register("scheduled_at")}
                    className="h-9 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Message Bubble Preview */}
            <div className="rounded-xl border border-border bg-emerald-950/10 dark:bg-emerald-950/20 p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MessageSquare className="size-3 text-primary" />
                WhatsApp Message Preview
              </span>
              <div className="max-w-[85%] bg-card p-3 rounded-xl rounded-tl-none shadow-xs border border-border/80 space-y-1.5 text-xs">
                <p className="font-bold text-primary text-[11px]">Softtonia Solutions</p>
                <p className="text-foreground leading-relaxed">
                  {selectedTemplate?.components?.find((c) => c.type === "BODY")?.text?.replace(
                    "{{1}}",
                    "Aarav"
                  ).replace("{{2}}", "Acme Industries") ||
                    "Important update for our valued customer."}
                </p>
                <p className="text-[9px] text-muted-foreground text-right font-mono">10:00 AM ✓✓</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between w-full">
          <div>
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
                className="gap-1 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (step === 1 && !campaignName.trim()) {
                    setValue("name", "New WhatsApp Broadcast Campaign");
                  }
                  setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
                }}
                className="gap-1 text-xs font-semibold"
              >
                <span>Continue</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5 text-xs font-bold">
                {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                <span>{sendType === "now" ? "Dispatch Campaign Now" : "Schedule Broadcast"}</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function CampaignWizardModal({ isOpen, onClose }: CampaignWizardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && <CampaignWizardContent onClose={onClose} />}
    </Dialog>
  );
}

