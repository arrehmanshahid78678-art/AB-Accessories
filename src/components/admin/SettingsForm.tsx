"use client";

import { useState } from "react";
import { Loader2, Save, Check } from "lucide-react";
import type { SiteSettings } from "@/lib/data";
import { nuclearReload } from "@/lib/force-refresh";

export function SettingsForm({ settings: s }: { settings: SiteSettings }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    siteName: s.siteName,
    logoText: s.logoText,
    logoUrl: s.logoUrl ?? "",
    primaryColor: s.primaryColor,
    heroTitle: s.heroTitle,
    heroSubtitle: s.heroSubtitle,
    heroImage: s.heroImage ?? "",
    heroCtaText: s.heroCtaText,
    phone: s.phone,
    email: s.email,
    address: s.address,
    whatsapp: s.whatsapp,
    currency: s.currency,
    shippingFee: String(s.shippingFee),
    freeShippingThreshold: String(s.freeShippingThreshold),
    facebook: s.social?.facebook ?? "",
    instagram: s.social?.instagram ?? "",
    twitter: s.social?.twitter ?? "",
    youtube: s.social?.youtube ?? "",
    tiktok: s.social?.tiktok ?? "",
    footerLinks: JSON.stringify(s.footerLinks ?? [], null, 2),
  });

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    let footerLinks: unknown;
    try {
      footerLinks = JSON.parse(f.footerLinks);
    } catch {
      setError("Footer Links JSON is invalid. Please fix the syntax.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: f.siteName,
          logoText: f.logoText,
          logoUrl: f.logoUrl || null,
          primaryColor: f.primaryColor,
          heroTitle: f.heroTitle,
          heroSubtitle: f.heroSubtitle,
          heroImage: f.heroImage || null,
          heroCtaText: f.heroCtaText,
          phone: f.phone,
          email: f.email,
          address: f.address,
          whatsapp: f.whatsapp,
          currency: f.currency,
          shippingFee: Number(f.shippingFee),
          freeShippingThreshold: Number(f.freeShippingThreshold),
          social: {
            facebook: f.facebook,
            instagram: f.instagram,
            twitter: f.twitter,
            youtube: f.youtube,
            tiktok: f.tiktok,
          },
          footerLinks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.issues?.[0]?.message ?? data.error ?? "Could not save settings.");
        setSaving(false);
        return;
      }
      setSaved(true);
      // Show "saved" feedback briefly, then force a nuclear reload so the
      // storefront + admin pages both pick up the new settings.
      setTimeout(() => nuclearReload(), 800);
    } catch {
      setError("A network error occurred.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">Settings saved successfully.</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Branding">
          <Field label="Website Name" value={f.siteName} onChange={(v) => set("siteName", v)} />
          <Field label="Logo Text" value={f.logoText} onChange={(v) => set("logoText", v)} />
          <Field label="Logo Image URL (optional)" value={f.logoUrl} onChange={(v) => set("logoUrl", v)} />
          <div>
            <Label>Brand Color</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={f.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" />
              <input value={f.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className={inp} />
            </div>
          </div>
        </Card>

        <Card title="Hero Banner">
          <Field label="Hero Title" value={f.heroTitle} onChange={(v) => set("heroTitle", v)} />
          <div>
            <Label>Hero Subtitle</Label>
            <textarea value={f.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} rows={3} className={inp} />
          </div>
          <Field label="Hero Image URL" value={f.heroImage} onChange={(v) => set("heroImage", v)} />
          <Field label="Hero Button Text" value={f.heroCtaText} onChange={(v) => set("heroCtaText", v)} />
        </Card>

        <Card title="Contact Information">
          <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
          <Field label="Email" value={f.email} onChange={(v) => set("email", v)} />
          <Field label="Address" value={f.address} onChange={(v) => set("address", v)} />
          <Field label="WhatsApp Number (with country code, digits only)" value={f.whatsapp} onChange={(v) => set("whatsapp", v)} />
        </Card>

        <Card title="Commerce">
          <Field label="Currency Symbol" value={f.currency} onChange={(v) => set("currency", v)} />
          <Field label="Shipping Fee" value={f.shippingFee} onChange={(v) => set("shippingFee", v)} type="number" />
          <Field label="Free Shipping Over" value={f.freeShippingThreshold} onChange={(v) => set("freeShippingThreshold", v)} type="number" />
        </Card>

        <Card title="Social Media Links">
          <Field label="Facebook" value={f.facebook} onChange={(v) => set("facebook", v)} />
          <Field label="Instagram" value={f.instagram} onChange={(v) => set("instagram", v)} />
          <Field label="Twitter / X" value={f.twitter} onChange={(v) => set("twitter", v)} />
          <Field label="YouTube" value={f.youtube} onChange={(v) => set("youtube", v)} />
          <Field label="TikTok" value={f.tiktok} onChange={(v) => set("tiktok", v)} />
        </Card>

        <Card title="Footer Links (JSON)">
          <p className="mb-2 text-xs text-slate-500">
            Edit the footer link groups below. Each group has a <code>title</code> and a{" "}
            <code>links</code> array of {"{ label, url }"} objects.
          </p>
          <textarea
            value={f.footerLinks}
            onChange={(e) => set("footerLinks", e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs outline-none focus:border-brand-400"
          />
        </Card>
      </div>

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl brand-gradient px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-semibold text-slate-700">{children}</label>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inp} />
    </div>
  );
}
