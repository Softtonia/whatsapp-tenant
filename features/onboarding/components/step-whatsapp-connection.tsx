"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { whatsappConnectionSchema, type WhatsAppConnectionFormData } from "../schemas";
import { useSaveWhatsAppConnectionMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface StepWhatsAppConnectionProps {
  initialData?: Partial<WhatsAppConnectionFormData>;
  onSuccess: (data: WhatsAppConnectionFormData) => void;
  onBack: () => void;
}

export function StepWhatsAppConnection({
  initialData,
  onSuccess,
  onBack,
}: StepWhatsAppConnectionProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const saveMutation = useSaveWhatsAppConnectionMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WhatsAppConnectionFormData>({
    resolver: zodResolver(whatsappConnectionSchema),
    defaultValues: {
      defer_whatsapp: initialData?.defer_whatsapp || false,
      phone_number: initialData?.phone_number || "+91 98765 43210",
      waba_id: initialData?.waba_id || "waba_109823485723948",
    },
  });

  const isDeferred = useWatch({ control, name: "defer_whatsapp" });

  const onSubmit = async (data: WhatsAppConnectionFormData) => {
    setServerError(null);
    try {
      await saveMutation.mutateAsync(data);
      onSuccess(data);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const isPending = isSubmitting || saveMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="size-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Official WhatsApp Cloud API</h4>
            <p className="text-[11px] text-muted-foreground">
              Powered by Meta Cloud API infrastructure with 99.9% uptime SLA.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/80 hover:bg-muted/30 cursor-pointer transition-colors">
          <input
            type="checkbox"
            {...register("defer_whatsapp")}
            disabled={isPending}
            className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary"
          />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">
              Skip WhatsApp connection for now
            </span>
            <span className="text-muted-foreground text-[11px]">
              You can connect your Meta WhatsApp Business account later from the Workspace Settings or Connections tab.
            </span>
          </div>
        </label>
      </div>

      {!isDeferred && (
        <div className="space-y-4 pt-1 animate-in fade-in-0 duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              WhatsApp Business Phone Number <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="+91 98765 43210 (with country code)"
              {...register("phone_number")}
              disabled={isPending}
              className={errors.phone_number ? "border-destructive" : ""}
            />
            {errors.phone_number && (
              <p className="text-xs text-destructive">{errors.phone_number.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Must be a valid number not currently registered with regular WhatsApp mobile app.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-muted-foreground" />
              WhatsApp Business Account ID (WABA ID)
            </label>
            <Input
              placeholder="e.g. waba_109823485723948"
              {...register("waba_id")}
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Found inside your Meta Business Manager WhatsApp Accounts dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Webhook endpoints and verification token are automatically generated for your tenant.</span>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <Button type="submit" size="sm" disabled={isPending} className="gap-2 font-semibold">
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving WhatsApp details...
            </>
          ) : (
            <>
              Continue to Team Members
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
