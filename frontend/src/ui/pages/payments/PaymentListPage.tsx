import { useState } from "react";
import { usePayments, usePaymentMethods } from "@/domain/hooks/use-payments";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

const methodColors: Record<string, string> = {
  cash: "success",
  mobile_money: "info",
  bank_transfer: "warning",
  cheque: "default",
  card: "info",
};

export default function PaymentListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePayments({ search });

  const payments = data?.results || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description="All payment transactions"
        actions={
          <button onClick={() => navigate("/payments/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Payment
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <DataTable
        columns={[
          { key: "payment_date", label: "Date", sortable: true },
          {
            key: "direction", label: "Type",
            render: (p: any) => p.direction === "inflow" ? <Badge variant="success">Inflow</Badge> : <Badge variant="danger">Outflow</Badge>,
          },
          {
            key: "method", label: "Method",
            render: (p: any) => <Badge variant={(methodColors[p.method] || "default") as any}>{p.method.replace("_", " ")}</Badge>,
          },
          { key: "amount", label: "Amount", sortable: true },
          { key: "sale_invoice", label: "Sale" },
          { key: "purchase_order_number", label: "PO" },
          { key: "customer_name", label: "Customer" },
          { key: "supplier_name", label: "Supplier" },
          { key: "reference", label: "Reference" },
        ]}
        data={payments}
        keyExtractor={(p: any) => p.id}
        isLoading={isLoading}
      />
    </div>
  );
}
