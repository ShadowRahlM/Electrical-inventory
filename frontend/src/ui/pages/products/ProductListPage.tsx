import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import EmptyState from "@/ui/components/ui/EmptyState";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

export default function ProductListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("");
  const { data, isLoading } = useProducts({ search, ordering: order || undefined });

  const products = data?.results || [];

  const columns = [
    { key: "sku", label: "SKU", sortable: true },
    { key: "name", label: "Name", sortable: true, render: (p: any) => <span className="font-medium">{p.name}</span> },
    { key: "brand", label: "Brand", sortable: true },
    { key: "selling_price", label: "Price", sortable: true },
    { key: "quantity", label: "Qty", sortable: true },
    {
      key: "status", label: "Status",
      render: (p: any) => {
        if (p.is_out_of_stock) return <Badge variant="danger">Out</Badge>;
        if (p.is_low_stock) return <Badge variant="warning">Low</Badge>;
        return <Badge variant="success">{p.quantity}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actions={
          <button
            onClick={() => navigate("/products/new")}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Product
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {!isLoading && products.length === 0 && !search ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start managing inventory."
          action={
            <button
              onClick={() => navigate("/products/new")}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Add Product
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={products}
          keyExtractor={(p) => p.id}
          isLoading={isLoading}
          onSort={(key) => setOrder(key)}
          onRowClick={(p) => navigate(`/products/${p.id}`)}
        />
      )}
    </div>
  );
}
