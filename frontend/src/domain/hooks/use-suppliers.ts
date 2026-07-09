import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Supplier {
  id: string;
  company: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  balance: string;
  product_count: number;
  is_active: boolean;
  created_at: string;
}

export function useSuppliers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: async () => {
      const res = await apiClient.get("/suppliers/", { params });
      return res.data;
    },
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: async () => {
      const res = await apiClient.get(`/suppliers/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/suppliers/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/suppliers/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/suppliers/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
