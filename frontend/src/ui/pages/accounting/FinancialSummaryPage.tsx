import { useState } from "react";
import { useProfitSummary, useFinancialSummary } from "@/domain/hooks/use-accounting";
import PageHeader from "@/ui/components/ui/PageHeader";
import { Loader2 } from "lucide-react";

function KPI({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color || ""}`}>{value}</p>
    </div>
  );
}

export default function FinancialSummaryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: profitData, isLoading: profitLoading } = useProfitSummary(startDate || undefined, endDate || undefined);
  const { data: finData, isLoading: finLoading } = useFinancialSummary();

  const profit = profitData?.data;
  const fin = finData?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Financial Summary" description="Key financial indicators" />

      <div className="flex gap-4">
        <div className="max-w-xs">
          <label className="text-sm font-medium">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="max-w-xs">
          <label className="text-sm font-medium">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>

      {profitLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : profit ? (
        <div>
          <h3 className="mb-3 font-semibold">Profit & Loss</h3>
          <div className="grid gap-4 md:grid-cols-5">
            <KPI label="Revenue" value={profit.revenue} color="text-green-600" />
            <KPI label="COGS" value={profit.cost_of_goods_sold} color="text-red-600" />
            <KPI label="Gross Profit" value={profit.gross_profit} color="text-green-600" />
            <KPI label="Expenses" value={profit.expenses} color="text-red-600" />
            <KPI label="Net Profit" value={profit.net_profit} color={parseFloat(profit.net_profit) >= 0 ? "text-green-600" : "text-red-600"} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <KPI label="Gross Margin" value={`${profit.gross_margin}%`} />
            <KPI label="Net Margin" value={`${profit.net_margin}%`} />
          </div>
        </div>
      ) : null}

      {finLoading ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : fin ? (
        <div>
          <h3 className="mb-3 font-semibold">Balance Sheet Summary</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <KPI label="Stock Value" value={fin.stock_value} />
            <KPI label="Customer Debt" value={fin.customer_debt} color="text-red-600" />
            <KPI label="Supplier Debt" value={fin.supplier_debt} color="text-yellow-600" />
            <KPI label="Cash Flow" value={fin.cash_flow} color={parseFloat(fin.cash_flow) >= 0 ? "text-green-600" : "text-red-600"} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
