import { useState } from "react";
import { useStockMovements, useRecordMovement, useProducts } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Loader2, Search } from "lucide-react";

const movementTypeBadge: Record<string, string> = {
  stock_in: "success", stock_out: "danger", transfer: "default",
  adjustment: "warning", damage: "danger", theft: "danger",
  expired: "warning", return: "success",
};

export default function StockMovementListPage() {
  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState("stock_in");
  const [quantity, setQuantity] = useState("1");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const { data: movData, isLoading } = useStockMovements({ search });
  const { data: prodData } = useProducts();
  const record = useRecordMovement();

  const movements = movData?.results || [];
  const products = prodData?.results || [];

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    await record.mutateAsync({
      product_id: productId,
      movement_type: movementType,
      quantity: parseInt(quantity),
      reference,
      notes,
    });
    setShowForm(false);
    setQuantity("1");
    setReference("");
    setNotes("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stock Movements"
        description="Record and view inventory movements"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} /> Record Movement
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleRecord} className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-xs font-medium">Product</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="">Select...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Type</label>
              <select value={movementType} onChange={(e) => setMovementType(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="stock_in">Stock In</option>
                <option value="stock_out">Stock Out</option>
                <option value="return">Return</option>
                <option value="damage">Damage</option>
                <option value="theft">Theft</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Reference</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={record.isPending || !productId} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {record.isPending ? "..." : "Save"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movements..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "created_at", label: "Date" },
          { key: "product_name", label: "Product" },
          { key: "movement_type", label: "Type", render: (m: any) => <Badge variant={(movementTypeBadge[m.movement_type] || "default") as any}>{m.movement_type}</Badge> },
          { key: "quantity", label: "Qty" },
          { key: "quantity_change", label: "Change", render: (m: any) => <span className={m.quantity_change > 0 ? "text-green-600" : "text-red-600"}>{m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}</span> },
          { key: "balance_after", label: "Balance" },
          { key: "reference", label: "Ref" },
          { key: "performed_by_name", label: "By" },
        ]}
        data={movements}
        keyExtractor={(m) => m.id}
        isLoading={isLoading}
      />
    </div>
  );
}
