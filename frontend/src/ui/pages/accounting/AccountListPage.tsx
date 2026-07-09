import { useState } from "react";
import { useAccounts, useCreateAccount } from "@/domain/hooks/use-accounting";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Loader2 } from "lucide-react";

const typeColors: Record<string, string> = {
  asset: "success",
  liability: "danger",
  equity: "info",
  revenue: "warning",
  expense: "default",
};

export default function AccountListPage() {
  const { data, isLoading } = useAccounts();
  const create = useCreateAccount();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("asset");

  const accounts = data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ code, name, account_type: accountType });
    setCode("");
    setName("");
    setAccountType("asset");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chart of Accounts"
        description="Manage accounting accounts"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Account
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-medium">Code *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium">Type *</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm">
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={create.isPending} className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{create.isPending ? "..." : "Save"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <DataTable
        columns={[
          { key: "code", label: "Code", sortable: true },
          { key: "name", label: "Name", sortable: true },
          {
            key: "account_type", label: "Type",
            render: (a: any) => <Badge variant={(typeColors[a.account_type] || "default") as any}>{a.account_type_display || a.account_type}</Badge>,
          },
          { key: "parent", label: "Parent", render: (a: any) => a.parent ? a.parent_name || String(a.parent) : "-" },
          { key: "is_active", label: "Active", render: (a: any) => a.is_active ? "Yes" : "No" },
        ]}
        data={accounts}
        keyExtractor={(a: any) => String(a.id)}
        isLoading={isLoading}
      />
    </div>
  );
}
