import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSale, useRecordPayment, useRefundSale } from "@/domain/hooks/use-sales";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import DataTable from "@/ui/components/ui/DataTable";
import { ArrowLeft, Loader2, DollarSign } from "lucide-react";

const statusBadge: Record<string, string> = {
  completed: "success",
  refunded: "danger",
  partially_refunded: "warning",
};

export default function SaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sale, isLoading } = useSale(id || "");
  const recordPayment = useRecordPayment();
  const refundSale = useRefundSale();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!sale) {
    return <div className="text-center text-muted-foreground">Sale not found</div>;
  }

  const handlePayment = async () => {
    if (!id || !paymentAmount) return;
    await recordPayment.mutateAsync({ id, amount: parseFloat(paymentAmount) });
    setPaymentAmount("");
    setShowPayment(false);
  };

  const handleRefund = async () => {
    if (!id || !refundReason) return;
    await refundSale.mutateAsync({ id, data: { reason: refundReason } });
    setRefundReason("");
    setShowRefund(false);
  };

  const canRefund = sale.status === "completed" || sale.status === "partially_refunded";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${sale.invoice_number}`}
        description={sale.customer_name}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/sales")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            {!sale.is_fully_paid && (
              <button onClick={() => setShowPayment(true)} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90">
                <DollarSign size={15} /> Record Payment
              </button>
            )}
            {canRefund && (
              <button onClick={() => setShowRefund(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
                Refund
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1"><Badge variant={(statusBadge[sale.status] || "default") as any}>{sale.status.replace("_", " ")}</Badge></p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-xl font-bold">{sale.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="mt-1 text-xl font-bold text-green-600">{sale.paid_amount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="mt-1 text-xl font-bold text-red-600">{sale.balance_due}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="mt-1 text-xl font-bold">{sale.item_count}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Sale Items</h3>
        <DataTable
          columns={[
            { key: "product_name", label: "Product" },
            { key: "product_sku", label: "SKU" },
            { key: "quantity", label: "Qty" },
            { key: "unit_price", label: "Price" },
            { key: "discount", label: "Discount" },
            { key: "subtotal", label: "Subtotal" },
          ]}
          data={sale.items || []}
          keyExtractor={(i: any) => String(i.id)}
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Summary</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{sale.subtotal}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>{sale.discount}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{sale.tax}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{sale.total}</dd></div>
        </dl>
      </div>

      {showPayment && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Record Payment</h3>
          <div className="flex gap-2">
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Amount"
              className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={handlePayment} disabled={recordPayment.isPending || !paymentAmount} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {recordPayment.isPending ? "..." : "Pay"}
            </button>
            <button onClick={() => setShowPayment(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      {showRefund && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Refund Sale</h3>
          <p className="mb-3 text-sm text-muted-foreground">This will restore stock to inventory.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund *"
              className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={handleRefund} disabled={refundSale.isPending || !refundReason} className="rounded-md bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90 disabled:opacity-50">
              {refundSale.isPending ? "..." : "Confirm Refund"}
            </button>
            <button onClick={() => setShowRefund(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
