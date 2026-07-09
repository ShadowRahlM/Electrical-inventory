import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";

function useReport(key: (string | undefined)[], path: string, params?: Record<string, any>) {
  const cleanParams = params ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")) : undefined;
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await apiClient.get(path, { params: cleanParams });
      return res.data;
    },
  });
}

export function useDailySales(date?: string) {
  return useReport(["reports", "daily-sales", date], "/reports/daily_sales/", { date });
}

export function useMonthlySales() {
  return useReport(["reports", "monthly-sales"], "/reports/monthly_sales/");
}

export function useYearlySales() {
  return useReport(["reports", "yearly-sales"], "/reports/yearly_sales/");
}

export function useSalesByProduct(start_date?: string, end_date?: string) {
  return useReport(["reports", "sales-by-product", start_date, end_date], "/reports/sales_by_product/", { start_date, end_date });
}

export function useSalesByCategory(start_date?: string, end_date?: string) {
  return useReport(["reports", "sales-by-category", start_date, end_date], "/reports/sales_by_category/", { start_date, end_date });
}

export function useProfitReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "profit", start_date, end_date], "/reports/profit/", { start_date, end_date });
}

export function usePurchasesReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "purchases", start_date, end_date], "/reports/purchases/", { start_date, end_date });
}

export function useInventoryReport() {
  return useReport(["reports", "inventory"], "/reports/inventory/");
}

export function useStockMovementReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "stock-movement", start_date, end_date], "/reports/stock_movement/", { start_date, end_date });
}

export function useSuppliersReport() {
  return useReport(["reports", "suppliers"], "/reports/suppliers/");
}

export function useCustomersReport() {
  return useReport(["reports", "customers"], "/reports/customers/");
}

export function useExpensesReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "expenses", start_date, end_date], "/reports/expenses/", { start_date, end_date });
}

export function useCashFlowReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "cash-flow", start_date, end_date], "/reports/cash_flow/", { start_date, end_date });
}

export function useTaxReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "tax", start_date, end_date], "/reports/tax/", { start_date, end_date });
}

export function useEmployeeSalesReport(start_date?: string, end_date?: string) {
  return useReport(["reports", "employee-sales", start_date, end_date], "/reports/employee_sales/", { start_date, end_date });
}

export function useProductMovementReport() {
  return useReport(["reports", "product-movement"], "/reports/product_movement/");
}
