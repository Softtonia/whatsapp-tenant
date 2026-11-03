"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamInvitationsSchema, type TeamInvitationsFormData } from "../schemas";
import { useSaveTeamInvitationsMutation } from "../hooks";
import { getErrorMessage } from "@/src/lib/api/errors";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Plus, Trash2, ArrowRight, ArrowLeft, AlertCircle, Loader2, Users } from "lucide-react";
import { useState } from "react";

interface StepTeamInvitationsProps {
  initialData?: Partial<TeamInvitationsFormData>;
  onSuccess: (data: TeamInvitationsFormData) => void;
  onBack: () => void;
}

export function StepTeamInvitations({
  initialData,
  onSuccess,
  onBack,
}: StepTeamInvitationsProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const saveMutation = useSaveTeamInvitationsMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeamInvitationsFormData>({
    resolver: zodResolver(teamInvitationsSchema),
    defaultValues: {
      invitees: initialData?.invitees && initialData.invitees.length > 0
        ? initialData.invitees
        : [
            { email: "support.agent@company.com", role: "agent" },
            { email: "operations.lead@company.com", role: "admin" },
          ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invitees",
  });

  const onSubmit = async (data: TeamInvitationsFormData) => {
    setServerError(null);
    try {
      await saveMutation.mutateAsync(data);
      onSuccess(data);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  };

  const handleSkip = async () => {
    try {
      await saveMutation.mutateAsync({ invitees: [] });
      onSuccess({ invitees: [] });
    } catch {
      onSuccess({ invitees: [] });
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

      <div className="flex items-center justify-between pb-1">
        <div>
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            Invite Teammates & Inbox Agents
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Invited members will receive a workspace activation link via email.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ email: "", role: "agent" })}
          disabled={isPending}
          className="text-xs gap-1 h-8"
        >
          <Plus className="size-3.5" />
          Add Member
        </Button>
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {fields.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground">
            No team members added yet. Click &quot;Add Member&quot; or skip to continue as solo administrator.
          </div>
        ) : (
          fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/70"
            >
              <div className="flex-1">
                <div className="relative">
                  <Mail className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="teammate@company.com"
                    {...register(`invitees.${idx}.email` as const)}
                    disabled={isPending}
                    className="pl-8 text-xs h-8"
                  />
                </div>
                {errors.invitees?.[idx]?.email && (
                  <p className="text-[10px] text-destructive mt-0.5 ml-1">
                    {errors.invitees[idx]?.email?.message}
                  </p>
                )}
              </div>

              <div className="w-28">
                <select
                  {...register(`invitees.${idx}.role` as const)}
                  disabled={isPending}
                  className="flex h-8 w-full rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:border-ring"
                >
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(idx)}
                disabled={isPending}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                aria-label="Remove member"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border/60">
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>

          <Button type="submit" size="sm" disabled={isPending} className="gap-2 font-semibold">
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Sending Invites...
              </>
            ) : (
              <>
                Review & Launch
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

