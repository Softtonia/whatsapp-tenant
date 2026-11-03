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
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatters";
import { useProductsQuery, useDeleteProductMutation } from "../hooks";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ShoppingBag,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductsTableProps {
  onEditProduct: (product: Product) => void;
}

export function ProductsTable({ onEditProduct }: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const { data: productsData, isLoading } = useProductsQuery({
    search: search.trim() || undefined,
    is_active: activeFilter === "all" ? undefined : activeFilter === "active",
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    page,
    per_page: 20,
  });

  const deleteMutation = useDeleteProductMutation();

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  );

  const handleCopyLink = (product: Product) => {
    const text = `whatsapp://product/${product.sku}`;
    navigator.clipboard.writeText(text);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
              placeholder="Search products by title, SKU, or description..."
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Status Filter */}
          <div className="flex items-center gap-1.5 border border-input rounded-lg px-2 h-9 bg-background">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs text-foreground outline-none border-none pr-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 border border-input rounded-lg px-2 h-9 bg-background">
              <Package className="size-3.5 text-muted-foreground" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-foreground outline-none border-none pr-1"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-xs font-bold text-foreground">Product</TableHead>
              <TableHead className="text-xs font-bold text-foreground">SKU</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Price</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Inventory</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Meta Catalog</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="w-12 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-9 rounded-md" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-14" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-12 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-6 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <ShoppingBag className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">No products found</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {search || activeFilter !== "all" || categoryFilter !== "all"
                      ? "Try adjusting your search query or filters."
                      : "Add your first product to start sending WhatsApp catalog messages."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isOutOfStock = product.stock_quantity <= 0;
                const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10;

                return (
                  <TableRow
                    key={product.id}
                    className="transition-colors hover:bg-muted/40 cursor-pointer"
                    onClick={() => onEditProduct(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="size-9 rounded-md object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="size-9 rounded-md bg-muted/40 border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground">
                            <ShoppingBag className="size-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-foreground hover:underline line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {product.category || "General"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {product.sku}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-extrabold text-foreground">
                        {formatCurrency(product.price, product.currency)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-destructive"
                              : isLowStock
                              ? "text-amber-500 font-bold"
                              : "text-foreground"
                          }`}
                        >
                          {product.stock_quantity} in stock
                        </span>
                        {isLowStock && (
                          <AlertTriangle className="size-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {product.catalog_status === "synced" && (
                        <Badge
                          variant="default"
                          className="text-[10px] py-0 px-2 font-medium flex items-center gap-1"
                        >
                          <CheckCircle2 className="size-2.5" />
                          <span>Synced</span>
                        </Badge>
                      )}
                      {product.catalog_status === "pending" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-2 font-medium flex items-center gap-1"
                        >
                          <Clock className="size-2.5" />
                          <span>Pending</span>
                        </Badge>
                      )}
                      {product.catalog_status === "failed" && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] py-0 px-2 font-medium flex items-center gap-1"
                        >
                          <span>Failed</span>
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={product.is_active ? "outline" : "secondary"}
                        className={`text-[10px] uppercase font-semibold ${
                          product.is_active ? "border-primary/50 text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {product.is_active ? "Active" : "Draft"}
                      </Badge>
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
                            onClick={() => onEditProduct(product)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit className="size-3.5 text-muted-foreground" />
                            <span>Edit Product</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleCopyLink(product)}
                            className="gap-2 cursor-pointer"
                          >
                            <Copy className="size-3.5 text-muted-foreground" />
                            <span>
                              {copiedId === product.id ? "Copied Link!" : "Copy WhatsApp Link"}
                            </span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(product.id)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete Product</span>
                          </DropdownMenuItem>
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
              Showing <span className="font-semibold text-foreground">{products.length}</span> of{" "}
              <span className="font-semibold text-foreground">{meta.total}</span> products
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

