import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface Sale {
  id: string;
  invoice_number: string;
  customer: string | null;
  customer_name: string;
  sale_date: string;
  status: string;
  subtotal: string;
  discount: string;
  discount_type: string;
  tax: string;
  total: string;
  paid_amount: string;
  balance_due: string;
  is_fully_paid: boolean;
  item_count: number;
  created_by_name: string;
  created_at: string;
}

export interface SaleDetail extends Sale {
  notes: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  product: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  discount: string;
  subtotal: string;
}

export interface Quotation {
  id: string;
  quote_number: string;
  customer: string | null;
  customer_name: string;
  quote_date: string;
  valid_until: string;
  status: string;
  subtotal: string;
  discount: string;
  discount_type: string;
  tax: string;
  total: string;
  item_count: number;
  created_by_name: string;
  is_active: boolean;
  created_at: string;
}

export interface QuotationDetail extends Quotation {
  notes: string;
  converted_sale: string | null;
  items: QuotationItem[];
}

export interface QuotationItem {
  id: number;
  product: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string;
  discount: string;
  subtotal: string;
}

export function useSales(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      const res = await apiClient.get("/sales/", { params });
      return res.data;
    },
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const res = await apiClient.get(`/sales/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function usePosCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/sales/pos_create/", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await apiClient.post(`/sales/${id}/record_payment/`, { amount });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sales"] }),
  });
}

export function useRefundSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.post(`/sales/${id}/refund/`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useTodaySales() {
  return useQuery({
    queryKey: ["sales", "today"],
    queryFn: async () => {
      const res = await apiClient.get("/sales/today/");
      return res.data;
    },
  });
}

export function useQuotations(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["quotations", params],
    queryFn: async () => {
      const res = await apiClient.get("/sales/quotations/", { params });
      return res.data;
    },
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: async () => {
      const res = await apiClient.get(`/sales/quotations/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/sales/quotations/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useUpdateQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/sales/quotations/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/sales/quotations/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useConvertQuotationToSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales/quotations/${id}/convert_to_sale/`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useMarkQuotationSent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales/quotations/${id}/mark_sent/`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useMarkQuotationAccepted() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales/quotations/${id}/mark_accepted/`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}
