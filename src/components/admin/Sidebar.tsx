"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Settings,
  Store,
  Menu,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const NavList = () => (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "brand-gradient text-white shadow" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        onClick={() => setOpen(false)}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
      >
        <Store size={18} />
        View Store
        <span className="ml-auto text-xs text-slate-400">↗</span>
      </Link>
    </nav>
  );

  const Brand = () => (
    <Link href="/admin" className="flex items-center gap-2 px-5 py-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-sm font-black text-white">
        AB
      </span>
      <div className="leading-tight">
        <p className="text-sm font-extrabold text-slate-900">AB Accessories</p>
        <p className="text-[11px] text-slate-400">Admin Panel</p>
      </div>
    </Link>
  );

  return (
    <>
      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-72">
        <button
          className="rounded-lg p-1.5 text-slate-700 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <p className="hidden text-sm font-semibold text-slate-500 lg:block">Dashboard</p>
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <p className="text-sm font-bold text-slate-800">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.email}</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full brand-gradient text-sm font-bold text-white">
            {user.name.slice(0, 1)}
          </span>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Brand />
        <NavList />
        <div className="border-t border-slate-100 p-3">
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <NavList />
            <div className="border-t border-slate-100 p-3">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
