import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { TrendingUp, Package, AlertTriangle, DollarSign, Loader2 } from "lucide-react";

interface DashboardData {
  today: { sales_total: string; sales_count: number; expenses: string; profit: string };
  weekly_sales: string;
  monthly: { sales: string; expenses: string };
  inventory: { low_stock: number; out_of_stock: number; stock_value: string };
  financial: { total_revenue: string; cash_balance: string; customer_debt: string; supplier_debt: string };
  top_products: { name: string; sku: string; sold: number; revenue: string }[];
  best_customers: { name: string; phone: string; total: string; sales: number }[];
  recent_invoices: { invoice: string; customer: string; total: string; date: string }[];
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/dashboard/");
      return res.data.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: "Today's Sales", value: data?.today.sales_total || "0", sub: `${data?.today.sales_count || 0} transactions`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Today's Profit", value: data?.today.profit || "0", sub: `Expenses: ${data?.today.expenses || "0"}`, icon: DollarSign, color: "text-green-600" },
    { label: "Low Stock", value: String(data?.inventory.low_stock ?? 0), sub: `${data?.inventory.out_of_stock ?? 0} out of stock`, icon: AlertTriangle, color: "text-amber-600" },
    { label: "Stock Value", value: data?.inventory.stock_value || "0", sub: `${data?.financial.total_revenue || "0"} total revenue`, icon: Package, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Top Products</h2>
          {data?.top_products?.length ? (
            <div className="space-y-2">
              {data.top_products.slice(0, 5).map((p) => (
                <div key={p.sku} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="text-muted-foreground">{p.sold} sold</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sales data yet</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Recent Invoices</h2>
          {data?.recent_invoices?.length ? (
            <div className="space-y-2">
              {data.recent_invoices.slice(0, 5).map((inv) => (
                <div key={inv.invoice} className="flex items-center justify-between text-sm">
                  <span>{inv.invoice}</span>
                  <span className="text-muted-foreground">{inv.total}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No recent invoices</p>
          )}
        </div>
      </div>
    </div>
  );
}
