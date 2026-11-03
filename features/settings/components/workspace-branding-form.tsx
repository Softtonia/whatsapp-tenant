"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, CheckCircle2 } from "lucide-react";
import { workspaceBrandingSchema, type WorkspaceBrandingFormData } from "../schemas";
import { useUpdateWorkspaceBrandingMutation } from "../hooks";
import type { WorkspaceBranding } from "@/types/settings";

interface WorkspaceBrandingFormProps {
  branding?: WorkspaceBranding;
  isLoading?: boolean;
}

export function WorkspaceBrandingForm({
  branding,
  isLoading,
}: WorkspaceBrandingFormProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted/40 w-48 rounded" />
          <div className="h-28 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <BrandingInnerForm
      key={branding?.brand_name || "default"}
      branding={branding}
    />
  );
}

function BrandingInnerForm({
  branding,
}: {
  branding?: WorkspaceBranding;
}) {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const updateMutation = useUpdateWorkspaceBrandingMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<WorkspaceBrandingFormData>({
    resolver: zodResolver(workspaceBrandingSchema),
    defaultValues: {
      brand_name: branding?.brand_name || "Softtonia Solutions",
      primary_color: branding?.primary_color || "#10b981",
      secondary_color: branding?.secondary_color || "#047857",
      support_email: branding?.support_email || "support@softtonia.com",
    },
  });

  const primaryColor = watch("primary_color");
  const secondaryColor = watch("secondary_color");

  const onSubmit = async (data: WorkspaceBrandingFormData) => {
    await updateMutation.mutateAsync(data);
    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Palette className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Workspace Branding &amp; Colors
              </CardTitle>
              <CardDescription className="text-xs">
                Customize your tenant CRM portal brand name, theme accent colors, and support contacts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Display Brand Name *
              </Label>
              <Input
                {...register("brand_name")}
                placeholder="e.g. Acme Express"
                className="text-xs"
              />
              {errors.brand_name && (
                <p className="text-xs text-rose-500 font-medium">{errors.brand_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Customer Facing Support Email *
              </Label>
              <Input
                type="email"
                {...register("support_email")}
                placeholder="help@acme.com"
                className="text-xs"
              />
              {errors.support_email && (
                <p className="text-xs text-rose-500 font-medium">{errors.support_email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Primary Brand Color (Hex)
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className="size-8 rounded-lg border border-border shrink-0 shadow-xs"
                  style={{ backgroundColor: primaryColor || "#10b981" }}
                />
                <Input
                  {...register("primary_color")}
                  placeholder="#10b981"
                  className="text-xs font-mono"
                />
              </div>
              {errors.primary_color && (
                <p className="text-xs text-rose-500 font-medium">{errors.primary_color.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Secondary Brand Color (Hex)
              </Label>
              <div className="flex items-center gap-2">
                <div
                  className="size-8 rounded-lg border border-border shrink-0 shadow-xs"
                  style={{ backgroundColor: secondaryColor || "#047857" }}
                />
                <Input
                  {...register("secondary_color")}
                  placeholder="#047857"
                  className="text-xs font-mono"
                />
              </div>
              {errors.secondary_color && (
                <p className="text-xs text-rose-500 font-medium">{errors.secondary_color.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Branding updated
              </span>
            )}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={updateMutation.isPending || !isDirty}
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Save className="size-3.5" />
            {updateMutation.isPending ? "Saving..." : "Save Branding"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

