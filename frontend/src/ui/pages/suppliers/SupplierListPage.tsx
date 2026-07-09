import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSuppliers, useDeleteSupplier } from "@/domain/hooks/use-suppliers";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { Plus, Search } from "lucide-react";

export default function SupplierListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  const suppliers = data?.results || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteSupplier.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Suppliers"
        description="Manage product suppliers"
        actions={
          <button onClick={() => navigate("/suppliers/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Supplier
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "company", label: "Company", sortable: true },
          { key: "contact_person", label: "Contact" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "balance", label: "Balance", sortable: true },
          { key: "product_count", label: "Products" },
          {
            key: "actions", label: "",
            render: (s: any) => (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/suppliers/${s.id}/edit`)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                <button onClick={() => setDeleteId(s.id)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            ),
          },
        ]}
        data={suppliers}
        keyExtractor={(s: any) => s.id}
        isLoading={isLoading}
        onRowClick={(s: any) => navigate(`/suppliers/${s.id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Supplier"
        message="Are you sure you want to delete this supplier?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteSupplier.isPending}
      />
    </div>
  );
}
