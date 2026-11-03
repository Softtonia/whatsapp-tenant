"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Campaign, CampaignStatus } from "@/types/campaign";
import {
  useCampaignsQuery,
  useDispatchCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useCancelCampaignMutation,
} from "../hooks";
import {
  Search,
  MoreHorizontal,
  BarChart3,
  Play,
  Pause,
  XCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";

interface CampaignsTableProps {
  onViewAnalytics: (campaign: Campaign) => void;
}

const STATUS_BADGES: Record<
  CampaignStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  running: { label: "Running", variant: "default" },
  scheduled: { label: "Scheduled", variant: "outline" },
  completed: { label: "Completed", variant: "secondary" },
  draft: { label: "Draft", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  failed: { label: "Failed", variant: "destructive" },
};

export function CampaignsTable({ onViewAnalytics }: CampaignsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: campaignsData, isLoading } = useCampaignsQuery({
    search: search.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    per_page: 20,
  });

  const dispatchMutation = useDispatchCampaignMutation();
  const pauseMutation = usePauseCampaignMutation();
  const resumeMutation = useResumeCampaignMutation();
  const cancelMutation = useCancelCampaignMutation();

  const campaigns = campaignsData?.data || [];
  const meta = campaignsData?.meta;

  return (
    <div className="space-y-4">
      {/* Search and Status Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search campaigns by name or template..."
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border border-border/80 bg-muted/20 p-1 rounded-lg text-xs font-semibold">
          {[
            { id: "all", label: "All" },
            { id: "running", label: "Running" },
            { id: "scheduled", label: "Scheduled" },
            { id: "completed", label: "Completed" },
            { id: "paused", label: "Paused" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => {
                setStatusFilter(pill.id);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === pill.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-xs font-bold text-foreground">Campaign</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Audience</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Recipients</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Delivery & Read</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Date</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-36" />
                      <Skeleton className="h-2.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-2.5 w-28 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-14 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-6 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <Megaphone className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">No campaigns found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Create a new WhatsApp campaign to broadcast template messages to your customers.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => {
                const statusMeta = STATUS_BADGES[camp.status] || STATUS_BADGES.draft;
                const deliveryPct =
                  camp.total_recipients > 0
                    ? Math.round((camp.delivered_count / camp.total_recipients) * 100)
                    : 0;
                const readPct =
                  camp.delivered_count > 0
                    ? Math.round((camp.read_count / camp.delivered_count) * 100)
                    : 0;

                return (
                  <TableRow
                    key={camp.id}
                    className="transition-colors hover:bg-muted/40 cursor-pointer"
                    onClick={() => onViewAnalytics(camp)}
                  >
                    <TableCell>
                      <div>
                        <p className="text-xs font-bold text-foreground hover:underline">
                          {camp.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Template: {camp.template_name || `template_${camp.template_id}`}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {(camp.audience_config.tags || []).length === 0 ? (
                          <span className="text-[10px] text-muted-foreground italic">All Contacts</span>
                        ) : (
                          camp.audience_config.tags?.slice(0, 2).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px] py-0 px-1.5 font-medium">
                              {t}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-extrabold text-foreground font-mono">
                        {camp.total_recipients.toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1.5 w-32">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Delivered: {deliveryPct}%</span>
                          <span className="text-muted-foreground">Read: {readPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${deliveryPct}%` }}
                          />
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${readPct}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={statusMeta.variant}
                        className={`text-[10px] uppercase font-semibold ${
                          camp.status === "running" ? "animate-pulse" : ""
                        }`}
                      >
                        {statusMeta.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(camp.scheduled_at || camp.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                          <DropdownMenuItem
                            onClick={() => onViewAnalytics(camp)}
                            className="gap-2 cursor-pointer"
                          >
                            <BarChart3 className="size-3.5 text-primary" />
                            <span>Analytics & Report</span>
                          </DropdownMenuItem>

                          {camp.status === "scheduled" || camp.status === "draft" ? (
                            <DropdownMenuItem
                              onClick={() => dispatchMutation.mutate(camp.id)}
                              className="gap-2 text-primary cursor-pointer"
                            >
                              <Play className="size-3.5" />
                              <span>Dispatch Now</span>
                            </DropdownMenuItem>
                          ) : null}

                          {camp.status === "running" && (
                            <DropdownMenuItem
                              onClick={() => pauseMutation.mutate(camp.id)}
                              className="gap-2 cursor-pointer"
                            >
                              <Pause className="size-3.5 text-amber-500" />
                              <span>Pause Sending</span>
                            </DropdownMenuItem>
                          )}

                          {camp.status === "paused" && (
                            <DropdownMenuItem
                              onClick={() => resumeMutation.mutate(camp.id)}
                              className="gap-2 text-primary cursor-pointer"
                            >
                              <Radio className="size-3.5" />
                              <span>Resume Sending</span>
                            </DropdownMenuItem>
                          )}

                          {(camp.status === "running" ||
                            camp.status === "scheduled" ||
                            camp.status === "paused") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => cancelMutation.mutate(camp.id)}
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                              >
                                <XCircle className="size-3.5" />
                                <span>Cancel Campaign</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 bg-muted/10">
            <p className="text-[11px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{campaigns.length}</span> of{" "}
              <span className="font-semibold text-foreground">{meta.total}</span> campaigns
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </Button>
              <span className="text-xs px-2 font-medium text-foreground">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

