export type CatalogSyncStatus = "synced" | "pending" | "failed";

export interface Product {
  id: number | string;
  tenant_id?: number | string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  description: string;
  category?: string;
  is_active: boolean;
  stock_quantity: number;
  image_url?: string | null;
  catalog_status: CatalogSyncStatus;
  last_synced_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProductsQueryParams {
  search?: string;
  is_active?: boolean;
  category?: string;
  catalog_status?: string;
  page?: number;
  per_page?: number;
}

