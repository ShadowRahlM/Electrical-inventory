import { useState } from "react";
import { useAttendanceRecords, useEmployees, useClockIn, useClockOut } from "@/domain/hooks/use-employees";
import PageHeader from "@/ui/components/ui/PageHeader";
import DataTable from "@/ui/components/ui/DataTable";
import Badge from "@/ui/components/ui/Badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AttendancePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: attData, isLoading } = useAttendanceRecords({ date });
  const { data: empData } = useEmployees();
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const records = attData?.results || [];
  const employees = empData?.results || [];

  const handleClockIn = (employeeId: string) => clockIn.mutate({ employee_id: employeeId });
  const handleClockOut = (employeeId: string) => clockOut.mutate({ employee_id: employeeId });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Attendance"
        description="Daily attendance tracking"
        actions={
          <button onClick={() => navigate("/employees")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back to Employees
          </button>
        }
      />

      <div className="max-w-xs">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Employees</p>
          <p className="mt-1 text-2xl font-bold">{employees.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Present Today</p>
          <p className="mt-1 text-2xl font-bold">{records.filter((r: any) => r.is_present).length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Clocked In</p>
          <p className="mt-1 text-2xl font-bold">{records.filter((r: any) => r.time_in && !r.time_out).length}</p>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "employee_name", label: "Employee" },
          {
            key: "is_present", label: "Status",
            render: (r: any) => r.is_present ? <Badge variant="success">Present</Badge> : <Badge variant="danger">Absent</Badge>,
          },
          { key: "time_in", label: "Time In" },
          { key: "time_out", label: "Time Out" },
          {
            key: "actions", label: "",
            render: (r: any) => (
              <div className="flex gap-2">
                {r.is_present && !r.time_out ? (
                  <button onClick={() => handleClockOut(r.employee)} className="text-xs text-muted-foreground hover:text-foreground">
                    Clock Out
                  </button>
                ) : !r.is_present ? (
                  <button onClick={() => handleClockIn(r.employee)} className="text-xs text-muted-foreground hover:text-foreground">
                    Clock In
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        data={records}
        keyExtractor={(r: any) => r.id}
        isLoading={isLoading}
      />
    </div>
  );
}
