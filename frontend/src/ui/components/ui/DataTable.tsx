import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string, direction: SortDirection) => void;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export default function DataTable<T>({
  columns, data, keyExtractor, onSort, onRowClick, isLoading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : sortKey === key && sortDir === "desc" ? null : "asc";
    setSortKey(key);
    setSortDir(dir);
    onSort?.(key, dir);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown size={14} className="ml-1 inline opacity-40" />;
    if (sortDir === "asc") return <ChevronUp size={14} className="ml-1 inline" />;
    if (sortDir === "desc") return <ChevronDown size={14} className="ml-1 inline" />;
    return <ChevronsUpDown size={14} className="ml-1 inline opacity-40" />;
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 border-b p-4 last:border-0">
            {columns.map((c) => (
              <div key={c.key} className="h-4 flex-1 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) return null;

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-muted-foreground ${col.className || ""} ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && <SortIcon columnKey={col.key} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`border-b transition-colors last:border-0 hover:bg-muted/30 ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
