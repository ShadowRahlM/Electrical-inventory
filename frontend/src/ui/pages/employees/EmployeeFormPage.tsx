import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployee, useCreateEmployee, useUpdateEmployee } from "@/domain/hooks/use-employees";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";

const emptyForm = {
  name: "", role: "", phone: "", email: "",
  salary: "", hire_date: "",
};

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: employeeData } = useEmployee(id || "");
  const create = useCreateEmployee();
  const update = useUpdateEmployee(id || "");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && employeeData) {
      const e = employeeData;
      setForm({
        name: e.name || "",
        role: e.role || "",
        phone: e.phone || "",
        email: e.email || "",
        salary: e.salary || "0",
        hire_date: e.hire_date || "",
      });
    }
  }, [isEdit, employeeData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await update.mutateAsync(form);
      } else {
        await create.mutateAsync(form);
      }
      navigate("/employees");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !employeeData) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const input = (label: string, name: string, opts?: { type?: string; required?: boolean }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={opts?.type || "text"}
        name={name}
        value={(form as any)[name] || ""}
        onChange={handleChange}
        required={opts?.required}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={isEdit ? "Edit Employee" : "New Employee"}
        actions={
          <button onClick={() => navigate("/employees")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {input("Name *", "name", { required: true })}
          {input("Role *", "role", { required: true })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Phone", "phone")}
          {input("Email", "email", { type: "email" })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Salary", "salary", { type: "number" })}
          {input("Hire Date", "hire_date", { type: "date" })}
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/employees")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
