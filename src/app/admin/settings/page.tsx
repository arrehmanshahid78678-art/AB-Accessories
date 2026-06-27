import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ClearDataPanel } from "@/components/admin/ClearDataPanel";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Store Settings</h1>
        <p className="text-sm text-slate-500">Customise your storefront, contact info and branding.</p>
      </div>
      <SettingsForm settings={settings} />

      <div className="pt-4">
        <ClearDataPanel />
      </div>
    </div>
  );
}
