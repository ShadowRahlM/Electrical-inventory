import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosCreate } from "@/domain/hooks/use-sales";
import { useCustomers } from "@/domain/hooks/use-customers";
import { useProducts } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Plus, Trash2, Search, Loader2 } from "lucide-react";

interface CartItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
}

export default function POSPage() {
  const navigate = useNavigate();
  const posCreate = usePosCreate();
  const { data: prodData } = useProducts({ is_active: true, page_size: 200 });
  const { data: custData } = useCustomers({ is_active: true, page_size: 200 });
  const [customer, setCustomer] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const products = prodData?.results || [];
  const customers = custData?.results || [];

  const filtered = products.filter(
    (p: any) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: 1,
          unit_price: parseFloat(product.selling_price),
        },
      ];
    });
    setShowProducts(false);
    setProductSearch("");
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.product_id === productId ? { ...c, quantity: qty } : c)),
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    try {
      const payload = {
        customer: customer || null,
        items: cart.map((c) => ({
          product: c.product_id,
          quantity: c.quantity,
          unit_price: c.unit_price,
        })),
        payment_method: paymentMethod,
        paid: subtotal,
      };
      await posCreate.mutateAsync(payload);
      navigate("/sales");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Point of Sale"
        description="Quick sale entry"
        actions={
          <button onClick={() => navigate("/sales")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back to Sales
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  onFocus={() => setShowProducts(true)}
                />
              </div>
              <button onClick={() => setShowProducts(!showProducts)} className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                <Plus size={16} /> Add
              </button>
            </div>

            {showProducts && (
              <div className="mt-2 max-h-60 overflow-y-auto rounded-md border">
                {filtered.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No products found</p>
                ) : (
                  filtered.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-muted-foreground">({p.sku})</span>
                      </div>
                      <span className="text-muted-foreground">{p.selling_price}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold">Cart ({cart.length} items)</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add products to start a sale</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between rounded-md border bg-background p-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{item.product_sku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.unit_price}</span>
                      <div className="flex items-center">
                        <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="rounded-l-md border px-2 py-1 text-xs hover:bg-muted">-</button>
                        <span className="border-y px-3 py-1 text-xs font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="rounded-r-md border px-2 py-1 text-xs hover:bg-muted">+</button>
                      </div>
                      <span className="w-16 text-right font-medium">{(item.unit_price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeItem(item.product_id)} className="text-destructive hover:text-destructive/80">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <label className="text-sm font-medium">Customer</label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">Walk-in Customer</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <label className="text-sm font-medium">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || saving}
            className="w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing...</span> : `Complete Sale (${subtotal.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
}
