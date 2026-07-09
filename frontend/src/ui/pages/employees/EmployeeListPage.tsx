import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees, useDeleteEmployee } from "@/domain/hooks/use-employees";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import Badge from "@/ui/components/ui/Badge";
import { Plus, Search, Clock } from "lucide-react";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useEmployees({ search });
  const deleteEmployee = useDeleteEmployee();

  const employees = data?.results || [];

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteEmployee.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Employees"
        description="Manage staff and attendance"
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/employees/attendance")} className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted">
              <Clock size={16} /> Attendance
            </button>
            <button onClick={() => navigate("/employees/new")} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus size={16} /> New Employee
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "role", label: "Role", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "salary", label: "Salary", sortable: true },
          { key: "hire_date", label: "Hired", sortable: true },
          {
            key: "attendance_today", label: "Today",
            render: (e: any) =>
              e.attendance_today ? (
                e.attendance_today.time_in && !e.attendance_today.time_out
                  ? <Badge variant="warning">Clocked In</Badge>
                  : e.attendance_today.time_in && e.attendance_today.time_out
                    ? <Badge variant="success">Done</Badge>
                    : <Badge variant="default">Present</Badge>
              ) : <Badge variant="danger">Absent</Badge>,
          },
          {
            key: "actions", label: "",
            render: (e: any) => (
              <div className="flex gap-2">
                <button onClick={() => navigate(`/employees/${e.id}/edit`)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                <button onClick={() => setDeleteId(e.id)} className="text-xs text-destructive hover:text-destructive/80">Delete</button>
              </div>
            ),
          },
        ]}
        data={employees}
        keyExtractor={(e: any) => e.id}
        isLoading={isLoading}
        onRowClick={(e: any) => navigate(`/employees/${e.id}`)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Employee"
        message="Are you sure you want to delete this employee?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={deleteEmployee.isPending}
      />
    </div>
  );
}
