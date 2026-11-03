import Link from "next/link";
import { MessageSquare, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-xs">
        <MessageSquare className="size-7" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
          404 &bull; Page Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Lost in Conversation?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The requested page, conversation thread, or workspace resource could not be found or has been moved.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button size="sm" className="gap-2 h-9 text-xs font-semibold shadow-xs">
            <Home className="size-4" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
        <Link href="/chats">
          <Button variant="outline" size="sm" className="gap-2 h-9 text-xs font-semibold">
            <Search className="size-4" />
            <span>Search Shared Inbox</span>
          </Button>
        </Link>
      </div>

      <div className="mt-12 text-[11px] text-muted-foreground font-mono">
        WhatsApp CRM &bull; Multi-Tenant Enterprise Platform
      </div>
    </div>
  );
}
