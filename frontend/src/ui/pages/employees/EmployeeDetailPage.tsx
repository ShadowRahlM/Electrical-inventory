import { useNavigate, useParams } from "react-router-dom";
import { useEmployee, useDeleteEmployee, useClockIn, useClockOut } from "@/domain/hooks/use-employees";
import PageHeader from "@/ui/components/ui/PageHeader";
import Badge from "@/ui/components/ui/Badge";
import ConfirmDialog from "@/ui/components/ui/ConfirmDialog";
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id || "");
  const deleteEmployee = useDeleteEmployee();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!employee) {
    return <div className="text-center text-muted-foreground">Employee not found</div>;
  }

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteEmployee.mutateAsync(id);
      navigate("/employees");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const today = employee.attendance_today;
  const isClockedIn = today && today.time_in && !today.time_out;
  const isComplete = today && today.time_in && today.time_out;

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        description={employee.role}
        actions={
          <div className="flex gap-2">
            <button onClick={() => navigate("/employees")} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => navigate(`/employees/${id}/edit`)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted">
              <Edit size={15} /> Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
              <Trash2 size={15} /> Delete
            </button>
          </div>
        }
      />

      <div className="flex gap-2">
        {!isComplete && (
          <button
            onClick={() => clockIn.mutate({ employee_id: id! })}
            disabled={isClockedIn || clockIn.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {clockIn.isPending ? "..." : isClockedIn ? "Clocked In" : "Clock In"}
          </button>
        )}
        {isClockedIn && (
          <button
            onClick={() => clockOut.mutate({ employee_id: id! })}
            disabled={clockOut.isPending}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            {clockOut.isPending ? "..." : "Clock Out"}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Role</p>
          <p className="mt-1 text-xl font-bold capitalize">{employee.role}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Salary</p>
          <p className="mt-1 text-xl font-bold">{employee.salary}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Hire Date</p>
          <p className="mt-1 text-xl font-bold">{employee.hire_date}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="mt-1">{today ? <Badge variant={isComplete ? "success" : isClockedIn ? "warning" : "default"}>{isComplete ? "Completed" : isClockedIn ? "Working" : "Not Started"}</Badge> : <Badge variant="danger">Absent</Badge>}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 font-semibold">Employee Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{employee.name}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{employee.phone || "-"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{employee.email || "-"}</dd></div>
          {today && (
            <>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time In</dt><dd>{today.time_in || "-"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Time Out</dt><dd>{today.time_out || "-"}</dd></div>
            </>
          )}
        </dl>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employee.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        isLoading={deleting}
      />
    </div>
  );
}
