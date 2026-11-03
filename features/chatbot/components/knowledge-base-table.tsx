"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { AiKnowledgeItem } from "@/types/chatbot";
import { useDeleteAiKnowledgeMutation, useUpdateAiKnowledgeMutation } from "../hooks";
import { KnowledgeFormModal } from "./knowledge-form-modal";

interface KnowledgeBaseTableProps {
  items: AiKnowledgeItem[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function KnowledgeBaseTable({
  items,
  isLoading,
  onRefresh,
}: KnowledgeBaseTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editingItem, setEditingItem] = React.useState<AiKnowledgeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const deleteMutation = useDeleteAiKnowledgeMutation();
  const updateMutation = useUpdateAiKnowledgeMutation();

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.keywords.some((k) => k.toLowerCase().includes(term))
      );
    });
  }, [items, searchTerm]);

  const handleToggleActive = async (item: AiKnowledgeItem) => {
    await updateMutation.mutateAsync({
      id: item.id,
      data: { is_active: !item.is_active },
    });
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this knowledge item?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (item: AiKnowledgeItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs, questions, and keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleOpenNew}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <Plus className="size-4" />
            Add Knowledge Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Question / Inquiry</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Verified Answer</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Keywords</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={5}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <BookOpen className="size-5" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">No knowledge entries found</p>
                    <p className="text-[11px] text-muted-foreground">
                      {searchTerm
                        ? "Try searching with different keywords."
                        : "Start training your AI bot by adding questions and answers."}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOpenNew}
                      className="mt-2 text-xs"
                    >
                      Add First Entry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium align-top py-3">
                    <span className="font-semibold text-xs text-foreground block max-w-xs">
                      {item.question}
                    </span>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-md leading-relaxed">
                      {item.answer}
                    </p>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {item.keywords?.length > 0 ? (
                        item.keywords.map((kw, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-normal"
                          >
                            {kw}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">None</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="align-top py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer group"
                      title="Click to toggle active status"
                    >
                      {item.is_active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="size-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <XCircle className="size-3.5" />
                          Disabled
                        </span>
                      )}
                    </button>
                  </TableCell>

                  <TableCell className="text-right align-top py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        title="Edit entry"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                        title="Delete entry"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <KnowledgeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSuccess={onRefresh}
      />
    </div>
  );
}

