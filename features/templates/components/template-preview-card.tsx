"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ExternalLink,
  Phone,
  CornerDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode2,
  Sparkles,
} from "lucide-react";
import type { MetaTemplate } from "@/types/template";
import { cn } from "@/lib/utils";

interface TemplatePreviewCardProps {
  template: MetaTemplate;
  className?: string;
  showVariableInputs?: boolean;
}

export function TemplatePreviewCard({
  template,
  className,
  showVariableInputs = true,
}: TemplatePreviewCardProps) {
  const headerComponent = template.components?.find((c) => c.type === "HEADER");
  const bodyComponent = template.components?.find((c) => c.type === "BODY");
  const footerComponent = template.components?.find((c) => c.type === "FOOTER");
  const buttonsComponent = template.components?.find((c) => c.type === "BUTTONS");

  // Extract variables like {{1}}, {{2}} from body text
  const bodyText = bodyComponent?.text || template.body_text || "";
  const variableMatches = React.useMemo(() => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  }, [bodyText]);

  // State for interactive test values
  const [variableValues, setVariableValues] = React.useState<Record<string, string>>({});

  const handleVariableChange = (varKey: string, val: string) => {
    setVariableValues((prev) => ({ ...prev, [varKey]: val }));
  };

  // Render processed body text
  const renderedBodyText = React.useMemo(() => {
    let text = bodyText;
    variableMatches.forEach((match) => {
      const varIndex = match.replace(/[{}]/g, "");
      const replacement = variableValues[match] || variableValues[varIndex];
      if (replacement) {
        text = text.replace(new RegExp(match, "g"), replacement);
      }
    });
    return text;
  }, [bodyText, variableMatches, variableValues]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold gap-1 text-[11px]">
            <CheckCircle2 className="size-3" />
            Approved by Meta
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold gap-1 text-[11px]">
            <Clock className="size-3 animate-spin" />
            Meta Review Pending
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
          <Badge variant="outline" className="font-semibold text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    return (
      <Badge variant="secondary" className="font-medium text-[11px]">
        {cat}
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Template Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 font-mono">
              <FileCode2 className="size-4 text-primary" />
              {template.name}
            </h4>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              ({template.language})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Category: {template.category} • ID: {template.id}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getCategoryBadge(template.category)}
          {getStatusBadge(template.status)}
        </div>
      </div>

      {/* Rejection Alert if applicable */}
      {template.status === "REJECTED" && template.rejection_reason && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs space-y-1 text-rose-600 dark:text-rose-400">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            Meta Rejection Reason:
          </p>
          <p className="leading-relaxed pl-5.5">{template.rejection_reason}</p>
        </div>
      )}

      {/* WhatsApp Chat Bubble Simulation */}
      <div className="rounded-xl border border-border bg-emerald-950/5 dark:bg-emerald-950/20 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            WhatsApp Client Preview
          </span>
          <span className="text-[11px] font-mono">Today, 10:45 AM</span>
        </div>

        {/* The Message Bubble */}
        <div className="max-w-[420px] bg-card rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-border/80 space-y-2.5">
          {/* Header Component */}
          {headerComponent?.text && (
            <p className="font-bold text-sm text-foreground leading-snug">
              {headerComponent.text}
            </p>
          )}

          {/* Body Component */}
          <div className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {showVariableInputs && Object.keys(variableValues).length > 0
              ? renderedBodyText
              : bodyText.split(/(\{\{\d+\}\})/).map((part, idx) => {
                  if (part.match(/^\{\{\d+\}\}$/)) {
                    return (
                      <span
                        key={idx}
                        className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-bold"
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
          </div>

          {/* Footer Component */}
          {footerComponent?.text && (
            <p className="text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
              {footerComponent.text}
            </p>
          )}

          {/* Quick Reply & CTA Buttons */}
          {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
            <div className="pt-2 border-t border-border/60 space-y-1.5">
              {buttonsComponent.buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="w-full py-1.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 text-primary border border-border/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-default"
                >
                  {btn.type === "QUICK_REPLY" && <CornerDownLeft className="size-3.5" />}
                  {btn.type === "URL" && <ExternalLink className="size-3.5" />}
                  {btn.type === "PHONE_NUMBER" && <Phone className="size-3.5" />}
                  <span>{btn.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Variable Replacement Inputs */}
      {showVariableInputs && variableMatches.length > 0 && (
        <div className="p-3.5 bg-muted/20 border border-border/80 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            <span>Test Variable Values ({variableMatches.length} detected)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variableMatches.map((varKey) => {
              return (
                <div key={varKey} className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground font-mono">
                    Variable {varKey}
                  </Label>
                  <Input
                    size={1}
                    placeholder={`e.g. John Doe or Order #123`}
                    value={variableValues[varKey] || ""}
                    onChange={(e) => handleVariableChange(varKey, e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
