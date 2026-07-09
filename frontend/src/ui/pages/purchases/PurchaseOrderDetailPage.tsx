import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseOrder, useReceiveItems, useCancelPurchaseOrder, useMarkPurchasePaid, useDeletePurchaseOrder } from "@/domain/hooks/use-purchases";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import DataTable from "@/ui/components/ui/DataTable";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { ArrowLeft, Edit, Trash2, Loader2, Package, X, DollarSign } from "lucide-react";

const statusBadge: Record<string, string> = {
  draft: "default",
  ordered: "warning",
  partially_received: "info",
  received: "success",
  cancelled: "danger",
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePurchaseOrder(id || "");
  const receiveItems = useReceiveItems();
  const cancelPO = useCancelPurchaseOrder();
  const markPaid = useMarkPurchasePaid();
  const deletePO = useDeletePurchaseOrder();

  const [receiveQty, setReceiveQty] = useState<Record<number, number>>({});
  const [showReceive, setShowReceive] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!po) return <div className="text-center text-muted-foreground">Purchase order not found</div>;

  const canReceive = po.status === "ordered" || po.status === "partially_received";
  const canCancel = po.status === "draft" || po.status === "ordered";
  const canEdit = po.status === "draft";

  const handleReceive = async () => {
    if (!id) return;
    const items = Object.entries(receiveQty)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ id: parseInt(itemId), quantity_received: qty }));
    if (items.length === 0) return;
    await receiveItems.mutateAsync({ id, items });
    setShowReceive(false);
    setReceiveQty({});
  };

  const handleMarkPaid = async () => {
    if (!id || !paymentAmount) return;
    await markPaid.mutateAsync({ id, amount: parseFloat(paymentAmount) });
    setPaymentAmount("");
    setShowPayment(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.order_number}
        description={po.supplier_name}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/purchases")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"><ArrowLeft size={15} /> Back</button>
            {canEdit && <button onClick={() => navigate(`/purchases/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"><Edit size={15} /> Edit</button>}
            {canReceive && <button onClick={() => setShowReceive(true)} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"><Package size={15} /> Receive</button>}
            {canCancel && <button onClick={() => setShowCancel(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"><X size={15} /> Cancel</button>}
            {!po.is_fully_paid && po.status !== "draft" && po.status !== "cancelled" && (
              <button onClick={() => setShowPayment(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"><DollarSign size={15} /> Mark Paid</button>
            )}
            {canEdit && <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"><Trash2 size={15} /> Delete</button>}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1"><Badge variant={(statusBadge[po.status] || "default") as any}>{po.status.replace("_", " ")}</Badge></p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold">{po.total_amount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="mt-1 text-xl font-bold text-green-600">{po.paid_amount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 text-xl font-bold text-red-600">{po.balance_due}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="mt-1 text-xl font-bold">{po.item_count}</p>
        </div>
      </div>

      {showReceive && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Receive Items</h3>
          <div className="space-y-2">
            {po.items.map((item: any) => {
              const maxReceive = item.quantity_ordered - item.quantity_received;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-md border bg-background p-2 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Ordered: {item.quantity_ordered} | Received: {item.quantity_received} | Pending: {item.quantity_pending}</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={maxReceive}
                    value={receiveQty[item.id] || 0}
                    onChange={(e) => setReceiveQty(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                    placeholder="Qty to receive"
                    className="w-24 rounded border bg-background px-2 py-1 text-center text-xs"
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={handleReceive} disabled={receiveItems.isPending || Object.values(receiveQty).every(q => q === 0)} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {receiveItems.isPending ? "..." : "Confirm Receive"}
            </button>
            <button onClick={() => setShowReceive(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Record Payment</h3>
          <div className="flex gap-2">
            <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount" className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={handleMarkPaid} disabled={markPaid.isPending || !paymentAmount} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{markPaid.isPending ? "..." : "Pay"}</button>
            <button onClick={() => setShowPayment(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Items</h3>
        <DataTable
          columns={[
            { key: "product_name", label: "Product" },
            { key: "product_sku", label: "SKU" },
            { key: "quantity_ordered", label: "Ordered" },
            { key: "quantity_received", label: "Received" },
            { key: "quantity_pending", label: "Pending" },
            { key: "unit_cost", label: "Unit Cost" },
            { key: "subtotal", label: "Subtotal" },
          ]}
          data={po.items || []}
          keyExtractor={(i: any) => String(i.id)}
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Order Date</dt><dd>{po.order_date}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Expected Date</dt><dd>{po.expected_date || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Notes</dt><dd>{po.notes || "-"}</dd></div>
        </dl>
      </div>

      <ConfirmDialog open={showCancel} title="Cancel Order" message="Are you sure you want to cancel this purchase order?" variant="danger" confirmLabel="Cancel Order" onConfirm={() => { cancelPO.mutate(id!); setShowCancel(false); }} onCancel={() => setShowCancel(false)} isLoading={cancelPO.isPending} />
      <ConfirmDialog open={showDelete} title="Delete Order" message="Are you sure you want to delete this purchase order?" variant="danger" confirmLabel="Delete" onConfirm={async () => { if (!id) return; await deletePO.mutateAsync(id); navigate("/purchases"); }} onCancel={() => setShowDelete(false)} isLoading={deletePO.isPending} />
    </div>
  );
}
