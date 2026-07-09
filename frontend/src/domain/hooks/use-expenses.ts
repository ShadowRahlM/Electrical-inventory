import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Expense {
  id: string;
  category: string;
  category_display: string;
  amount: string;
  description: string;
  date: string;
  receipt: string | null;
  recorded_by_name: string;
  created_at: string;
}

export function useExpenses(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: async () => {
      const res = await apiClient.get("/expenses/", { params });
      return res.data;
    },
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const res = await apiClient.get(`/expenses/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/expenses/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/expenses/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/expenses/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
