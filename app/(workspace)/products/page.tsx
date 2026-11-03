"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/features/products/components/products-table";
import { ProductFormModal } from "@/features/products/components/product-form-modal";
import { CatalogSyncBanner } from "@/features/products/components/catalog-sync-banner";
import { useProductsQuery } from "@/features/products/hooks";
import type { Product } from "@/types/product";
import { Plus } from "lucide-react";

export default function ProductsPage() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { data: productsData } = useProductsQuery();
  const products = productsData?.data || [];
  const activeCount = products.filter((p) => p.is_active).length;

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & WhatsApp Catalog"
        description="Synchronize e-commerce products and service listings for WhatsApp direct checkout"
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Products" },
        ]}
      >
        <Button size="sm" className="gap-1.5" onClick={handleOpenAddProduct}>
          <Plus className="size-3.5" />
          <span>Add Product</span>
        </Button>
      </PageHeader>

      {/* Catalog Synchronization Banner */}
      <CatalogSyncBanner
        totalProducts={products.length}
        activeCount={activeCount}
        lastSyncedAt={products[0]?.last_synced_at}
      />

      {/* Products Table with Search & Filters */}
      <ProductsTable onEditProduct={handleEditProduct} />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />
    </div>
  );
}
