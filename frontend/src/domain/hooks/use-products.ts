import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  brand: string;
  category: string | null;
  category_name: string;
  unit: string;
  cost_price: string;
  selling_price: string;
  wholesale_price: string | null;
  retail_price: string | null;
  quantity: number;
  min_stock: number;
  reorder_level: number;
  supplier: string | null;
  supplier_name: string;
  vat_rate: string;
  warranty_period: number | null;
  image: string | null;
  location: string;
  status: string;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  needs_reorder: boolean;
  margin: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  description: string;
  is_active: boolean;
  children?: Category[];
}

export function useProducts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await apiClient.get("/products/", { params });
      return res.data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/products/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/products/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCategories(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const res = await apiClient.get("/categories/", { params });
      return res.data;
    },
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: async () => {
      const res = await apiClient.get("/categories/tree/");
      return res.data.data;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/categories/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useStockMovements(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["stock-movements", params],
    queryFn: async () => {
      const res = await apiClient.get("/inventory/movements/", { params });
      return res.data;
    },
  });
}

export function useRecordMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/inventory/movements/record/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stock-movements", "products"] }),
  });
}
