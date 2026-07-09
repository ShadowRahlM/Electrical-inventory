import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSales } from "@/domain/hooks/use-sales";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

const statusBadge: Record<string, string> = {
  completed: "success",
  refunded: "danger",
  partially_refunded: "warning",
};

export default function SalesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSales({ search });

  const sales = data?.results || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sales"
        description="View and manage sales transactions"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/sales/pos")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus size={16} /> New POS Sale
            </button>
            <button onClick={() => navigate("/sales/quotations")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
              Quotations
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice or customer..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "invoice_number", label: "Invoice" },
          { key: "customer_name", label: "Customer" },
          { key: "sale_date", label: "Date", sortable: true },
          { key: "total", label: "Total", sortable: true },
          { key: "paid_amount", label: "Paid" },
          { key: "balance_due", label: "Balance" },
          {
            key: "status", label: "Status",
            render: (s: any) => <Badge variant={(statusBadge[s.status] || "default") as any}>{s.status.replace("_", " ")}</Badge>,
          },
          {
            key: "is_fully_paid", label: "Payment",
            render: (s: any) => s.is_fully_paid ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Due</Badge>,
          },
        ]}
        data={sales}
        keyExtractor={(s: any) => s.id}
        isLoading={isLoading}
        onRowClick={(s: any) => navigate(`/sales/${s.id}`)}
      />
    </div>
  );
}
