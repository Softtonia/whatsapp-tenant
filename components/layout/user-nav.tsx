"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { useLogoutMutation } from "@/features/auth/hooks";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Shield } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const logoutMutation = useLogoutMutation();

  if (!isAuthenticated && !user) {
    return (
      <Link href="/login">
        <Button size="sm" variant="outline" className="text-xs h-8">
          Sign In
        </Button>
      </Link>
    );
  }

  const displayName = user?.name || "Vijay Kumar";
  const displayEmail = user?.email || "vijay.kumar@softtonia.com";
  const displayRole = user?.role || "admin";

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-2 hover:bg-muted/80 rounded-lg"
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold leading-tight text-foreground">{displayName}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{displayRole}</span>
        </div>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-lg z-50 text-foreground animate-in fade-in-0 zoom-in-95">
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-xs font-semibold leading-none text-foreground">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">{displayEmail}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <Shield className="size-3" />
                Role: {displayRole}
              </div>
            </div>
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
              >
                <UserIcon className="size-3.5" />
                Profile & Workspace
              </Link>
            </div>
            <div className="border-t border-border/60 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  logoutMutation.mutate(undefined, {
                    onSettled: () => {
                      router.push("/login");
                    },
                  });
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
