"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import type { Invoice } from "@/types/billing";
import { formatDateShort, formatCurrency } from "@/lib/formatters";

interface InvoiceHistoryTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoiceHistoryTable({
  invoices,
  isLoading,
}: InvoiceHistoryTableProps) {
  const handleDownload = (inv: Invoice) => {
    alert(`Downloading invoice ${inv.invoice_number} (PDF)`);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-foreground">
          Billing &amp; Payment Invoices
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          View transaction history, tax statements, and download official receipts
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Invoice</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Billing Period</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Amount</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Payment Date</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="max-w-xs mx-auto space-y-1.5">
                    <FileText className="size-6 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold text-xs text-foreground">No invoices generated yet</p>
                    <p className="text-[11px] text-muted-foreground">
                      Monthly renewal statements will appear here upon invoice finalization.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="align-middle py-3">
                    <span className="font-mono text-xs font-bold text-foreground block">
                      {inv.invoice_number}
                    </span>
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {formatDateShort(inv.billing_period_start)} – {formatDateShort(inv.billing_period_end)}
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs font-bold font-mono text-foreground">
                    {formatCurrency(inv.amount_paid, inv.currency || "USD")}
                  </TableCell>

                  <TableCell className="align-middle py-3">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1"
                    >
                      <CheckCircle2 className="size-3" />
                      Paid
                    </Badge>
                  </TableCell>

                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {inv.paid_at ? formatDateShort(inv.paid_at) : formatDateShort(inv.created_at)}
                  </TableCell>

                  <TableCell className="text-right align-middle py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(inv)}
                      className="h-7 text-xs text-primary gap-1 font-semibold"
                    >
                      <Download className="size-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

