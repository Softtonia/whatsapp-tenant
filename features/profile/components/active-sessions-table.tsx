"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, Globe, XCircle } from "lucide-react";
import type { UserSession } from "@/types/settings";
import { useRevokeUserSessionMutation } from "@/features/settings/hooks";
import { formatRelativeTime } from "@/lib/formatters";

interface ActiveSessionsTableProps {
  sessions: UserSession[];
  isLoading: boolean;
}

export function ActiveSessionsTable({
  sessions,
  isLoading,
}: ActiveSessionsTableProps) {
  const revokeMutation = useRevokeUserSessionMutation();

  const handleRevoke = async (id: string | number) => {
    if (confirm("Revoke this login session? The device will be signed out immediately.")) {
      await revokeMutation.mutateAsync(id);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Laptop className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Active Browser &amp; Device Sessions
            </CardTitle>
            <CardDescription className="text-xs">
              Review active browser sessions logged into this account and revoke unrecognized devices
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Device &amp; Browser</TableHead>
              <TableHead className="text-xs font-bold text-foreground">IP Address</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Location</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Last Activity</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={5}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                  No other active sessions detected.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((sess) => (
                <TableRow key={sess.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="align-middle py-3">
                    <div className="flex items-center gap-2.5">
                      {sess.device_name?.toLowerCase().includes("phone") ? (
                        <Smartphone className="size-4 text-primary shrink-0" />
                      ) : (
                        <Laptop className="size-4 text-primary shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {sess.device_name || "Personal Computer"}
                          </span>
                          {sess.is_current && (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold"
                            >
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block font-mono">
                          {sess.browser || sess.user_agent}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="align-middle py-3 font-mono text-xs text-muted-foreground">
                    {sess.ip_address}
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="size-3 text-muted-foreground" />
                      {sess.location || "Bangalore, India"}
                    </span>
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {formatRelativeTime(sess.last_activity_at)}
                  </TableCell>

                  <TableCell className="text-right align-middle py-3">
                    {!sess.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={revokeMutation.isPending}
                        onClick={() => handleRevoke(sess.id)}
                        className="h-7 text-xs text-muted-foreground hover:text-rose-600 gap-1"
                      >
                        <XCircle className="size-3" />
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
