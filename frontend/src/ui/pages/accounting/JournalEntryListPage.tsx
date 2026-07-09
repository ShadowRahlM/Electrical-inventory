import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJournalEntries } from "@/domain/hooks/use-accounting";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search } from "lucide-react";

export default function JournalEntryListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useJournalEntries({ search });

  const entries = data?.results || data || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Journal Entries"
        description="Double-entry accounting records"
        actions={
          <button onClick={() => navigate("/accounting/journal/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus size={16} /> New Entry
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search journal entries..." className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm" />
      </div>

      <DataTable
        columns={[
          { key: "entry_number", label: "Entry #" },
          { key: "entry_date", label: "Date", sortable: true },
          { key: "description", label: "Description" },
          { key: "reference_type", label: "Reference" },
          {
            key: "is_posted", label: "Status",
            render: (e: any) => e.is_posted ? <Badge variant="success">Posted</Badge> : <Badge variant="warning">Draft</Badge>,
          },
          { key: "created_by_name", label: "Created By" },
        ]}
        data={entries}
        keyExtractor={(e: any) => String(e.id)}
        isLoading={isLoading}
      />
    </div>
  );
}
