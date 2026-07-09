import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateExpense } from "@/domain/hooks/use-expenses";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft } from "lucide-react";

const categories = [
  { value: "rent", label: "Rent" },
  { value: "transport", label: "Transport" },
  { value: "utilities", label: "Utilities" },
  { value: "salaries", label: "Salaries" },
  { value: "maintenance", label: "Maintenance" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export default function ExpenseFormPage() {
  const navigate = useNavigate();
  const create = useCreateExpense();

  const [category, setCategory] = useState("miscellaneous");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("amount", amount);
      formData.append("description", description);
      formData.append("date", date);
      if (receipt) formData.append("receipt", receipt);
      await create.mutateAsync(formData);
      navigate("/expenses");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="New Expense"
        actions={<button onClick={() => navigate("/expenses")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back</button>}
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Amount *</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Receipt</label>
            <input type="file" accept="image/*,.pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} className="mt-1 w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/expenses")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving || !amount} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Create Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
