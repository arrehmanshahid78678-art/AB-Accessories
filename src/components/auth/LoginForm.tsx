"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please check your email and password.");
        setPending(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");
      const isSafeAdminCallback =
        callbackUrl &&
        callbackUrl.startsWith("/admin") &&
        !callbackUrl.startsWith("//") &&
        callbackUrl !== "/admin/login";
      const redirectTo = isSafeAdminCallback ? callbackUrl : data.redirectTo || "/admin";

      // Use a full browser navigation instead of a client router transition.
      // This guarantees the fresh session cookie is included on the admin request.
      window.location.assign(redirectTo);
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <span className="grid w-11 place-items-center text-slate-400">
            <Mail size={18} />
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full bg-transparent py-3 pr-3 text-sm outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <span className="grid w-11 place-items-center text-slate-400">
            <Lock size={18} />
          </span>
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent py-3 pr-3 text-sm outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="grid w-11 place-items-center text-slate-400 hover:text-slate-600"
            aria-label="Toggle password"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Remember me
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-xl brand-gradient px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-slate-400">
        Admin access is private. Use the credentials provided by the store owner.
      </p>
    </form>
  );
}
