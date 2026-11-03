import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  syncMetaCatalog,
} from "./api";
import { useActiveTenant } from "@/lib/tenant/hooks";
import type { ProductsQueryParams } from "@/types/product";
import type { ProductFormData } from "./schemas";

export const productKeys = {
  all: ["products"] as const,
  tenant: (tenantId: string | number | undefined) =>
    [...productKeys.all, String(tenantId ?? "default")] as const,
  lists: (tenantId: string | number | undefined) =>
    [...productKeys.tenant(tenantId), "list"] as const,
  list: (tenantId: string | number | undefined, params?: ProductsQueryParams) =>
    [...productKeys.lists(tenantId), params] as const,
  details: (tenantId: string | number | undefined) =>
    [...productKeys.tenant(tenantId), "detail"] as const,
  detail: (tenantId: string | number | undefined, id: string | number | undefined) =>
    [...productKeys.details(tenantId), String(id)] as const,
};

export function useProductsQuery(params?: ProductsQueryParams) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: productKeys.list(tenantId, params),
    queryFn: () => fetchProducts(params),
    staleTime: 1000 * 30,
  });
}

export function useProductDetailQuery(id: string | number | null | undefined) {
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useQuery({
    queryKey: productKeys.detail(tenantId, id ?? undefined),
    queryFn: () => fetchProduct(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (data: ProductFormData) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists(tenantId) });
    },
  });
}

export function useUpdateProductMutation(productId?: string | number) {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists(tenantId) });
      const targetId = variables.id || productId;
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(tenantId, targetId),
        });
      }
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: (id: string | number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists(tenantId) });
    },
  });
}

export function useSyncMetaCatalogMutation() {
  const queryClient = useQueryClient();
  const { activeTenant } = useActiveTenant();
  const tenantId = activeTenant?.id;

  return useMutation({
    mutationFn: syncMetaCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists(tenantId) });
    },
  });
}

