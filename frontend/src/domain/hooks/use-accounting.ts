import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

export function useAccounts(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["accounts", params],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/accounts/", { params });
      return res.data;
    },
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/accounting/accounts/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useJournalEntries(params?: Record<string, any>) {
  return useQuery({
    queryKey: ["journal-entries", params],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/journal/", { params });
      return res.data;
    },
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: ["journal-entries", id],
    queryFn: async () => {
      const res = await apiClient.get(`/accounting/journal/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post("/accounting/journal/", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journal-entries"] }),
  });
}

export function useProfitSummary(start_date?: string, end_date?: string) {
  return useQuery({
    queryKey: ["accounting", "profit-summary", start_date, end_date],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/profit_summary/", { params: { start_date, end_date } });
      return res.data;
    },
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ["accounting", "financial-summary"],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/financial_summary/");
      return res.data;
    },
  });
}

export function useRevenue(start_date?: string, end_date?: string) {
  return useQuery({
    queryKey: ["accounting", "revenue", start_date, end_date],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/revenue/", { params: { start_date, end_date } });
      return res.data;
    },
  });
}

export function useAccountingExpenses(start_date?: string, end_date?: string) {
  return useQuery({
    queryKey: ["accounting", "expenses", start_date, end_date],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/expenses/", { params: { start_date, end_date } });
      return res.data;
    },
  });
}

export function useAccountingCashFlow(start_date?: string, end_date?: string) {
  return useQuery({
    queryKey: ["accounting", "cash-flow", start_date, end_date],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/cash_flow/", { params: { start_date, end_date } });
      return res.data;
    },
  });
}

export function useBalanceSheet() {
  return useQuery({
    queryKey: ["accounting", "balance-sheet"],
    queryFn: async () => {
      const res = await apiClient.get("/accounting/reports/balance_sheet/");
      return res.data;
    },
  });
}
