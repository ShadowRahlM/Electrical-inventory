import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateJournalEntry, useAccounts } from "@/domain/hooks/use-accounting";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";

interface Line {
  account: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

export default function JournalEntryFormPage() {
  const navigate = useNavigate();
  const create = useCreateJournalEntry();
  const { data: accountsData } = useAccounts();

  const [entryNumber, setEntryNumber] = useState("");
  const [description, setDescription] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<Line[]>([{ account: "", account_name: "", description: "", debit: 0, credit: 0 }]);
  const [saving, setSaving] = useState(false);

  const accounts = accountsData || [];
  const totalDebits = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredits = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const addLine = () => {
    setLines([...lines, { account: "", account_name: "", description: "", debit: 0, credit: 0 }]);
  };

  const updateLine = (index: number, field: string, value: any) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        const updated = { ...line, [field]: value };
        if (field === "account") {
          const acc = accounts.find((a: any) => String(a.id) === value);
          updated.account_name = acc ? `${acc.code} - ${acc.name}` : "";
        }
        return updated;
      }),
    );
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || lines.length < 2) return;
    setSaving(true);
    try {
      await create.mutateAsync({
        entry_number: entryNumber,
        description,
        entry_date: entryDate,
        lines: lines.map((l) => ({
          account: parseInt(l.account),
          description: l.description,
          debit: l.debit,
          credit: l.credit,
        })),
      });
      navigate("/accounting/journal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="New Journal Entry"
        actions={<button onClick={() => navigate("/accounting/journal")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} /> Back</button>}
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Entry Number *</label>
            <input type="text" value={entryNumber} onChange={(e) => setEntryNumber(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Date *</label>
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Description *</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Lines</label>
            <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-primary hover:underline"><Plus size={14} /> Add Line</button>
          </div>
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={index} className="flex items-start gap-2 rounded-md border bg-background p-2 text-sm">
                <div className="flex-1">
                  <select value={line.account} onChange={(e) => updateLine(index, "account", e.target.value)} required className="w-full rounded border bg-background px-2 py-1 text-xs">
                    <option value="">Select account...</option>
                    {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.account_type})</option>)}
                  </select>
                </div>
                <div className="w-40">
                  <input type="text" value={line.description} onChange={(e) => updateLine(index, "description", e.target.value)} placeholder="Description" className="w-full rounded border bg-background px-2 py-1 text-xs" />
                </div>
                <div className="w-24">
                  <input type="number" step="0.01" value={line.debit || ""} onChange={(e) => updateLine(index, "debit", parseFloat(e.target.value) || 0)} placeholder="Debit" className="w-full rounded border bg-background px-2 py-1 text-xs" />
                </div>
                <div className="w-24">
                  <input type="number" step="0.01" value={line.credit || ""} onChange={(e) => updateLine(index, "credit", parseFloat(e.target.value) || 0)} placeholder="Credit" className="w-full rounded border bg-background px-2 py-1 text-xs" />
                </div>
                {lines.length > 2 && (
                  <button type="button" onClick={() => removeLine(index)} className="mt-1 text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Lines: {lines.length}</span>
            <div className="flex gap-4 font-medium">
              <span>Debits: {totalDebits.toFixed(2)}</span>
              <span>Credits: {totalCredits.toFixed(2)}</span>
              <span className={isBalanced ? "text-green-600" : "text-red-600"}>{isBalanced ? "Balanced" : `Diff: ${(totalDebits - totalCredits).toFixed(2)}`}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/accounting/journal")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving || !isBalanced || lines.length < 2} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Create Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
