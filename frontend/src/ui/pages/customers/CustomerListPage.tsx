import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomers, useDeleteCustomer } from "@/domain/hooks/use-customers";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

export default function CustomerListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useCustomers({ search });
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.results || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCustomer.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="Manage customer accounts"
        actions={
          <button onClick={() => navigate("/customers/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Customer
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "credit_limit", label: "Credit Limit" },
          { key: "outstanding_balance", label: "Outstanding" },
          { key: "loyalty_points", label: "Points", sortable: true },
          {
            key: "is_over_credit_limit", label: "Status",
            render: (c: any) =>
              c.is_over_credit_limit
                ? <Badge variant="danger">Over Limit</Badge>
                : <Badge variant="success">Active</Badge>,
          },
          {
            key: "actions", label: "",
            render: (c: any) => (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/customers/${c.id}/edit`)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                <button onClick={() => setDeleteId(c.id)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            ),
          },
        ]}
        data={customers}
        keyExtractor={(c: any) => c.id}
        isLoading={isLoading}
        onRowClick={(c: any) => navigate(`/customers/${c.id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
