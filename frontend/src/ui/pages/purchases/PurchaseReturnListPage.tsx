import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePurchaseReturns, usePurchaseOrders, useCreatePurchaseReturn } from "@/domain/hooks/use-purchases";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function PurchaseReturnListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = usePurchaseReturns();
  const { data: poData } = usePurchaseOrders();
  const create = useCreatePurchaseReturn();

  const returns = data?.results || [];
  const orders = poData?.results || [];

  const [showForm, setShowForm] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [totalAmount, setTotalAmount] = useState("0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      purchase_order: purchaseOrder,
      return_date: returnDate,
      reason,
      total_amount: totalAmount,
    });
    setShowForm(false);
    setPurchaseOrder("");
    setReason("");
    setTotalAmount("0");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Purchase Returns"
        description="Returns to suppliers"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/purchases")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
              <ArrowLeft size={16} /> Back to Orders
            </button>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New Return
            </button>
          </div>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium">Purchase Order</label>
              <select value={purchaseOrder} onChange={(e) => setPurchaseOrder(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">Select...</option>
                {orders.map((o: any) => <option key={o.id} value={o.id}>{o.order_number} - {o.supplier_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Date</label>
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Amount</label>
              <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={create.isPending || !purchaseOrder} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{create.isPending ? "..." : "Save"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Cancel</button>
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
          </div>
        </form>
      )}

      <DataTable
        columns={[
          { key: "purchase_order_number", label: "Order" },
          { key: "supplier_name", label: "Supplier" },
          { key: "return_date", label: "Date", sortable: true },
          { key: "total_amount", label: "Amount" },
          { key: "reason", label: "Reason" },
        ]}
        data={returns}
        keyExtractor={(r: any) => r.id}
        isLoading={isLoading}
      />
    </div>
  );
}
