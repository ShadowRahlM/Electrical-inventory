import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseOrders } from "@/domain/hooks/use-purchases";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

const statusBadge: Record<string, string> = {
  draft: "default",
  ordered: "warning",
  partially_received: "info",
  received: "success",
  cancelled: "danger",
};

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = usePurchaseOrders({ search });

  const orders = data?.results || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Orders"
        description="Manage supplier purchase orders"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/purchases/returns")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
              Returns
            </button>
            <button onClick={() => navigate("/purchases/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus size={16} /> New Purchase Order
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search purchase orders..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "order_number", label: "Order #" },
          { key: "supplier_name", label: "Supplier" },
          { key: "order_date", label: "Date", sortable: true },
          { key: "total_amount", label: "Total", sortable: true },
          { key: "paid_amount", label: "Paid" },
          { key: "balance_due", label: "Balance" },
          {
            key: "status", label: "Status",
            render: (o: any) => <Badge variant={(statusBadge[o.status] || "default") as any}>{o.status.replace("_", " ")}</Badge>,
          },
          {
            key: "is_fully_paid", label: "Payment",
            render: (o: any) => o.is_fully_paid ? <Badge variant="success">Paid</Badge> : <Badge variant="warning">Due</Badge>,
          },
        ]}
        data={orders}
        keyExtractor={(o: any) => o.id}
        isLoading={isLoading}
        onRowClick={(o: any) => navigate(`/purchases/${o.id}`)}
      />
    </div>
  );
}
