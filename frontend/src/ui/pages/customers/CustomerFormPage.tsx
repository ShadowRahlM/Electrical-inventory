import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCustomer, useCreateCustomer, useUpdateCustomer } from "@/domain/hooks/use-customers";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";

const emptyForm = {
  name: "", phone: "", email: "", address: "",
  credit_limit: "", loyalty_points: "0",
};

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: customerData } = useCustomer(id || "");
  const create = useCreateCustomer();
  const update = useUpdateCustomer(id || "");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && customerData) {
      const c = customerData;
      setForm({
        name: c.name || "",
        phone: c.phone || "",
        email: c.email || "",
        address: c.address || "",
        credit_limit: c.credit_limit || "0",
        loyalty_points: String(c.loyalty_points || "0"),
      });
    }
  }, [isEdit, customerData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        loyalty_points: form.loyalty_points ? Number(form.loyalty_points) : 0,
      };
      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
      navigate("/customers");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !customerData) {
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
        title={isEdit ? "Edit Customer" : "New Customer"}
        actions={
          <button onClick={() => navigate("/customers")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {input("Name *", "name", { required: true })}
          {input("Phone", "phone")}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Email", "email", { type: "email" })}
          {input("Credit Limit", "credit_limit", { type: "number" })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Loyalty Points", "loyalty_points", { type: "number" })}
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate("/customers")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
