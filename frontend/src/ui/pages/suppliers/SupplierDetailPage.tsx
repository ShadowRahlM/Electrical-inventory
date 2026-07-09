import { useNavigate, useParams } from "react-router-dom";
import { useSupplier, useDeleteSupplier } from "@/domain/hooks/use-suppliers";
import PageHeader from "@/ui/components/ui/PageHeader";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id || "");
  const deleteSupplier = useDeleteSupplier();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!supplier) {
    return <div className="text-center text-muted-foreground">Supplier not found</div>;
  }

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteSupplier.mutateAsync(id);
      navigate("/suppliers");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.company}
        description={supplier.contact_person || supplier.email}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/suppliers")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => navigate(`/suppliers/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <Edit size={15} /> Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 text-xl font-bold">{supplier.balance}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Products</p>
          <p className="mt-1 text-xl font-bold">{supplier.product_count}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 text-xl font-bold">{supplier.is_active ? "Active" : "Inactive"}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Supplier Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Contact Person</dt><dd>{supplier.contact_person || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{supplier.phone || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{supplier.email || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Address</dt><dd>{supplier.address || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax Number</dt><dd>{supplier.tax_number || "-"}</dd></div>
        </dl>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplier.company}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleting}
      />
    </div>
  );
}
