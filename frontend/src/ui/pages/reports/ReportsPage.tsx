import { useState } from "react";
import {
  useDailySales, useMonthlySales, useYearlySales,
  useSalesByProduct, useSalesByCategory, useProfitReport,
  usePurchasesReport, useInventoryReport, useStockMovementReport,
  useSuppliersReport, useCustomersReport, useExpensesReport,
  useCashFlowReport, useTaxReport, useEmployeeSalesReport,
  useProductMovementReport,
} from "@/domain/hooks/use-reports";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Loader2 } from "lucide-react";

type ReportTab = "daily-sales" | "monthly-sales" | "yearly-sales" | "sales-by-product" | "sales-by-category" | "profit" | "purchases" | "inventory" | "stock-movement" | "suppliers" | "customers" | "expenses" | "cash-flow" | "tax" | "employee-sales" | "product-movement";

const tabs: { key: ReportTab; label: string }[] = [
  { key: "daily-sales", label: "Daily Sales" },
  { key: "monthly-sales", label: "Monthly Sales" },
  { key: "yearly-sales", label: "Yearly Sales" },
  { key: "sales-by-product", label: "Sales by Product" },
  { key: "sales-by-category", label: "Sales by Category" },
  { key: "profit", label: "Profit" },
  { key: "purchases", label: "Purchases" },
  { key: "inventory", label: "Inventory" },
  { key: "stock-movement", label: "Stock Movement" },
  { key: "suppliers", label: "Suppliers" },
  { key: "customers", label: "Customers" },
  { key: "expenses", label: "Expenses" },
  { key: "cash-flow", label: "Cash Flow" },
  { key: "tax", label: "Tax" },
  { key: "employee-sales", label: "Employee Sales" },
  { key: "product-movement", label: "Product Movement" },
];

