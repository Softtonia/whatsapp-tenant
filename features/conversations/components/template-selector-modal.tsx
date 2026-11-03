"use client";

import { useState } from "react";
import { useApprovedTemplatesQuery } from "../hooks";
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
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Send, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import type { WhatsAppTemplate } from "@/types/whatsapp";

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTemplate: (payload: {
    template_name: string;
    language: string;
    body_text: string;
    variables: Record<string, string>;
  }) => void;
  isSending?: boolean;
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  onSendTemplate,
  isSending = false,
}: TemplateSelectorModalProps) {
  const { data: templates = [], isLoading, isError } = useApprovedTemplatesQuery();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const activeTemplate = selectedTemplate || templates[0] || null;

  const handleSelect = (tmpl: WhatsAppTemplate) => {
    setSelectedTemplate(tmpl);
    const initialVars: Record<string, string> = {};
    if (tmpl.example_variables) {
      tmpl.example_variables.forEach((_, idx) => {
        initialVars[String(idx + 1)] = "";
      });
    }
    setVariables(initialVars);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }));
  };

  const getPreviewText = () => {
    if (!activeTemplate) return "";
    let text = activeTemplate.body_text;
    Object.entries(variables).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v || `[${k}]`);
    });
    return text;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate) return;

    onSendTemplate({
      template_name: activeTemplate.name,
      language: activeTemplate.language,
      body_text: getPreviewText(),
      variables,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Select Approved Meta Template</DialogTitle>
              <DialogDescription className="text-xs">
                Meta requires pre-approved templates to initiate or re-engage 24h conversation windows.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : isError || templates.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                <AlertCircle className="size-6 text-amber-500 mx-auto" />
                <p>No approved Meta templates found for this WhatsApp account.</p>
                <p className="text-[11px]">
                  Submit new templates in the Meta Templates library to enable customer re-engagement.
                </p>
              </div>
            ) : (
              <>
                {/* Template Selection Tabs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Available Templates ({templates.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map((tmpl) => {
                      const isSelected = activeTemplate?.id === tmpl.id;
                      return (
                        <button
                          type="button"
                          key={tmpl.id}
                          onClick={() => handleSelect(tmpl)}
                          className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">
                              {tmpl.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="secondary" className="text-[9px] py-0 px-1 font-mono">
                                {tmpl.category}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{tmpl.language}</span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0 ml-1 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Template Variables Inputs */}
                {activeTemplate && activeTemplate.example_variables && activeTemplate.example_variables.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <label className="text-xs font-semibold text-foreground">
                      Template Variables
                    </label>
                    <div className="space-y-2">
                      {activeTemplate.example_variables.map((label, idx) => {
                        const varKey = String(idx + 1);
                        return (
                          <div key={varKey} className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">
                              {"{{" + varKey + "}}"}
                            </span>
                            <Input
                              placeholder={`Value for ${label}`}
                              value={variables[varKey] || ""}
                              onChange={(e) => handleVariableChange(varKey, e.target.value)}
                              className="h-8 text-xs flex-1"
                              required
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Live Message Bubble Preview */}
                {activeTemplate && (
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 text-primary" />
                      Live WhatsApp Preview
                    </label>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2 max-w-md">
                      <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans">
                        {getPreviewText()}
                      </p>
                      {activeTemplate.buttons && (
                        <div className="pt-2 border-t border-emerald-500/10 space-y-1">
                          {activeTemplate.buttons.map((btn, i) => (
                            <div
                              key={i}
                              className="text-center text-xs font-semibold text-primary py-1 px-2 rounded-lg bg-background border border-emerald-500/20 shadow-xs"
                            >
                              {btn.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/80 flex justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!activeTemplate || isSending || templates.length === 0}
              className="gap-1.5 font-semibold"
            >
              <Send className="size-3.5" />
              <span>{isSending ? "Sending Template..." : "Send Template Message"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

