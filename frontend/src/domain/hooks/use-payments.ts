import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Payment {
  id: string;
  sale: string | null;
  sale_invoice: string | null;
  purchase_order: string | null;
  purchase_order_number: string | null;
  customer: string | null;
  customer_name: string | null;
  supplier: string | null;
  supplier_name: string | null;
  direction: string;
  method: string;
  amount: string;
  reference: string;
  notes: string;
  payment_date: string;
  recorded_by_name: string;
}

export function usePayments(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const res = await apiClient.get("/payments/", { params });
      return res.data;
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["payments", id],
    queryFn: async () => {
      const res = await apiClient.get(`/payments/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/payments/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await apiClient.get("/payments/methods/");
      return res.data;
    },
    staleTime: Infinity,
  });
}

export function usePaymentsBySale(saleId: string) {
  return useQuery({
    queryKey: ["payments", "by-sale", saleId],
    queryFn: async () => {
      const res = await apiClient.get("/payments/by_sale/", { params: { sale_id: saleId } });
      return res.data;
    },
    enabled: !!saleId,
  });
}
