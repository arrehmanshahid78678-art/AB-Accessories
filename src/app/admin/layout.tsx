import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // When logged out, render the child page without the admin shell.
  // The /admin page itself shows the login form, while deeper admin routes
  // are still protected by middleware and redirected back to /admin.
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar user={session} />
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
