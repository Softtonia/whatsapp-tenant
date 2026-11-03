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
import { Textarea } from "@/components/ui/textarea";
import {
  FileCode2,
  Plus,
  Trash2,
  Sparkles,
  Info,
  CornerDownLeft,
  ExternalLink,
  Phone,
} from "lucide-react";
import { templateCreateSchema, type TemplateCreateData } from "../schemas";
import { useCreateTemplateMutation } from "../hooks";

interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TemplateCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: TemplateCreateModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <TemplateCreateForm
          key={isOpen ? "open" : "closed"}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function TemplateCreateForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const createMutation = useCreateTemplateMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<TemplateCreateData>({
    resolver: zodResolver(templateCreateSchema),
    defaultValues: {
      name: "",
      category: "MARKETING",
      language: "en_US",
      header_text: "",
      body_text: "Hello {{1}}, thank you for contacting us! We are excited to share our latest updates.",
      footer_text: "Reply STOP to unsubscribe",
      buttons: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  const watchedValues = watch();

  const handleInsertVariable = () => {
    const current = watchedValues.body_text || "";
    const matches = current.match(/\{\{(\d+)\}\}/g) || [];
    const nextNum = matches.length + 1;
    setValue("body_text", `${current} {{${nextNum}}}`.trim());
  };

  const onSubmit = async (data: TemplateCreateData) => {
    try {
      setErrorMessage(null);
      await createMutation.mutateAsync(data);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit template to Meta";
      setErrorMessage(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileCode2 className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              Create WhatsApp Message Template
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Draft and submit a new message template to Meta for official WhatsApp review and approval.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Template Name (Meta Identifier) *
            </Label>
            <Input
              {...register("name")}
              placeholder="e.g. order_confirmation_v2"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Only lowercase letters, numbers, and underscores allowed by Meta.
            </p>
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Category *
              </Label>
              <select
                {...register("category")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Language *
              </Label>
              <select
                {...register("language")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="es_ES">Spanish (Spain)</option>
                <option value="pt_BR">Portuguese (Brazil)</option>
                <option value="fr_FR">French</option>
                <option value="de_DE">German</option>
                <option value="hi_IN">Hindi</option>
                <option value="ar_SA">Arabic</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Header Text (Optional)
            </Label>
            <Input
              {...register("header_text")}
              placeholder="e.g. Exclusive Offer or Order Update"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Body Text *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleInsertVariable}
                className="h-6 text-[11px] gap-1 px-2 text-primary font-semibold"
              >
                <Sparkles className="size-3" />
                Add Variable
              </Button>
            </div>
            <Textarea
              {...register("body_text")}
              rows={4}
              placeholder="Enter message body. Use {{1}}, {{2}} for dynamic customer parameters."
              className="text-xs leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="size-3" />
              Use double braces like <code>{"{{1}}"}</code> for name, order number, or tracking code.
            </p>
            {errors.body_text && (
              <p className="text-xs text-rose-500 font-medium">{errors.body_text.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Footer Text (Optional)
            </Label>
            <Input
              {...register("footer_text")}
              placeholder="e.g. Reply STOP to opt out"
              className="text-xs"
            />
          </div>

          {/* Interactive Buttons Builder */}
          <div className="space-y-2 pt-2 border-t border-border/80">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">
                Interactive Buttons (Max 3)
              </Label>
              {fields.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      type: "QUICK_REPLY",
                      text: "Confirm",
                      url: "",
                      phone_number: "",
                    })
                  }
                  className="h-7 text-xs gap-1 text-primary"
                >
                  <Plus className="size-3.5" />
                  Add Button
                </Button>
              )}
            </div>

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="p-3 bg-muted/20 border border-border/80 rounded-lg space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-muted-foreground">Button {idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Button Type</Label>
                    <select
                      {...register(`buttons.${idx}.type` as const)}
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="QUICK_REPLY">Quick Reply</option>
                      <option value="URL">Website Link</option>
                      <option value="PHONE_NUMBER">Phone Call</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Button Label</Label>
                    <Input
                      {...register(`buttons.${idx}.text` as const)}
                      placeholder="e.g. Track Order"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                {watchedValues.buttons?.[idx]?.type === "URL" && (
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Website URL</Label>
                    <Input
                      {...register(`buttons.${idx}.url` as const)}
                      placeholder="https://example.com/track"
                      className="h-8 text-xs"
                    />
                  </div>
                )}
                {watchedValues.buttons?.[idx]?.type === "PHONE_NUMBER" && (
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Phone Number (E.164)</Label>
                    <Input
                      {...register(`buttons.${idx}.phone_number` as const)}
                      placeholder="+1234567890"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="lg:col-span-5 space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Live Preview
          </Label>
          <div className="rounded-xl border border-border bg-emerald-950/5 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="bg-card rounded-xl rounded-tl-sm p-3.5 shadow-xs border border-border/80 space-y-2 text-xs">
              {watchedValues.header_text && (
                <p className="font-bold text-sm text-foreground">
                  {watchedValues.header_text}
                </p>
              )}
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {watchedValues.body_text || "Message body will render here..."}
              </p>
              {watchedValues.footer_text && (
                <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-1">
                  {watchedValues.footer_text}
                </p>
              )}
              {watchedValues.buttons && watchedValues.buttons.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1.5">
                  {watchedValues.buttons.map((btn, i) => (
                    <div
                      key={i}
                      className="w-full py-1.5 px-3 rounded-lg bg-muted/30 text-primary border border-border/60 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      {btn?.type === "QUICK_REPLY" && <CornerDownLeft className="size-3" />}
                      {btn?.type === "URL" && <ExternalLink className="size-3" />}
                      {btn?.type === "PHONE_NUMBER" && <Phone className="size-3" />}
                      <span>{btn?.text || `Button ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-2.5 bg-background/80 rounded-lg border border-border/60 text-[11px] text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground">Meta Approval Time:</span>
              <p>Meta automated review usually completes within 5-15 minutes for marketing and utility categories.</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={createMutation.isPending}
          className="gap-1.5 font-semibold"
        >
          {createMutation.isPending ? "Submitting to Meta..." : "Submit to Meta"}
        </Button>
      </DialogFooter>
    </form>
  );
}

