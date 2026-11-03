"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Contact } from "@/types/contact";
import {
  useContactsQuery,
  useContactTagsQuery,
  useArchiveContactMutation,
  useRestoreContactMutation,
  useExportContactsMutation,
} from "../hooks";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Archive,
  RotateCcw,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  Loader2,
} from "lucide-react";

interface ContactsTableProps {
  onSelectContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
}

export function ContactsTable({
  onSelectContact,
  onEditContact,
}: ContactsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const { data: contactsData, isLoading } = useContactsQuery({
    search: search.trim() || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    tag: tagFilter !== "all" ? tagFilter : undefined,
    page,
    per_page: 20,
  });

  const { data: tags = [] } = useContactTagsQuery();
  const archiveMutation = useArchiveContactMutation();
  const restoreMutation = useRestoreContactMutation();
  const exportMutation = useExportContactsMutation();

  const contacts = contactsData?.data || [];
  const meta = contactsData?.meta;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    try {
      const res = await exportMutation.mutateAsync("csv");
      if (res.download_url) {
        window.open(res.download_url, "_blank");
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const isAllSelected = contacts.length > 0 && selectedIds.length === contacts.length;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, email, or company..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 border border-input rounded-lg px-2 h-9 bg-background">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-foreground outline-none border-none pr-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-1.5 border border-input rounded-lg px-2 h-9 bg-background">
            <TagIcon className="size-3.5 text-muted-foreground" />
            <select
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-foreground outline-none border-none pr-1"
            >
              <option value="all">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Action */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            disabled={exportMutation.isPending}
            onClick={handleExport}
          >
            {exportMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary size-3.5"
                  aria-label="Select all contacts"
                />
              </TableHead>
              <TableHead className="text-xs font-bold text-foreground">Contact</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Company / Source</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Tags</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Assigned Owner</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Created</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell className="px-3">
                    <Skeleton className="size-3.5 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-6 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <Users className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">No contacts found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {search || statusFilter !== "all" || tagFilter !== "all"
                      ? "Try adjusting your search terms or active filters."
                      : "Add your first contact or import a CSV to populate your audience directory."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => {
                const isSelected = selectedIds.includes(contact.id);
                const isArchived = contact.status === "archived";

                return (
                  <TableRow
                    key={contact.id}
                    className={`transition-colors cursor-pointer hover:bg-muted/40 ${
                      isSelected ? "bg-muted/60" : ""
                    }`}
                  >
                    <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(contact.id)}
                        className="rounded border-input text-primary focus:ring-primary size-3.5"
                      />
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border/60">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold text-foreground hover:underline">
                            {contact.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">
                          {contact.company || "—"}
                        </p>
                        {contact.source && (
                          <p className="text-[10px] text-muted-foreground">
                            {contact.source}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(contact.tags || []).length === 0 ? (
                          <span className="text-muted-foreground text-[10px] italic">—</span>
                        ) : (
                          contact.tags.slice(0, 2).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 font-medium"
                            >
                              {t}
                            </Badge>
                          ))
                        )}
                        {(contact.tags || []).length > 2 && (
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            +{contact.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <span className="text-xs text-foreground font-medium">
                        {contact.owner_name || "Unassigned"}
                      </span>
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <Badge
                        variant={isArchived ? "secondary" : "default"}
                        className="text-[10px] uppercase font-semibold tracking-wider"
                      >
                        {contact.status}
                      </Badge>
                    </TableCell>

                    <TableCell onClick={() => onSelectContact(contact)}>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(contact.created_at).toLocaleDateString()}
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
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuItem
                            onClick={() => onSelectContact(contact)}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="size-3.5 text-muted-foreground" />
                            <span>View Profile</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onEditContact(contact)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="size-3.5 text-muted-foreground" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem className="p-0">
                            <Link
                              href="/chats"
                              className={buttonVariants({
                                variant: "ghost",
                                size: "sm",
                                className: "w-full justify-start h-8 px-2 text-xs gap-2 font-normal",
                              })}
                            >
                              <MessageSquare className="size-3.5 text-primary" />
                              <span>Open in Inbox</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {isArchived ? (
                            <DropdownMenuItem
                              onClick={() => restoreMutation.mutate(contact.id)}
                              className="gap-2 cursor-pointer"
                            >
                              <RotateCcw className="size-3.5 text-primary" />
                              <span>Restore Contact</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => archiveMutation.mutate(contact.id)}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Archive className="size-3.5" />
                              <span>Archive Contact</span>
                            </DropdownMenuItem>
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

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border/80 px-4 py-3 bg-muted/10">
            <p className="text-[11px] text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{contacts.length}</span> of{" "}
              <span className="font-semibold text-foreground">{meta.total}</span> contacts
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

      {/* Floating Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
}

