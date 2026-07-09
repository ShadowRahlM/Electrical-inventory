import { useState } from "react";
import { useCategoryTree, useCreateCategory } from "@/domain/hooks/use-products";
import PageHeader from "@/ui/components/ui/PageHeader";
import EmptyState from "@/ui/components/ui/EmptyState";
import { Plus, ChevronRight, ChevronDown, FolderTree, Loader2 } from "lucide-react";

function CategoryNode({ category, depth = 0 }: { category: any; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer ${depth > 0 ? "ml-6" : ""}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />
        ) : (
          <span className="w-3.5" />
        )}
        <FolderTree size={15} className="text-muted-foreground" />
        <span>{category.name}</span>
        <span className="text-xs text-muted-foreground">({category.product_count || 0})</span>
      </div>
      {expanded && hasChildren && category.children.map((child: any) => (
        <CategoryNode key={child.id} category={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CategoryListPage() {
  const { data: categories, isLoading } = useCategoryTree();
  const create = useCreateCategory();
  const [name, setName] = useState("");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name, slug: name.toLowerCase().replace(/\s+/g, "-") });
    setName("");
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Categories" description="Organize products into categories" />

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name..."
          className="max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || create.isPending}
          className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        {!categories || categories.length === 0 ? (
          <EmptyState title="No categories" description="Create your first category to organize products." />
        ) : (
          categories.map((cat: any) => <CategoryNode key={cat.id} category={cat} />)
        )}
      </div>
    </div>
  );
}
