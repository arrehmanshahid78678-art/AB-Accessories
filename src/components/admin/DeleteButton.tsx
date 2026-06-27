"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { nuclearReload } from "@/lib/force-refresh";

export function DeleteButton({
  endpoint,
  id,
  label = "item",
  className = "",
}: {
  endpoint: string;
  id: number | string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTimeout(() => nuclearReload(), 300);
      } else {
        window.alert("Failed to delete. Please try again.");
        setBusy(false);
      }
    } catch {
      window.alert("Network error. Please try again.");
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      title={`Delete ${label}`}
      className={`inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 ${className}`}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
