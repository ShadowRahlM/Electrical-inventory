import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePayment, usePaymentMethods } from "@/domain/hooks/use-payments";
import { useSales } from "@/domain/hooks/use-sales";
import { useCustomers } from "@/domain/hooks/use-customers";
import { useSuppliers } from "@/domain/hooks/use-suppliers";
import { usePurchaseOrders } from "@/domain/hooks/use-purchases";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const create = useCreatePayment();
  const { data: methodData } = usePaymentMethods();
  const { data: saleData } = useSales({ is_active: true, page_size: 200 });
  const { data: custData } = useCustomers({ is_active: true, page_size: 200 });
  const { data: suppData } = useSuppliers({ is_active: true, page_size: 200 });
  const { data: poData } = usePurchaseOrders({ page_size: 200 });

  const [direction, setDirection] = useState("inflow");
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [sale, setSale] = useState("");
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [customer, setCustomer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [saving, setSaving] = useState(false);

  const methods = methodData || [];
  const sales = saleData?.results || [];
  const customers = custData?.results || [];
  const suppliers = suppData?.results || [];
  const orders = poData?.results || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await create.mutateAsync({
        direction,
        method,
        amount,
        reference: reference || undefined,
        notes: notes || undefined,
        sale: sale || undefined,
        purchase_order: purchaseOrder || undefined,
        customer: customer || undefined,
        supplier: supplier || undefined,
      });
      navigate("/payments");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="New Payment"
        actions={<button onClick={() => navigate("/payments")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back</button>}
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Direction *</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="inflow">Inflow (money received)</option>
              <option value="outflow">Outflow (money paid)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Method *</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {methods.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Amount *</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Reference</label>
            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="mb-2 text-sm font-medium">Link To (optional)</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium">Sale Invoice</label>
              <select value={sale} onChange={(e) => setSale(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">--</option>
                {sales.map((s: any) => <option key={s.id} value={s.id}>{s.invoice_number} - {s.customer_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Purchase Order</label>
              <select value={purchaseOrder} onChange={(e) => setPurchaseOrder(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">--</option>
                {orders.map((o: any) => <option key={o.id} value={o.id}>{o.order_number} - {o.supplier_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Customer</label>
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">--</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Supplier</label>
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">--</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.company}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/payments")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving || !amount} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
