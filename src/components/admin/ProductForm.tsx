"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Save, ArrowLeft, Plus, X, ArrowUp, Info } from "lucide-react";
import type { Category, Product } from "@/lib/data";
import { nuclearReload } from "@/lib/force-refresh";

type FormState = {
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  price: string;
  salePrice: string;
  stock: string;
  rating: string;
  reviewCount: string;
  description: string;
  featured: boolean;
  enabled: boolean;
  compatibility: string;
  material: string;
  color: string;
  chargingSpeed: string;
  cableLength: string;
  warranty: string;
  features: string;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  brand: "",
  categoryId: "",
  price: "",
  salePrice: "",
  stock: "0",
  rating: "4.5",
  reviewCount: "0",
  description: "",
  featured: false,
  enabled: true,
  compatibility: "",
  material: "",
  color: "",
  chargingSpeed: "",
  cableLength: "",
  warranty: "",
  features: "",
};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imgInput, setImgInput] = useState("");

  const [f, setF] = useState<FormState>(() => {
    if (!product) return EMPTY;
    const s = product.specifications;
    return {
      title: product.title,
      slug: product.slug,
      brand: product.brand ?? "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      price: String(product.price),
      salePrice: product.salePrice != null ? String(product.salePrice) : "",
      stock: String(product.stock),
      rating: String(product.rating),
      reviewCount: String(product.reviewCount),
      description: product.description ?? "",
      featured: product.featured,
      enabled: product.enabled,
      compatibility: s?.compatibility ?? "",
      material: s?.material ?? "",
      color: s?.color ?? "",
      chargingSpeed: s?.chargingSpeed ?? "",
      cableLength: s?.cableLength ?? "",
      warranty: s?.warranty ?? "",
      features: s?.features?.join(", ") ?? "",
    };
  });

  const set = (k: keyof FormState, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const addImage = () => {
    const u = imgInput.trim();
    if (!u) return;
    setImages((prev) => [...prev, u]);
    setImgInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!f.title.trim()) return setError("Product title is required.");
    const priceNum = Number(f.price);
    if (!Number.isFinite(priceNum) || priceNum < 0)
      return setError("Please enter a valid price.");

    setSaving(true);
    const payload = {
      title: f.title.trim(),
      slug: f.slug.trim() || undefined,
      description: f.description.trim() || "",
      categoryId: f.categoryId ? Number(f.categoryId) : null,
      brand: f.brand.trim() || "",
      price: priceNum,
      salePrice: f.salePrice ? Number(f.salePrice) : null,
      stock: Number(f.stock) || 0,
      rating: Number(f.rating) || 4.5,
      reviewCount: Number(f.reviewCount) || 0,
      featured: f.featured,
      enabled: f.enabled,
      specifications: {
        compatibility: f.compatibility || undefined,
        material: f.material || undefined,
        color: f.color || undefined,
        chargingSpeed: f.chargingSpeed || undefined,
        cableLength: f.cableLength || undefined,
        warranty: f.warranty || undefined,
        features: f.features
          ? f.features.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      },
      images,
    };

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.issues?.[0]?.message ?? data.error ?? "Could not save product.";
        setError(msg);
        setSaving(false);
        return;
      }
      // Nuclear reload: invalidate server cache + hard browser reload
      setTimeout(() => nuclearReload("/admin/products"), 300);
    } catch {
      setError("A network error occurred.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-brand-600">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {product ? "Edit Product" : "New Product"}
            </h1>
            <p className="text-sm text-slate-500">
              {product ? `Updating “${product.title}”` : "Add a new product to your catalog"}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl brand-gradient px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Product"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Basic Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Title *</Label>
                <Input value={f.title} onChange={(v) => set("title", v)} placeholder="e.g. 20W USB-C Fast Charger" />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={f.brand} onChange={(v) => set("brand", v)} placeholder="e.g. Anker" />
              </div>
              <div>
                <Label>Slug (optional)</Label>
                <Input value={f.slug} onChange={(v) => set("slug", v)} placeholder="auto-generated from title" />
              </div>
              <div className="sm:col-span-2">
                <Label>Category</Label>
                <select
                  value={f.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={f.description} onChange={(v) => set("description", v)} rows={4} placeholder="Describe the product…" />
              </div>
            </div>
          </Card>

          <Card title="Pricing & Inventory">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Price (Rs.) *</Label>
                <Input type="number" value={f.price} onChange={(v) => set("price", v)} placeholder="2499" />
              </div>
              <div>
                <Label>Sale Price (optional)</Label>
                <Input type="number" value={f.salePrice} onChange={(v) => set("salePrice", v)} placeholder="1799" />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input type="number" value={f.stock} onChange={(v) => set("stock", v)} />
              </div>
              <div>
                <Label>Rating (0–5)</Label>
                <Input type="number" value={f.rating} onChange={(v) => set("rating", v)} />
              </div>
              <div>
                <Label>Review Count</Label>
                <Input type="number" value={f.reviewCount} onChange={(v) => set("reviewCount", v)} />
              </div>
            </div>
          </Card>

          <Card title="Specifications">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Compatibility" value={f.compatibility} onChange={(v) => set("compatibility", v)} />
              <Field label="Material" value={f.material} onChange={(v) => set("material", v)} />
              <Field label="Color" value={f.color} onChange={(v) => set("color", v)} />
              <Field label="Charging Speed" value={f.chargingSpeed} onChange={(v) => set("chargingSpeed", v)} />
              <Field label="Cable Length" value={f.cableLength} onChange={(v) => set("cableLength", v)} />
              <Field label="Warranty" value={f.warranty} onChange={(v) => set("warranty", v)} />
              <div className="sm:col-span-2">
                <Label>Features (comma separated)</Label>
                <Input value={f.features} onChange={(v) => set("features", v)} placeholder="Fast charging, Over-current protection, Compact" />
              </div>
            </div>
          </Card>

          <Card title="Product Images">
            <p className="mb-3 text-xs text-slate-500">
              Paste image URLs (the first image is the primary product photo). Upload to your own
              host or use a direct image link.
            </p>
            <div className="flex gap-2">
              <input
                value={imgInput}
                onChange={(e) => setImgInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="https://…/image.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400"
              />
              <button type="button" onClick={addImage} className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Plus size={16} /> Add
              </button>
            </div>
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((img, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <Image src={img} alt={`image ${i + 1}`} fill sizes="120px" className="object-cover" unoptimized />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                      <button type="button" onClick={() => setImages((p) => { const c = [...p]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; })} disabled={i === 0} className="rounded bg-white/90 p-1 text-slate-700 disabled:opacity-30" title="Move first">
                        <ArrowUp size={12} />
                      </button>
                      <button type="button" onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))} className="rounded bg-white/90 p-1 text-rose-600" title="Remove">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <Card title="Visibility">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Featured product</span>
              <Toggle checked={f.featured} onChange={(v) => set("featured", v)} />
            </label>
            <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Enabled (visible)</span>
              <Toggle checked={f.enabled} onChange={(v) => set("enabled", v)} />
            </label>
          </Card>

          <Card title="Image tips">
            <div className="flex gap-2 text-xs text-slate-500">
              <Info size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <p>
                Use square images (1000×1000) on a clean background for the best look. You can paste
                a URL from your image host, or a public direct link to a JPG/PNG.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}

/* --- small UI helpers --- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-semibold text-slate-700">{children}</label>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
    />
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={onChange} />
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "brand-gradient" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
