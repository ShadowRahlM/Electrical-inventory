import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useDeleteProduct } from "@/domain/hooks/use-products";
import { useStockMovements } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import DataTable from "@/ui/components/ui/DataTable";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProduct(id || "");
  const deleteProduct = useDeleteProduct();
  const { data: movData } = useStockMovements(id ? { product_id: id } : undefined);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const product = data;
  const movements = movData?.results || [];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!product) {
    return <div className="text-center text-muted-foreground">Product not found</div>;
  }

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteProduct.mutateAsync(id);
      navigate("/products");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const statusBadge = () => {
    if (product.is_out_of_stock) return <Badge variant="danger">Out of Stock</Badge>;
    if (product.is_low_stock) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock ({product.quantity})</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku}${product.barcode ? ` | Barcode: ${product.barcode}` : ""}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/products")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => navigate(`/products/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
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
          <p className="text-xs text-muted-foreground">Stock Status</p>
          <div className="mt-1">{statusBadge()}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Selling Price</p>
          <p className="mt-1 text-xl font-bold">{product.selling_price}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Margin</p>
          <p className="mt-1 text-xl font-bold">{product.margin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Product Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Brand</dt><dd>{product.brand || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Category</dt><dd>{product.category_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Unit</dt><dd>{product.unit}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Location</dt><dd>{product.location || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Supplier</dt><dd>{product.supplier_name || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">VAT Rate</dt><dd>{product.vat_rate}%</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Warranty</dt><dd>{product.warranty_period ? `${product.warranty_period} months` : "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{product.status}</dd></div>
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold">Pricing</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Cost Price</dt><dd>{product.cost_price}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Selling Price</dt><dd>{product.selling_price}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Wholesale</dt><dd>{product.wholesale_price || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Retail</dt><dd>{product.retail_price || "-"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Reorder Level</dt><dd>{product.reorder_level}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Min Stock</dt><dd>{product.min_stock}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 font-semibold">Stock Movement History</h3>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No movements recorded</p>
        ) : (
          <DataTable
            columns={[
              { key: "created_at", label: "Date" },
              { key: "movement_type", label: "Type" },
              { key: "quantity", label: "Qty" },
              { key: "quantity_change", label: "Change" },
              { key: "balance_after", label: "Balance" },
              { key: "reference", label: "Reference" },
            ]}
            data={movements}
            keyExtractor={(m: any) => m.id}
          />
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleting}
      />
    </div>
  );
}
