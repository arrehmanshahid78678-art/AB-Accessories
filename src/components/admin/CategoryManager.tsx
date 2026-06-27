"use client";

import { useState } from "react";
import { Loader2, Plus, Pencil, Check, X } from "lucide-react";
import type { Category } from "@/lib/data";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { nuclearReload } from "@/lib/force-refresh";

type CatForm = { name: string; slug: string; description: string; image: string };
const blank: CatForm = { name: "", slug: "", description: "", image: "" };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [edit, setEdit] = useState<CatForm>(blank);

  const set = (target: "form" | "edit", k: keyof CatForm, v: string) =>
    target === "form" ? setForm((p) => ({ ...p, [k]: v })) : setEdit((p) => ({ ...p, [k]: v }));

  const saveNew = async () => {
    setErr(null);
    if (!form.name.trim()) return setErr("Category name is required.");
    setBusy(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.issues?.[0]?.message ?? data.error ?? "Failed to add.");
    setForm(blank);
    setAdding(false);
    setTimeout(() => nuclearReload(), 300);
  };

  const saveEdit = async (id: number) => {
    setErr(null);
    if (!edit.name.trim()) return setErr("Category name is required.");
    setBusy(true);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.issues?.[0]?.message ?? data.error ?? "Failed to save.");
    setEditId(null);
    setTimeout(() => nuclearReload(), 300);
  };

  const startEdit = (c: Category) => {
    setEditId(c.id);
    setEdit({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "" });
  };

  return (
    <div className="space-y-4">
      {err && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{err}</div>}

      {/* Add */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-xl brand-gradient px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
        >
          <Plus size={16} /> Add Category
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.name} onChange={(e) => set("form", "name", e.target.value)} placeholder="Category name *" className={inp} />
            <input value={form.slug} onChange={(e) => set("form", "slug", e.target.value)} placeholder="Slug (auto)" className={inp} />
            <input value={form.image} onChange={(e) => set("form", "image", e.target.value)} placeholder="Image URL (optional)" className={inp} />
            <input value={form.description} onChange={(e) => set("form", "description", e.target.value)} placeholder="Short description" className={inp} />
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={saveNew} disabled={busy} className="flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
            </button>
            <button onClick={() => { setAdding(false); setForm(blank); setErr(null); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-50">
          {categories.map((c) => (
            <li key={c.id} className="p-4">
              {editId === c.id ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={edit.name} onChange={(e) => set("edit", "name", e.target.value)} placeholder="Name" className={inp} />
                  <input value={edit.slug} onChange={(e) => set("edit", "slug", e.target.value)} placeholder="Slug" className={inp} />
                  <input value={edit.image} onChange={(e) => set("edit", "image", e.target.value)} placeholder="Image URL" className={inp} />
                  <input value={edit.description} onChange={(e) => set("edit", "description", e.target.value)} placeholder="Description" className={inp} />
                  <div className="flex gap-2 sm:col-span-2">
                    <button onClick={() => saveEdit(c.id)} disabled={busy} className="flex items-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save
                    </button>
                    <button onClick={() => { setEditId(null); setErr(null); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">/{c.slug}</p>
                    {c.description && <p className="mt-0.5 text-sm text-slate-500">{c.description}</p>}
                  </div>
                  <button onClick={() => startEdit(c)} className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-600" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <DeleteButton endpoint="/api/categories" id={c.id} label="category" />
                </div>
              )}
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-slate-400">No categories yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
