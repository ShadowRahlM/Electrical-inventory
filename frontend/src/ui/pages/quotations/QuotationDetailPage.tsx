import { useNavigate, useParams } from "react-router-dom";
import {
  useQuotation,
  useDeleteQuotation,
  useConvertQuotationToSale,
  useMarkQuotationSent,
  useMarkQuotationAccepted,
} from "@/domain/hooks/use-sales";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import DataTable from "@/ui/components/ui/DataTable";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { ArrowLeft, Edit, Trash2, Loader2, Send, Check, ShoppingCart } from "lucide-react";
import { useState } from "react";

const statusBadge: Record<string, string> = {
  draft: "default",
  sent: "warning",
  accepted: "success",
  expired: "danger",
  converted: "info",
};

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: quotation, isLoading } = useQuotation(id || "");
  const deleteQuotation = useDeleteQuotation();
  const convertToSale = useConvertQuotationToSale();
  const markSent = useMarkQuotationSent();
  const markAccepted = useMarkQuotationAccepted();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!quotation) {
    return <div className="text-center text-muted-foreground">Quotation not found</div>;
  }

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteQuotation.mutateAsync(id);
      navigate("/sales/quotations");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const isDraft = quotation.status === "draft";
  const isSent = quotation.status === "sent";
  const canConvert = quotation.status === "accepted";

  return (
    <div className="space-y-6">
      <PageHeader
        title={quotation.quote_number}
        description={quotation.customer_name}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/sales/quotations")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            {isDraft && (
              <>
                <button onClick={() => navigate(`/sales/quotations/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
                  <Edit size={15} /> Edit
                </button>
                <button onClick={() => markSent.mutate(id!)} disabled={markSent.isPending} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
                  <Send size={15} /> {markSent.isPending ? "..." : "Mark Sent"}
                </button>
              </>
            )}
            {isSent && (
              <button onClick={() => markAccepted.mutate(id!)} disabled={markAccepted.isPending} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
                <Check size={15} /> {markAccepted.isPending ? "..." : "Mark Accepted"}
              </button>
            )}
            {canConvert && (
              <button onClick={() => convertToSale.mutate(id!)} disabled={convertToSale.isPending} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                <ShoppingCart size={15} /> {convertToSale.isPending ? "..." : "Convert to Sale"}
              </button>
            )}
            {isDraft && (
              <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
                <Trash2 size={15} /> Delete
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1"><Badge variant={(statusBadge[quotation.status] || "default") as any}>{quotation.status}</Badge></p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold">{quotation.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Quote Date</p>
          <p className="mt-1 text-xl font-bold">{quotation.quote_date}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Valid Until</p>
          <p className="mt-1 text-xl font-bold">{quotation.valid_until}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Items</h3>
        <DataTable
          columns={[
            { key: "product_name", label: "Product" },
            { key: "product_sku", label: "SKU" },
            { key: "quantity", label: "Qty" },
            { key: "unit_price", label: "Price" },
            { key: "discount", label: "Discount" },
            { key: "subtotal", label: "Subtotal" },
          ]}
          data={quotation.items || []}
          keyExtractor={(i: any) => String(i.id)}
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{quotation.subtotal}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>{quotation.discount}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{quotation.tax}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{quotation.total}</dd></div>
        </dl>
      </div>

      {quotation.converted_sale && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm">
            Converted to sale:{" "}
            <button onClick={() => navigate(`/sales/${quotation.converted_sale}`)} className="font-medium text-primary hover:underline">
              View Sale
            </button>
          </p>
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        title="Delete Quotation"
        message={`Are you sure you want to delete "${quotation.quote_number}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleting}
      />
    </div>
  );
}
