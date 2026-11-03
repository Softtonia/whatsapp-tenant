"use client";

import Link from "next/link";
import { MessageSquare, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-foreground">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <MessageSquare className="size-4" />
          </div>
          <span>WhatsApp CRM</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <UserNav />
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border/60 py-4 px-6 text-center text-[11px] text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Shield className="size-3.5 text-primary" />
          Enterprise Multi-Tenant WhatsApp Cloud API Integration
        </span>
        <span>All data secured with 256-bit encryption</span>
      </footer>
    </div>
  );
}

