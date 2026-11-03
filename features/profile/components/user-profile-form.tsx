"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Save, CheckCircle2, Shield } from "lucide-react";
import { userProfileSchema, type UserProfileFormData } from "@/features/settings/schemas";
import { useUpdateUserProfileMutation } from "@/features/settings/hooks";
import type { User } from "@/types/user";

interface UserProfileFormProps {
  user: User | null;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  return <UserProfileInnerForm key={user?.email || "guest"} user={user} />;
}

function UserProfileInnerForm({ user }: { user: User | null }) {
  const [successFeedback, setSuccessFeedback] = React.useState(false);
  const updateMutation = useUpdateUserProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: UserProfileFormData) => {
    await updateMutation.mutateAsync(data);
    setSuccessFeedback(true);
    setTimeout(() => setSuccessFeedback(false), 4000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs">
                  Your identity across conversations, internal notes, and team assignment
                </CardDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold uppercase tracking-wider gap-1"
            >
              <Shield className="size-3" />
              {user?.role || "Agent"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Full Name *
              </Label>
              <Input
                {...register("name")}
                placeholder="Your full name"
                className="text-xs"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Email Address *
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="you@company.com"
                className="text-xs"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Direct Phone / WhatsApp Contact
            </Label>
            <Input
              {...register("phone")}
              placeholder="+91 98111 22334"
              className="text-xs font-mono"
            />
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/60 py-3 px-4 sm:px-5 flex items-center justify-between">
          <div>
            {successFeedback && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="size-4" />
                Profile updated successfully
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
            {updateMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

