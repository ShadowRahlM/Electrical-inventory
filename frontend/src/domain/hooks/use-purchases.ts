import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  supplier_name: string;
  order_date: string;
  expected_date: string | null;
  status: string;
  notes: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  is_fully_paid: boolean;
  item_count: number;
  created_by_name: string;
  created_at: string;
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: number;
  product: string;
  product_name: string;
  product_sku: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  unit_cost: string;
  subtotal: string;
}

export interface PurchaseReturn {
  id: string;
  purchase_order: string;
  purchase_order_number: string;
  supplier_name: string;
  return_date: string;
  reason: string;
  total_amount: string;
  created_by_name: string;
  created_at: string;
}

export function usePurchaseOrders(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const res = await apiClient.get("/purchases/orders/", { params });
      return res.data;
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: async () => {
      const res = await apiClient.get(`/purchases/orders/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/purchases/orders/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.patch(`/purchases/orders/${id}/`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/purchases/orders/${id}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useReceiveItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { id: number; quantity_received: number }[] }) => {
      const res = await apiClient.post(`/purchases/orders/${id}/receive/`, { items });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchase-orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/purchases/orders/${id}/cancel/`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function useMarkPurchasePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await apiClient.post(`/purchases/orders/${id}/mark_paid/`, { amount });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });
}

export function usePurchaseReturns(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["purchase-returns", params],
    queryFn: async () => {
      const res = await apiClient.get("/purchases/returns/", { params });
      return res.data;
    },
  });
}

export function useCreatePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/purchases/returns/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase-returns"] }),
  });
}
