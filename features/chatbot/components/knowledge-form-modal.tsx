"use client";

import * as React from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen } from "lucide-react";
import { knowledgeItemSchema, type KnowledgeItemFormData } from "../schemas";
import { useCreateAiKnowledgeMutation, useUpdateAiKnowledgeMutation } from "../hooks";
import type { AiKnowledgeItem } from "@/types/chatbot";

interface KnowledgeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: AiKnowledgeItem | null;
  onSuccess?: () => void;
}

export function KnowledgeFormModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: KnowledgeFormModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <KnowledgeInnerForm
          key={item?.id ?? "new"}
          item={item}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

function KnowledgeInnerForm({
  item,
  onClose,
  onSuccess,
}: {
  item?: AiKnowledgeItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const isEditing = Boolean(item?.id);
  const createMutation = useCreateAiKnowledgeMutation();
  const updateMutation = useUpdateAiKnowledgeMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [keywordsText, setKeywordsText] = React.useState(
    (item?.keywords || []).join(", ")
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KnowledgeItemFormData>({
    resolver: zodResolver(knowledgeItemSchema),
    defaultValues: {
      question: item?.question || "",
      answer: item?.answer || "",
      keywords: item?.keywords || [],
      is_active: item?.is_active ?? true,
    },
  });

  const onSubmit = async (data: KnowledgeItemFormData) => {
    try {
      setErrorMessage(null);
      const parsedKeywords = keywordsText
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        ...data,
        keywords: parsedKeywords,
      };

      if (isEditing && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save knowledge item");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-foreground">
              {isEditing ? "Edit Knowledge Item" : "Add Knowledge Base Entry"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Teach the AI assistant about company policies, FAQs, pricing, or product specs.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-600">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Customer Question or Inquired Topic *
          </Label>
          <Input
            {...register("question")}
            placeholder="e.g. What are your delivery timelines?"
            className="text-xs"
          />
          {errors.question && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.question.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Official Verified Answer *
          </Label>
          <Textarea
            {...register("answer")}
            rows={4}
            placeholder="Provide exact response details. The AI will cite and synthesize this answer."
            className="text-xs leading-relaxed"
          />
          {errors.answer && (
            <p className="text-xs text-rose-500 font-medium">{errors.answer.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-foreground">
            Associated Keywords & Synonyms
          </Label>
          <Input
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="e.g. delivery, shipping, dispatch, days, transit"
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Comma-separated tags for embedding vector matching.
          </p>
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              {...register("is_active")}
              className="size-4 rounded border-input text-primary"
            />
            <span className="font-semibold text-foreground">
              Active in AI knowledge retrieval
            </span>
          </label>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending}
          className="gap-1.5 font-semibold text-xs"
        >
          {isPending ? "Saving..." : isEditing ? "Update Entry" : "Save Entry"}
        </Button>
      </DialogFooter>
    </form>
  );
}

