import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupplier, useCreateSupplier, useUpdateSupplier } from "@/domain/hooks/use-suppliers";
import PageHeader from "@/ui/components/ui/PageHeader";
import { ArrowLeft, Loader2 } from "lucide-react";

const emptyForm = {
  company: "", contact_person: "", phone: "", email: "",
  address: "", tax_number: "", balance: "0",
};

export default function SupplierFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: supplierData } = useSupplier(id || "");
  const create = useCreateSupplier();
  const update = useUpdateSupplier(id || "");
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && supplierData) {
      const s = supplierData;
      setForm({
        company: s.company || "",
        contact_person: s.contact_person || "",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || "",
        tax_number: s.tax_number || "",
        balance: s.balance || "0",
      });
    }
  }, [isEdit, supplierData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      navigate("/suppliers");
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && !supplierData) {
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
        title={isEdit ? "Edit Supplier" : "New Supplier"}
        actions={
          <button onClick={() => navigate("/suppliers")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {input("Company *", "company", { required: true })}
          {input("Contact Person", "contact_person")}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Phone", "phone")}
          {input("Email", "email", { type: "email" })}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Tax Number", "tax_number")}
          {input("Balance", "balance", { type: "number" })}
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
          <button type="button" onClick={() => navigate("/suppliers")} className="rounded-md border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : isEdit ? "Update Supplier" : "Create Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}
