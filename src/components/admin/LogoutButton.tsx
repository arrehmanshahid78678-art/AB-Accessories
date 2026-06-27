"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      Logout
    </button>
  );
}
