"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Save,
} from "lucide-react";
import { botConfigSchema, type BotConfigFormData } from "../schemas";
import { useUpdateAiConfigMutation } from "../hooks";
import type { AiBotConfig } from "@/types/chatbot";

interface BotConfigCardProps {
  config?: AiBotConfig;
  isLoading?: boolean;
}

export function BotConfigCard({ config, isLoading }: BotConfigCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80">
        <CardContent className="p-8 text-center animate-pulse space-y-4">
          <div className="size-10 bg-muted/40 rounded-full mx-auto" />
          <div className="h-4 bg-muted/40 w-48 mx-auto rounded" />
          <div className="h-20 bg-muted/30 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <BotConfigInnerForm
      key={config?.updated_at || config?.is_enabled ? "loaded" : "defaults"}
      config={config}
    />
  );
}

function BotConfigInnerForm({ config }: { config?: AiBotConfig }) {
  const updateMutation = useUpdateAiConfigMutation();
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const [keywordsInput, setKeywordsInput] = React.useState(
    (config?.handoff_keywords || ["human", "agent", "support", "representative"]).join(", ")
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BotConfigFormData>({
    resolver: zodResolver(botConfigSchema),
    defaultValues: {
      is_enabled: config?.is_enabled ?? true,
      provider: config?.provider ?? "gemini-2.5-flash",
      system_prompt:
        config?.system_prompt ??
        "You are the official AI WhatsApp assistant for our business. Answer inquiries politely, accurately, and concisely based only on verified knowledge base items. If unsure or if the customer requests human help, politely hand off.",
      temperature: config?.temperature ?? 0.2,
      confidence_threshold: config?.confidence_threshold ?? 0.7,
      handoff_keywords: config?.handoff_keywords ?? ["human", "agent", "support"],
      fallback_message:
        config?.fallback_message ??
        "I'm not completely sure about that. Let me connect you with one of our human team members right away!",
      business_hours_only: config?.business_hours_only ?? false,
      reply_delay_seconds: config?.reply_delay_seconds ?? 2,
    },
  });

  const isEnabled = watch("is_enabled");
  const temperature = watch("temperature");
  const confidence = watch("confidence_threshold");

  const onSubmit = async (data: BotConfigFormData) => {
    // Parse keywords from comma-separated input
    const parsedKeywords = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    await updateMutation.mutateAsync({
      ...data,
      handoff_keywords: parsedKeywords,
    });

    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  AI WhatsApp Assistant Configuration
                  {isEnabled ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Paused
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure automated conversational intelligence, LLM model choice, and guardrails
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("is_enabled")}
                  className="size-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-foreground">
                  Enable AI Auto-Reply
                </span>
              </label>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* AI Model Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Language Model Provider
              </Label>
              <select
                {...register("provider")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
              >
                <option value="gemini-2.5-flash">
                  Google Gemini 2.5 Flash (Ultra-fast, Recommended)
                </option>
                <option value="gemini-1.5-pro">
                  Google Gemini 1.5 Pro (Deep Reasoning & Nuance)
                </option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Optimized for low WhatsApp round-trip latency (&lt;800ms response time).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Human-Like Typing Delay (Seconds)
              </Label>
              <Input
                type="number"
                min={0}
                max={30}
                {...register("reply_delay_seconds", { valueAsNumber: true })}
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Simulates natural typing indicator on WhatsApp before sending response.
              </p>
            </div>
          </div>

          {/* System Instructions Prompt */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Master System Prompt & Persona
            </Label>
            <Textarea
              {...register("system_prompt")}
              rows={4}
              placeholder="Define tone, behavioral rules, policies, and response style..."
              className="text-xs leading-relaxed"
            />
            {errors.system_prompt && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.system_prompt.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Define your brand voice. The AI uses this context alongside your Knowledge Base to craft answers.
            </p>
          </div>

          {/* Model Temperature and Confidence Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-muted/20 border border-border/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-primary" />
                  Temperature (Creativity)
                </Label>
                <span className="font-mono text-primary font-bold">
                  {Number(temperature).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setValue("temperature", parseFloat(e.target.value), { shouldDirty: true })}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0.0 (Factual & Deterministic)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <Label className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-amber-500" />
                  Confidence Threshold
                </Label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {(Number(confidence) * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={confidence}
                onChange={(e) => setValue("confidence_threshold", parseFloat(e.target.value), { shouldDirty: true })}
                className="w-full accent-amber-500 h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>30% (Permissive)</span>
                <span>95% (Strict verification)</span>
              </div>
            </div>
          </div>

          {/* Fallback & Handoff Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Fallback Message (Low Confidence)
              </Label>
              <Textarea
                {...register("fallback_message")}
                rows={3}
                placeholder="What to reply when confidence is below threshold..."
                className="text-xs leading-relaxed"
              />
              {errors.fallback_message && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.fallback_message.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Human Handoff Trigger Keywords
              </Label>
              <Input
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="e.g. human, agent, representative, operator"
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Comma-separated keywords. When detected, the bot pauses and transfers conversation to an inbox agent.
              </p>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    {...register("business_hours_only")}
                    className="size-3.5 rounded border-input text-primary"
                  />
                  <span className="text-muted-foreground">
                    Only activate AI during off-business hours
                  </span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                AI configuration saved successfully
              </span>
            )}
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={updateMutation.isPending || (!isDirty && keywordsInput === (config?.handoff_keywords || []).join(", "))}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Save className="size-3.5" />
            {updateMutation.isPending ? "Saving..." : "Save AI Settings"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

