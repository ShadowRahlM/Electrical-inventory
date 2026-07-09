import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useCreateProduct, useUpdateProduct, useCategories } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";

const emptyForm = {
  sku: "", barcode: "", name: "", description: "", brand: "",
  category: "", unit: "pcs",
  cost_price: "0", selling_price: "0", wholesale_price: "", retail_price: "",
  min_stock: "0", reorder_level: "0",
  supplier: "", vat_rate: "0", warranty_period: "", location: "", status: "active",
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: productData } = useProduct(id || "");
  const create = useCreateProduct();
  const update = useUpdateProduct(id || "");
  const { data: catData } = useCategories();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && productData) {
      const p = productData;
      setForm({
        sku: p.sku || "", barcode: p.barcode || "", name: p.name || "",
        description: p.description || "", brand: p.brand || "",
        category: p.category || "", unit: p.unit || "pcs",
        cost_price: p.cost_price || "0", selling_price: p.selling_price || "0",
        wholesale_price: p.wholesale_price || "", retail_price: p.retail_price || "",
        min_stock: String(p.min_stock || "0"), reorder_level: String(p.reorder_level || "0"),
        supplier: p.supplier || "", vat_rate: p.vat_rate || "0",
        warranty_period: p.warranty_period ? String(p.warranty_period) : "",
        location: p.location || "", status: p.status || "active",
      });
    }
  }, [isEdit, productData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category || null,
        wholesale_price: form.wholesale_price || null,
        retail_price: form.retail_price || null,
        warranty_period: form.warranty_period ? Number(form.warranty_period) : null,
      };
      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
      navigate("/products");
    } finally {
      setSaving(false);
    }
  };

  const categories = catData?.results || [];

  const input = (label: string, name: string, opts?: { type?: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={opts?.type || "text"}
        name={name}
        value={(form as any)[name] || ""}
        onChange={handleChange}
        required={opts?.required}
        placeholder={opts?.placeholder}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );

  if (isEdit && !productData) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={isEdit ? "Edit Product" : "New Product"}
        actions={
          <button onClick={() => navigate("/products")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {input("SKU *", "sku", { required: true })}
          {input("Barcode", "barcode")}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Product Name *", "name", { required: true })}
          {input("Brand", "brand")}
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">None</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {input("Unit", "unit")}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {input("Cost Price *", "cost_price", { type: "number", required: true })}
          {input("Selling Price *", "selling_price", { type: "number", required: true })}
          {input("VAT Rate (%)", "vat_rate", { type: "number" })}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {input("Wholesale Price", "wholesale_price", { type: "number" })}
          {input("Retail Price", "retail_price", { type: "number" })}
          {input("Warranty (months)", "warranty_period", { type: "number" })}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {input("Min Stock", "min_stock", { type: "number" })}
          {input("Reorder Level", "reorder_level", { type: "number" })}
          {input("Location", "location")}
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/products")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
