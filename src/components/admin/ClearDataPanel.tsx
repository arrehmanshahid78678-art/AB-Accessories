"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, CheckCircle2 } from "lucide-react";

type Preview = {
  products: number;
  categories: number;
  orders: number;
  visitors: number;
  total: number;
};

export function ClearDataPanel() {
  const [step, setStep] = useState<"idle" | "preview" | "confirm" | "clearing" | "done" | "error">("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const loadPreview = async () => {
    setStep("preview");
    setError(null);
    try {
      const res = await fetch("/api/admin/clear-data");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.preview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preview");
      setStep("error");
    }
  };

  const handleClear = async () => {
    if (confirmText !== "CLEAR_ALL_DATA") {
      setError("Please type CLEAR_ALL_DATA to confirm");
      return;
    }
    setStep("clearing");
    setError(null);
    try {
      const res = await fetch("/api/admin/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "CLEAR_ALL_DATA" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
      // Reload page after 2 seconds so admin sees empty state
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear data");
      setStep("error");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-rose-900">Danger Zone</h2>
          <p className="text-sm text-rose-700">
            Clear all store data to start fresh
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">What will be deleted:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>All products and their images</li>
          <li>All categories</li>
          <li>All orders</li>
          <li>All visitor analytics</li>
        </ul>
        <p className="mt-3 font-semibold text-emerald-700">What will be preserved:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Your admin account (you can still log in)</li>
          <li>Store settings (logo, contact, social links)</li>
        </ul>
      </div>

      {step === "idle" && (
        <button
          onClick={loadPreview}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-rose-300 bg-white px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
        >
          <Trash2 size={16} />
          Clear All Data
        </button>
      )}

      {step === "preview" && preview && (
        <div className="space-y-3">
          <div className="rounded-xl bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-slate-800">
              This will permanently delete:
            </p>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-600">Products</span>
                <span className="font-bold text-rose-600">{preview.products}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Categories</span>
                <span className="font-bold text-rose-600">{preview.categories}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Orders</span>
                <span className="font-bold text-rose-600">{preview.orders}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-600">Visitors</span>
                <span className="font-bold text-rose-600">{preview.visitors}</span>
              </li>
              <li className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="font-extrabold text-rose-700">{preview.total}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-sm">
            <p className="font-semibold text-amber-800">⚠️ Final Confirmation</p>
            <p className="mt-1 text-amber-700">
              Type <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs font-bold">CLEAR_ALL_DATA</code> below to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CLEAR_ALL_DATA"
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep("idle");
                setConfirmText("");
                setError(null);
              }}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleClear}
              disabled={confirmText !== "CLEAR_ALL_DATA"}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Yes, Delete Everything
            </button>
          </div>
        </div>
      )}

      {step === "clearing" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-white p-6">
          <Loader2 size={20} className="animate-spin text-rose-600" />
          <span className="font-semibold text-slate-700">Clearing all data...</span>
        </div>
      )}

      {step === "done" && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <CheckCircle2 size={24} className="text-emerald-600" />
          <div>
            <p className="font-bold text-emerald-800">All data cleared!</p>
            <p className="text-sm text-emerald-700">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-3">
          <div className="rounded-xl bg-rose-100 p-3 text-sm text-rose-800">
            <p className="font-semibold">Error: {error}</p>
          </div>
          <button
            onClick={() => {
              setStep("idle");
              setConfirmText("");
              setError(null);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
