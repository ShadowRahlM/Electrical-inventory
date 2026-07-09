import { useNavigate, useParams } from "react-router-dom";
import { useCustomer, useDeleteCustomer } from "@/domain/hooks/use-customers";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(id || "");
  const deleteCustomer = useDeleteCustomer();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!customer) {
    return <div className="text-center text-muted-foreground">Customer not found</div>;
  }

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteCustomer.mutateAsync(id);
      navigate("/customers");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={customer.email || customer.phone}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/customers")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => navigate(`/customers/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <Edit size={15} /> Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Credit Limit</p>
          <p className="mt-1 text-xl font-bold">{customer.credit_limit}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Outstanding Balance</p>
          <p className="mt-1 text-xl font-bold">{customer.outstanding_balance}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Available Credit</p>
          <p className="mt-1 text-xl font-bold">{customer.available_credit}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Loyalty Points</p>
          <p className="mt-1 text-xl font-bold">{customer.loyalty_points}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Customer Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{customer.phone || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{customer.email || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Address</dt><dd>{customer.address || "-"}</dd></div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>{customer.is_over_credit_limit ? <Badge variant="danger">Over Credit Limit</Badge> : <Badge variant="success">Active</Badge>}</dd>
          </div>
        </dl>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleting}
      />
    </div>
  );
}
