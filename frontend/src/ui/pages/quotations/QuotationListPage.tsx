import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotations, useDeleteQuotation } from "@/domain/hooks/use-sales";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { Plus, Search, ArrowLeft } from "lucide-react";

const statusBadge: Record<string, string> = {
  draft: "default",
  sent: "warning",
  accepted: "success",
  expired: "danger",
  converted: "info",
};

export default function QuotationListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useQuotations({ search });
  const deleteQuotation = useDeleteQuotation();

  const quotations = data?.results || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteQuotation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotations"
        description="Manage customer quotations"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/sales")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
              <ArrowLeft size={16} /> Back to Sales
            </button>
            <button onClick={() => navigate("/sales/quotations/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus size={16} /> New Quotation
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quotations..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "quote_number", label: "Quote #" },
          { key: "customer_name", label: "Customer" },
          { key: "quote_date", label: "Date", sortable: true },
          { key: "valid_until", label: "Valid Until", sortable: true },
          { key: "total", label: "Total", sortable: true },
          {
            key: "status", label: "Status",
            render: (q: any) => <Badge variant={(statusBadge[q.status] || "default") as any}>{q.status}</Badge>,
          },
          {
            key: "actions", label: "",
            render: (q: any) => (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/sales/quotations/${q.id}`)} className="text-xs text-muted-foreground hover:text-foreground">View</button>
                {q.status === "draft" && (
                  <button onClick={() => setDeleteId(q.id)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
                )}
              </div>
            ),
          },
        ]}
        data={quotations}
        keyExtractor={(q: any) => q.id}
        isLoading={isLoading}
        onRowClick={(q: any) => navigate(`/sales/quotations/${q.id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteQuotation.isPending}
      />
    </div>
  );
}
