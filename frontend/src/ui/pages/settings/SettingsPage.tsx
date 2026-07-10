import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/domain/hooks/use-settings";
import PageHeader from "@/ui/components/ui/PageHeader";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure your shop preferences"
        actions={
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">General</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Shop Name</label>
            <input value={form.shop_name || ""} onChange={(e) => handleChange("shop_name", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input value={form.shop_phone || ""} onChange={(e) => handleChange("shop_phone", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={form.shop_email || ""} onChange={(e) => handleChange("shop_email", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium">Address</label>
            <textarea value={form.shop_address || ""} onChange={(e) => handleChange("shop_address", e.target.value)} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Currency</label>
            <input value={form.currency || ""} onChange={(e) => handleChange("currency", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Tax Name</label>
            <input value={form.tax_name || ""} onChange={(e) => handleChange("tax_name", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Tax Rate (%)</label>
            <input value={form.tax_rate || ""} onChange={(e) => handleChange("tax_rate", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <input value={form.timezone || ""} onChange={(e) => handleChange("timezone", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Inventory</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Low Stock Threshold</label>
            <input type="number" value={form.low_stock_threshold ?? 10} onChange={(e) => handleChange("low_stock_threshold", parseInt(e.target.value) || 0)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Reorder Level</label>
            <input type="number" value={form.reorder_level ?? 5} onChange={(e) => handleChange("reorder_level", parseInt(e.target.value) || 0)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.allow_negative_inventory ?? false} onChange={(e) => handleChange("allow_negative_inventory", e.target.checked)} className="rounded border-gray-300" />
              Allow Negative Inventory
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Sales</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Invoice Prefix</label>
            <input value={form.invoice_prefix || ""} onChange={(e) => handleChange("invoice_prefix", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium">Default Credit Limit</label>
            <input value={form.default_credit_limit || ""} onChange={(e) => handleChange("default_credit_limit", e.target.value)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.enable_credit_sales ?? true} onChange={(e) => handleChange("enable_credit_sales", e.target.checked)} className="rounded border-gray-300" />
              Enable Credit Sales
            </label>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label className="text-sm font-medium">Receipt Footer</label>
            <textarea value={form.receipt_footer || ""} onChange={(e) => handleChange("receipt_footer", e.target.value)} rows={2} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.low_stock_alerts ?? true} onChange={(e) => handleChange("low_stock_alerts", e.target.checked)} className="rounded border-gray-300" />
              Low Stock Alerts
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
