import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-slate-900 lg:block">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg font-black backdrop-blur">
              AB
            </span>
            <span className="text-xl font-extrabold">AB Accessories</span>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold leading-tight">Admin Control Center</h1>
            <p className="mt-3 max-w-md text-white/80">
              Manage your products, categories, orders and store settings — all from one beautiful
              dashboard.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              {["Product CRUD", "Order Management", "Category Control", "Store Settings"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15">✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} AB Accessories</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <span className="grid h-12 w-12 place-items-center rounded-xl brand-gradient text-lg font-black text-white">
              AB
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to access the admin dashboard.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
