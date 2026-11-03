import { apiClient } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { Product, ProductsQueryParams } from "@/types/product";
import type { ProductFormData } from "./schemas";

export async function fetchProducts(params?: ProductsQueryParams): Promise<{
  data: Product[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};
  if (params?.search) queryParams.search = params.search;
  if (params?.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params?.category && params.category !== "all") queryParams.category = params.category;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;

  const res = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, {
    params: queryParams,
  });

  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: res.meta as {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    } | undefined,
  };
}

export async function fetchProduct(id: string | number): Promise<Product> {
  const res = await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id));
  return res.data;
}

export async function createProduct(payload: ProductFormData): Promise<Product> {
  const res = await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.LIST, payload);
  return res.data;
}

export async function updateProduct(
  id: string | number,
  payload: Partial<ProductFormData>
): Promise<Product> {
  const res = await apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.DETAIL(id), payload);
  return res.data;
}

export async function deleteProduct(id: string | number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.PRODUCTS.DETAIL(id));
}

export async function syncMetaCatalog(): Promise<{
  status: string;
  synced_count: number;
  last_synced_at: string;
}> {
  const res = await apiClient.post<{
    status: string;
    synced_count: number;
    last_synced_at: string;
  }>(API_ENDPOINTS.PRODUCTS.SYNC_CATALOG);
  return res.data;
}

