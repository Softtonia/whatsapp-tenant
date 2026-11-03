"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, CheckCircle2 } from "lucide-react";
import { businessProfileSchema, type BusinessProfileFormData } from "../schemas";
import { useUpdateBusinessProfileMutation } from "../hooks";
import type { BusinessProfile } from "@/types/settings";

interface BusinessProfileFormProps {
  profile?: BusinessProfile;
  isLoading?: boolean;
}

export function BusinessProfileForm({ profile, isLoading }: BusinessProfileFormProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted/40 w-48 rounded" />
          <div className="h-24 bg-muted/30 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return <BusinessProfileInnerForm key={profile?.name || "new"} profile={profile} />;
}

function BusinessProfileInnerForm({ profile }: { profile?: BusinessProfile }) {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const updateMutation = useUpdateBusinessProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      country: profile?.country || "India",
      currency: profile?.currency || "USD",
    },
  });

  const onSubmit = async (data: BusinessProfileFormData) => {
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
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Business &amp; Company Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Official business identity, customer support contact info, and invoicing location
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Legal Business / Company Name *
              </Label>
              <Input
                {...register("name")}
                placeholder="e.g. Acme Logistics Corp"
                className="text-xs"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Official Support Email *
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="support@company.com"
                className="text-xs"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Business Phone Number
              </Label>
              <Input
                {...register("phone")}
                placeholder="+1 555-0199"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Country
              </Label>
              <Input
                {...register("country")}
                placeholder="e.g. United States or India"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Physical / Invoicing Address
            </Label>
            <Input
              {...register("address")}
              placeholder="Suite, Street, City, State, Postal Code"
              className="text-xs"
            />
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Business profile updated
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
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