function SummaryCards({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className={`mt-1 text-xl font-bold ${item.color || ""}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function ReportTable({ columns, data, isLoading }: { columns: { key: string; label: string }[]; data: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!data || data.length === 0) return <p className="text-center text-sm text-muted-foreground">No data</p>;
  return (
    <DataTable
      columns={columns.map((c) => ({ ...c, render: undefined })) as any}
      data={data}
      keyExtractor={(item: any) => item.date || item.product__name || item.company || item.name || JSON.stringify(item)}
    />
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("daily-sales");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ds = useDailySales(tab === "daily-sales" ? date : undefined);
  const ms = useMonthlySales();
  const ys = useYearlySales();
  const sbp = useSalesByProduct(startDate || undefined, endDate || undefined);
  const sbc = useSalesByCategory(startDate || undefined, endDate || undefined);
  const pr = useProfitReport(startDate || undefined, endDate || undefined);
  const pu = usePurchasesReport(startDate || undefined, endDate || undefined);
  const inv = useInventoryReport();
  const sm = useStockMovementReport(startDate || undefined, endDate || undefined);
  const sup = useSuppliersReport();
  const cust = useCustomersReport();
  const exp = useExpensesReport(startDate || undefined, endDate || undefined);
  const cf = useCashFlowReport(startDate || undefined, endDate || undefined);
  const tax = useTaxReport(startDate || undefined, endDate || undefined);
  const emp = useEmployeeSalesReport(startDate || undefined, endDate || undefined);
  const pm = useProductMovementReport();

  const needsDateRange = ["sales-by-product", "sales-by-category", "profit", "purchases", "stock-movement", "expenses", "cash-flow", "tax", "employee-sales"].includes(tab);
  const needsSingleDate = tab === "daily-sales";

  const renderContent = () => {
    switch (tab) {
      case "daily-sales": {
        const d = ds.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[
              { label: "Date", value: d.date },
              { label: "Sales Count", value: String(d.sales_count) },
              { label: "Total", value: d.total, color: "text-green-600" },
            ]} />
            <ReportTable
              columns={[{ key: "invoice", label: "Invoice" }, { key: "customer", label: "Customer" }, { key: "time", label: "Time" }, { key: "total", label: "Total" }, { key: "paid", label: "Paid" }, { key: "by", label: "By" }]}
              data={d.sales || []}
              isLoading={ds.isLoading}
            />
          </div>
        );
      }
      case "monthly-sales": {
        const d = ms.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[
              { label: "Period", value: `${d.start} - ${d.end}` },
              { label: "Sales Count", value: String(d.sales_count) },
              { label: "Total", value: d.total, color: "text-green-600" },
            ]} />
            {d.daily_breakdown && (
              <ReportTable
                columns={[{ key: "date", label: "Date" }, { key: "total", label: "Total" }]}
                data={Object.entries(d.daily_breakdown).map(([date, total]) => ({ date, total }))}
                isLoading={ms.isLoading}
              />
            )}
          </div>
        );
      }
      case "yearly-sales": {
        const d = ys.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[
              { label: "Period", value: `${d.start} - ${d.end}` },
              { label: "Sales Count", value: String(d.sales_count) },
              { label: "Total", value: d.total, color: "text-green-600" },
            ]} />
          </div>
        );
      }
      case "sales-by-product": {
        const d = sbp.data?.data;
        return (
          <ReportTable
            columns={[{ key: "product__name", label: "Product" }, { key: "product__sku", label: "SKU" }, { key: "total_qty", label: "Qty Sold" }, { key: "total_revenue", label: "Revenue" }, { key: "sale_count", label: "Sales" }]}
            data={d || []}
            isLoading={sbp.isLoading}
          />
        );
      }
      case "sales-by-category": {
        const d = sbc.data?.data;
        return (
          <ReportTable
            columns={[{ key: "product__category__name", label: "Category" }, { key: "total_qty", label: "Qty Sold" }, { key: "total_revenue", label: "Revenue" }]}
            data={d || []}
            isLoading={sbc.isLoading}
          />
        );
      }
      case "profit": {
        const d = pr.data?.data;
        if (!d) return null;
        return (
          <SummaryCards items={[
            { label: "Revenue", value: d.revenue, color: "text-green-600" },
            { label: "Expenses", value: d.expenses, color: "text-red-600" },
            { label: "Gross Profit", value: d.gross_profit, color: "text-green-600" },
            { label: "Net Profit", value: d.net_profit, color: d.net_profit >= 0 ? "text-green-600" : "text-red-600" },
          ]} />
        );
      }
      case "purchases": {
        const d = pu.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[
              { label: "Total Orders", value: String(d.total_orders) },
              { label: "Total Amount", value: d.total_amount },
              { label: "Total Paid", value: d.total_paid, color: "text-green-600" },
            ]} />
            <ReportTable
              columns={[{ key: "order_number", label: "Order" }, { key: "supplier", label: "Supplier" }, { key: "date", label: "Date" }, { key: "status", label: "Status" }, { key: "total", label: "Total" }, { key: "paid", label: "Paid" }]}
              data={d.orders || []}
              isLoading={pu.isLoading}
            />
          </div>
        );
      }
      case "inventory": {
        const d = inv.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[
              { label: "Total Products", value: String(d.total_products) },
              { label: "Stock Value", value: d.total_stock_value },
              { label: "Low Stock", value: String(d.low_stock_count), color: "text-yellow-600" },
              { label: "Out of Stock", value: String(d.out_of_stock_count), color: "text-red-600" },
            ]} />
            <ReportTable
              columns={[{ key: "sku", label: "SKU" }, { key: "name", label: "Name" }, { key: "quantity", label: "Qty" }, { key: "stock_value", label: "Value" }, { key: "status", label: "Status" }]}
              data={d.products || []}
              isLoading={inv.isLoading}
            />
          </div>
        );
      }
      case "stock-movement": {
        const d = sm.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[{ label: "Total Movements", value: String(d.total_movements) }]} />
            <ReportTable
              columns={[{ key: "date", label: "Date" }, { key: "product", label: "Product" }, { key: "sku", label: "SKU" }, { key: "type", label: "Type" }, { key: "qty_change", label: "Change" }, { key: "balance_after", label: "Balance" }]}
              data={d.movements || []}
              isLoading={sm.isLoading}
            />
          </div>
        );
      }
      case "suppliers": {
        const d = sup.data?.data;
        return (
          <ReportTable
            columns={[{ key: "company", label: "Company" }, { key: "contact", label: "Contact" }, { key: "phone", label: "Phone" }, { key: "balance", label: "Balance" }, { key: "total_purchases", label: "Total Purchases" }, { key: "order_count", label: "Orders" }]}
            data={d?.suppliers || []}
            isLoading={sup.isLoading}
          />
        );
      }
      case "customers": {
        const d = cust.data?.data;
        return (
          <ReportTable
            columns={[{ key: "name", label: "Name" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "credit_limit", label: "Credit Limit" }, { key: "outstanding", label: "Outstanding" }, { key: "total_sales", label: "Total Sales" }, { key: "loyalty_points", label: "Loyalty Points" }]}
            data={d?.customers || []}
            isLoading={cust.isLoading}
          />
        );
      }
      case "expenses": {
        const d = exp.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-4">
            <SummaryCards items={[{ label: "Total Expenses", value: d.total_expenses, color: "text-red-600" }]} />
            {d.by_category && (
              <ReportTable
                columns={[{ key: "category", label: "Category" }, { key: "total", label: "Total" }, { key: "count", label: "Count" }]}
                data={d.by_category}
                isLoading={false}
              />
            )}
            <ReportTable
              columns={[{ key: "category", label: "Category" }, { key: "amount", label: "Amount" }, { key: "date", label: "Date" }, { key: "description", label: "Description" }, { key: "by", label: "By" }]}
              data={d.items || []}
              isLoading={exp.isLoading}
            />
          </div>
        );
      }
      case "cash-flow": {
        const d = cf.data?.data;
        return (
          <SummaryCards items={[{ label: "Cash Flow", value: d?.cash_flow || "0", color: (parseFloat(d?.cash_flow || "0") >= 0) ? "text-green-600" : "text-red-600" }]} />
        );
      }
      case "tax": {
        const d = tax.data?.data;
        if (!d) return null;
        return (
          <SummaryCards items={[
            { label: "Tax Collected", value: d.total_tax_collected },
            { label: "Total Sales", value: d.total_sales },
            { label: "Effective Rate", value: `${d.effective_rate}%` },
          ]} />
        );
      }
      case "employee-sales": {
        const d = emp.data?.data;
        return (
          <ReportTable
            columns={[{ key: "username", label: "Username" }, { key: "name", label: "Name" }, { key: "total_sales", label: "Total Sales" }, { key: "sale_count", label: "Sales Count" }]}
            data={d?.employees || []}
            isLoading={emp.isLoading}
          />
        );
      }
      case "product-movement": {
        const d = pm.data?.data;
        if (!d) return null;
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">Fast Moving</h3>
              <ReportTable columns={[{ key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "sold", label: "Sold" }, { key: "stock", label: "Stock" }]} data={d.fast_moving || []} isLoading={false} />
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Slow Moving</h3>
              <ReportTable columns={[{ key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "sold", label: "Sold" }, { key: "stock", label: "Stock" }]} data={d.slow_moving || []} isLoading={false} />
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Dead Stock</h3>
              <ReportTable columns={[{ key: "name", label: "Name" }, { key: "sku", label: "SKU" }, { key: "stock", label: "Stock" }]} data={d.dead_stock || []} isLoading={false} />
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Business performance reports" />

      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {needsSingleDate && (
        <div className="max-w-xs">
          <label className="text-sm font-medium">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      )}

      {needsDateRange && (
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
      )}

      {renderContent()}
    </div>
  );
}
