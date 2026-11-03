"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductFormData } from "../schemas";
import { useCreateProductMutation, useUpdateProductMutation } from "../hooks";
import type { Product } from "@/types/product";
import { Package, Image as ImageIcon, DollarSign, Layers, Loader2 } from "lucide-react";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

interface FormContentProps {
  productToEdit?: Product | null;
  onClose: () => void;
}

function ProductFormContent({ productToEdit, onClose }: FormContentProps) {
  const isEditing = Boolean(productToEdit);
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(productToEdit?.id);

  const [previewError, setPreviewError] = useState(false);
  const [imageUrl, setImageUrl] = useState(productToEdit?.image_url || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: productToEdit?.name || "",
      sku: productToEdit?.sku || "",
      price: productToEdit?.price ?? 0,
      currency: productToEdit?.currency || "INR",
      description: productToEdit?.description || "",
      category: productToEdit?.category || "",
      stock_quantity: productToEdit?.stock_quantity ?? 10,
      is_active: productToEdit?.is_active ?? true,
      image_url: productToEdit?.image_url || "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing && productToEdit) {
        await updateMutation.mutateAsync({
          id: productToEdit.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-foreground">
          {isEditing ? "Edit Product" : "Add Catalog Product"}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Configure product pricing, SKU, and catalog images for WhatsApp in-chat commerce.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
        {/* Product Name & SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Package className="size-3.5 text-muted-foreground" />
              Product Name *
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Wireless Noise-Canceling Earbuds"
              className="h-9 text-xs"
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">SKU *</label>
            <Input
              {...register("sku")}
              placeholder="WNC-202"
              className="h-9 text-xs font-mono uppercase"
            />
            {errors.sku && (
              <p className="text-[11px] text-destructive">{errors.sku.message}</p>
            )}
          </div>
        </div>

        {/* Price, Currency & Stock */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-muted-foreground" />
              Price *
            </label>
            <Input
              type="number"
              {...register("price")}
              placeholder="1999"
              className="h-9 text-xs"
            />
            {errors.price && (
              <p className="text-[11px] text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Currency</label>
            <select
              {...register("currency")}
              className="w-full h-9 rounded-md border border-input bg-background px-2.5 text-xs"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (د.إ)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Inventory Stock</label>
            <Input
              type="number"
              {...register("stock_quantity")}
              placeholder="50"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Category & Active Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-muted-foreground" />
              Category
            </label>
            <Input
              {...register("category")}
              placeholder="e.g. Electronics, Footwear"
              className="h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="is_active_checkbox"
              {...register("is_active")}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            <label
              htmlFor="is_active_checkbox"
              className="text-xs font-semibold text-foreground cursor-pointer"
            >
              Active in WhatsApp Catalog
            </label>
          </div>
        </div>

        {/* Image URL & Preview */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ImageIcon className="size-3.5 text-muted-foreground" />
            Product Image URL
          </label>
          <div className="flex gap-3 items-center">
            <Input
              {...register("image_url", {
                onChange: (e) => {
                  setImageUrl(e.target.value);
                  setPreviewError(false);
                },
              })}
              placeholder="https://images.example.com/products/item.jpg"
              className="h-9 text-xs flex-1"
            />
            {imageUrl && !previewError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                onError={() => setPreviewError(true)}
                className="size-9 rounded-md object-cover border border-border shrink-0"
              />
            ) : (
              <div className="size-9 rounded-md bg-muted/40 border border-border/60 flex items-center justify-center shrink-0">
                <ImageIcon className="size-4 text-muted-foreground/40" />
              </div>
            )}
          </div>
          {errors.image_url && (
            <p className="text-[11px] text-destructive">{errors.image_url.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Product Description *
          </label>
          <Textarea
            {...register("description")}
            placeholder="Detailed specs and marketing description shown to WhatsApp shoppers..."
            className="text-xs min-h-[75px] resize-none"
          />
          {errors.description && (
            <p className="text-[11px] text-destructive">{errors.description.message}</p>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            <span>{isEditing ? "Save Product" : "Create Product"}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
}: ProductFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <ProductFormContent
          key={productToEdit?.id ?? "new"}
          productToEdit={productToEdit}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
