import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  credit_limit: string;
  outstanding_balance: string;
  available_credit: string;
  loyalty_points: number;
  is_over_credit_limit: boolean;
  is_active: boolean;
  created_at: string;
}

export function useCustomers(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: async () => {
      const res = await apiClient.get("/customers/", { params });
      return res.data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const res = await apiClient.get(`/customers/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/customers/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/customers/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
