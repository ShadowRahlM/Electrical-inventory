import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseOrder, useCreatePurchaseOrder, useUpdatePurchaseOrder } from "@/domain/hooks/use-purchases";
import { useProducts } from "@/domain/hooks/use-products";
import { useSuppliers } from "@/domain/hooks/use-suppliers";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Plus, Trash2, Search, Loader2 } from "lucide-react";

interface LineItem {
  product: string;
  product_name: string;
  product_sku: string;
  quantity_ordered: number;
  unit_cost: number;
}

const emptyForm = {
  order_number: "", supplier: "", order_date: "", expected_date: "", notes: "",
};

export default function PurchaseOrderFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: poData } = usePurchaseOrder(id || "");
  const create = useCreatePurchaseOrder();
  const update = useUpdatePurchaseOrder(id || "");
  const { data: prodData } = useProducts({ is_active: true, page_size: 200 });
  const { data: suppData } = useSuppliers({ is_active: true, page_size: 200 });

  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showProducts, setShowProducts] = useState(false);

  const products = prodData?.results || [];
  const suppliers = suppData?.results || [];

  useEffect(() => {
    if (isEdit && poData) {
      const po = poData;
      setForm({
        order_number: po.order_number || "",
        supplier: po.supplier || "",
        order_date: po.order_date || "",
        expected_date: po.expected_date || "",
        notes: po.notes || "",
      });
      setItems(
        (po.items || []).map((i: any) => ({
          product: i.product,
          product_name: i.product_name,
          product_sku: i.product_sku,
          quantity_ordered: i.quantity_ordered,
          unit_cost: parseFloat(i.unit_cost),
        })),
      );
    }
  }, [isEdit, poData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addItem = (product: any) => {
    if (items.some((i) => i.product === product.id)) return;
    setItems([
      ...items,
      {
        product: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity_ordered: 1,
        unit_cost: parseFloat(product.cost_price || "0"),
      },
    ]);
    setShowProducts(false);
    setProductSearch("");
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.unit_cost * item.quantity_ordered, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({
          product: i.product,
          quantity_ordered: i.quantity_ordered,
          unit_cost: i.unit_cost,
        })),
      };
      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
      navigate("/purchases");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p: any) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()),
  );

  if (isEdit && !poData) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={isEdit ? "Edit Purchase Order" : "New Purchase Order"}
        actions={
          <button onClick={() => navigate("/purchases")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Order Number *</label>
            <input type="text" name="order_number" value={form.order_number} onChange={handleChange} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Supplier *</label>
            <select name="supplier" value={form.supplier} onChange={handleChange} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">Select supplier...</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.company}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Order Date *</label>
            <input type="date" name="order_date" value={form.order_date} onChange={handleChange} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Expected Date</label>
            <input type="date" name="expected_date" value={form.expected_date} onChange={handleChange} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="text-sm font-medium">Items</label>
          <div className="relative mt-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products to add..."
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              onFocus={() => setShowProducts(true)}
            />
          </div>
          {showProducts && (
            <div className="mt-1 max-h-48 overflow-y-auto rounded-md border">
              {filteredProducts.map((p: any) => (
                <div key={p.id} onClick={() => addItem(p)} className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted/50">
                  <span>{p.name} ({p.sku})</span>
                  <span className="text-muted-foreground">{p.cost_price || "0"}</span>
                </div>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <div className="mt-3 space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border bg-background p-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">{item.product_sku}</p>
                  </div>
                  <input type="number" value={item.quantity_ordered} onChange={(e) => updateItem(index, "quantity_ordered", parseInt(e.target.value) || 1)} min="1" className="w-16 rounded border bg-background px-2 py-1 text-center text-xs" />
                  <input type="number" value={item.unit_cost} onChange={(e) => updateItem(index, "unit_cost", parseFloat(e.target.value) || 0)} min="0" step="0.01" className="w-24 rounded border bg-background px-2 py-1 text-center text-xs" />
                  <span className="w-20 text-right text-xs text-muted-foreground">{(item.unit_cost * item.quantity_ordered).toFixed(2)}</span>
                  <button onClick={() => removeItem(index)} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">{items.length} items</span>
          <span className="text-lg font-bold">Total: {totalAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/purchases")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving || items.length === 0} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Order" : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
