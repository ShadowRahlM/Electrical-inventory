import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export interface SystemSettings {
  id: number;
  shop_name: string;
  shop_address: string;
  shop_phone: string;
  shop_email: string;
  currency: string;
  tax_rate: string;
  tax_name: string;
  timezone: string;
  low_stock_threshold: number;
  reorder_level: number;
  allow_negative_inventory: boolean;
  invoice_prefix: string;
  enable_credit_sales: boolean;
  default_credit_limit: string;
  receipt_footer: string;
  low_stock_alerts: boolean;
  updated_at: string;
  updated_by: number | null;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/");
      return res.data as SystemSettings;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      const res = await apiClient.put("/settings/", data);
      return res.data as SystemSettings;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
