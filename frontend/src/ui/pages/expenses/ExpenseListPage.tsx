import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses, useDeleteExpense } from "@/domain/hooks/use-expenses";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { Plus, Search } from "lucide-react";

const categoryColors: Record<string, string> = {
  rent: "warning",
  transport: "info",
  utilities: "info",
  salaries: "success",
  maintenance: "default",
  miscellaneous: "default",
};

export default function ExpenseListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useExpenses({ search });
  const deleteExpense = useDeleteExpense();

  const expenses = data?.results || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteExpense.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Expenses"
        description="Track business expenses"
        actions={
          <button onClick={() => navigate("/expenses/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Expense
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <DataTable
        columns={[
          { key: "date", label: "Date", sortable: true },
          {
            key: "category", label: "Category",
            render: (e: any) => <Badge variant={(categoryColors[e.category] || "default") as any}>{e.category_display || e.category}</Badge>,
          },
          { key: "description", label: "Description" },
          { key: "amount", label: "Amount", sortable: true },
          { key: "recorded_by_name", label: "Recorded By" },
          {
            key: "receipt", label: "Receipt",
            render: (e: any) => e.receipt ? <a href={e.receipt} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a> : "-",
          },
          {
            key: "actions", label: "",
            render: (e: any) => (
              <div className="flex gap-2">
                <button onClick={() => setDeleteId(e.id)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            ),
          },
        ]}
        data={expenses}
        keyExtractor={(e: any) => e.id}
        isLoading={isLoading}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteExpense.isPending}
      />
    </div>
  );
}
