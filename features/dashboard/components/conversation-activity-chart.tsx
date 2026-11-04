"use client";

import { useState, useMemo } from "react";
import { useConversationActivityQuery } from "../hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/formatters";
import { BarChart3, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import type { ConversationActivityPoint } from "@/types/dashboard";

export function ConversationActivityChart() {
  const { data: rawData, isLoading, isError, refetch } = useConversationActivityQuery();
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(null);

  const points: ConversationActivityPoint[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData && typeof rawData === "object") {
      const candidates = [
        (rawData as any).data,
        (rawData as any).activity,
        (rawData as any).points,
        (rawData as any).conversations,
        (rawData as any).chart,
        (rawData as any).history,
        (rawData as any).items,
      ];
      for (const c of candidates) {
        if (Array.isArray(c)) return c;
      }
    }
    return [];
  }, [rawData]);

  if (isLoading) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-56 flex items-end justify-between gap-3 px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <Skeleton className="w-full rounded-t-md" style={{ height: `${20 + (i * 11) % 70}%` }} />
                <Skeleton className="h-3 w-6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !Array.isArray(points) || points.length === 0) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Conversation Activity</CardTitle>
          <CardDescription className="text-xs">
            Daily incoming vs outgoing WhatsApp message volume
          </CardDescription>
        </CardHeader>
        <CardContent className="h-56 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="size-5 text-amber-500" />
          <p>No activity data available for this range</p>
          <Button variant="outline" size="xs" onClick={() => refetch()} className="gap-1 mt-1">
            <RefreshCw className="size-3" />
            Reload Activity
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals and maximum for SVG scaling
  const maxVolume = Math.max(
    ...points.map((p) =>
      Math.max(Number(p?.incoming) || 0, Number(p?.outgoing) || 0, Number(p?.resolved) || 0)
    ),
    50
  );

  const totalIncoming = points.reduce((acc, p) => acc + (Number(p?.incoming) || 0), 0);
  const totalOutgoing = points.reduce((acc, p) => acc + (Number(p?.outgoing) || 0), 0);
  const totalResolved = points.reduce((acc, p) => acc + (Number(p?.resolved) || 0), 0);

  const activePoint: ConversationActivityPoint | null =
    activeHoverIdx !== null && points[activeHoverIdx] ? points[activeHoverIdx] : null;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Conversation Activity</CardTitle>
          </div>
          <CardDescription className="text-xs">
            7-day message traffic breakdown across inbound and outbound channels
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-emerald-500" />
            <span>Inbound ({formatNumber(totalIncoming)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-sky-500" />
            <span>Outbound ({formatNumber(totalOutgoing)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-xs bg-violet-500" />
            <span>Resolved ({formatNumber(totalResolved)})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Dynamic Detail Banner on Hover */}
        <div className="min-h-6 mb-2 text-xs flex items-center justify-between bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
          {activePoint ? (
            <>
              <span className="font-semibold text-foreground">
                {activePoint.label || activePoint.date} ({activePoint.date})
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                  {formatNumber(activePoint.incoming || 0)} in
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold font-mono">
                  {formatNumber(activePoint.outgoing || 0)} out
                </span>
                <span className="text-violet-600 dark:text-violet-400 font-semibold font-mono">
                  {formatNumber(activePoint.resolved || 0)} resolved
                </span>
              </div>
            </>
          ) : (
            <span className="text-muted-foreground text-[11px] flex items-center gap-1.5">
              <TrendingUp className="size-3 text-primary" />
              Hover over bars to inspect daily conversation resolution statistics
            </span>
          )}
        </div>

        {/* Responsive Bar Chart View */}
        <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 border-b border-border/50">
          {points.map((p, idx) => {
            const incomingVal = Number(p?.incoming) || 0;
            const outgoingVal = Number(p?.outgoing) || 0;
            const resolvedVal = Number(p?.resolved) || 0;

            const inHeight = (incomingVal / maxVolume) * 100;
            const outHeight = (outgoingVal / maxVolume) * 100;
            const resHeight = (resolvedVal / maxVolume) * 100;
            const isHovered = activeHoverIdx === idx;

            return (
              <div
                key={p.date || idx}
                onMouseEnter={() => setActiveHoverIdx(idx)}
                onMouseLeave={() => setActiveHoverIdx(null)}
                className={`flex-1 flex flex-col items-center justify-end h-full gap-1 group cursor-pointer transition-transform ${
                  isHovered ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                {/* 3 Grouped Bars: Inbound, Outbound, Resolved */}
                <div className="w-full max-w-[42px] flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                  {/* Inbound bar */}
                  <div
                    style={{ height: `${Math.max(inHeight, 4)}%` }}
                    className="w-full bg-emerald-500 rounded-t-xs transition-all duration-300 group-hover:brightness-110"
                    title={`Inbound: ${incomingVal}`}
                  />
                  {/* Outbound bar */}
                  <div
                    style={{ height: `${Math.max(outHeight, 4)}%` }}
                    className="w-full bg-sky-500 rounded-t-xs transition-all duration-300 group-hover:brightness-110"
                    title={`Outbound: ${outgoingVal}`}
                  />
                  {/* Resolved bar */}
                  <div
                    style={{ height: `${Math.max(resHeight, 4)}%` }}
                    className="w-full bg-violet-500 rounded-t-xs transition-all duration-300 group-hover:brightness-110"
                    title={`Resolved: ${resolvedVal}`}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    isHovered ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {p.label || p.date}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
