"use client";

import { useState } from "react";
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
import { contactSchema, type ContactFormData } from "../schemas";
import { useCreateContactMutation, useUpdateContactMutation } from "../hooks";
import type { Contact } from "@/types/contact";
import { User, Phone, Mail, Building, Tag, Loader2 } from "lucide-react";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactToEdit?: Contact | null;
}

interface FormContentProps {
  contactToEdit?: Contact | null;
  onClose: () => void;
}

function ContactFormContent({ contactToEdit, onClose }: FormContentProps) {
  const isEditing = Boolean(contactToEdit);
  const createMutation = useCreateContactMutation();
  const updateMutation = useUpdateContactMutation(contactToEdit?.id);

  const [tags, setTags] = useState<string[]>(contactToEdit?.tags || []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema) as never,
    defaultValues: {
      name: contactToEdit?.name || "",
      phone: contactToEdit?.phone || "",
      email: contactToEdit?.email || "",
      company: contactToEdit?.company || "",
      source: contactToEdit?.source || "Manual Entry",
      tags: contactToEdit?.tags || [],
    },
  });

  const handleAddTag = (tagInput: string) => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    setTags(next);
    setValue("tags", next);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const next = tags.filter((t) => t !== tagToRemove);
    setTags(next);
    setValue("tags", next);
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      if (isEditing && contactToEdit) {
        await updateMutation.mutateAsync({
          id: contactToEdit.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-foreground">
          {isEditing ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {isEditing
            ? "Update verified customer information and WhatsApp routing tags."
            : "Register a new subscriber or lead for WhatsApp messaging campaigns and support."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="size-3.5 text-muted-foreground" />
            Full Name *
          </label>
          <Input
            {...register("name")}
            placeholder="e.g. Aarav Sharma"
            className="h-9 text-xs"
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* WhatsApp Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted-foreground" />
            WhatsApp Phone Number *
          </label>
          <Input
            {...register("phone")}
            placeholder="e.g. +919876543210 (with country code)"
            className="h-9 text-xs"
          />
          {errors.phone && (
            <p className="text-[11px] text-destructive">{errors.phone.message}</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Include country code without spaces or dashes for Meta Cloud API compatibility.
          </p>
        </div>

        {/* Email & Company (Two-Column) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              Email Address
            </label>
            <Input
              {...register("email")}
              placeholder="aarav@example.com"
              className="h-9 text-xs"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building className="size-3.5 text-muted-foreground" />
              Company
            </label>
            <Input
              {...register("company")}
              placeholder="Acme Corp"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Lead Source */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Lead / Acquisition Source
          </label>
          <Input
            {...register("source")}
            placeholder="e.g. Website Widget, Meta Ad, Referral"
            className="h-9 text-xs"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="size-3.5 text-muted-foreground" />
            Audience Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[11px] font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive transition-colors ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            placeholder="Type a tag and press Enter"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
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
            <span>{isEditing ? "Save Changes" : "Create Contact"}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function ContactFormModal({
  isOpen,
  onClose,
  contactToEdit,
}: ContactFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <ContactFormContent
          key={contactToEdit?.id ?? "new"}
          contactToEdit={contactToEdit}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
