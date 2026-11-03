"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { reauthSchema, type ReauthFormData } from "@/features/auth/schemas";
import { loginUser } from "@/features/auth/api";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
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
import { Lock, AlertCircle, LogOut, RefreshCw } from "lucide-react";

export function ReauthDialog() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isSessionExpired = useAuthStore((s) => s.isSessionExpired);
  const user = useAuthStore((s) => s.user);
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired);
  const logout = useAuthStore((s) => s.logout);

  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReauthFormData>({
    resolver: zodResolver(reauthSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = async (data: ReauthFormData) => {
    setServerError(null);
    setIsPending(true);
    try {
      const email = user?.email || "vijay.kumar@softtonia.com";
      const response = await loginUser({
        email,
        password: data.password,
      });

      const token = response.token || response.access_token;
      if (token) {
        setCredentials(token, response.user || user || {
          id: 1,
          name: "User",
          email,
          role: "admin",
        });
        reset();
        // Invalidate active queries so requests retry seamlessly
        queryClient.invalidateQueries();
      } else {
        throw new Error("Unable to re-authenticate. Please log in again.");
      }
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  const handleFullLogout = () => {
    setSessionExpired(false);
    logout();
    queryClient.clear();
    router.push("/login");
  };

  if (!isSessionExpired) {
    return null;
  }

  return (
    <Dialog open={isSessionExpired} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lock className="size-5" />
            <DialogTitle className="text-lg font-bold">Session Expired</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Your session has expired. Re-enter your password for{" "}
            <span className="font-semibold text-foreground">
              {user?.email || "your workspace account"}
            </span>{" "}
            to continue without losing current form inputs or data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Account Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              autoFocus
              {...register("password")}
              disabled={isPending}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFullLogout}
              disabled={isPending}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              Sign out instead
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5 font-semibold"
            >
              {isPending ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Restore Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

