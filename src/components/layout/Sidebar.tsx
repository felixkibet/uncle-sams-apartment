"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2, LayoutDashboard, Home, Users, FileText,
  CreditCard, Droplets, Wifi, BarChart3, Receipt,
  User,
  Settings, LogOut, ChevronRight, X
} from "lucide-react";

const NAV = [
  {
    group: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    group: "Property",
    items: [
      { href: "/units", icon: Home, label: "Units" },
      { href: "/users", icon: User, label: "Users" },
      { href: "/tenants", icon: Users, label: "Tenants" },
    ],
  },
  {
    group: "Finance",
    items: [
      { href: "/invoices", icon: FileText, label: "Invoices" },
      { href: "/payments", icon: CreditCard, label: "Payments" },
      { href: "/expenses", icon: Receipt, label: "Expenses" },
    ],
  },
  {
    group: "Utilities",
    items: [
      { href: "/water", icon: Droplets, label: "Water Billing" },
    ],
  },
  {
    group: "Insights",
    items: [
      { href: "/reports", icon: BarChart3, label: "Reports" },
    ],
  },
];

export function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const panelClass = `fixed inset-y-0 left-0 w-[260px] flex flex-col bg-gradient-navy z-30 transform transition-transform duration-200 ${
    isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
  }`;

  return (
    <div className="sm:relative">
      {/* backdrop for mobile when open */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-20 sm:hidden" onClick={onClose} />}

      <aside className={panelClass}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="p-2 bg-yellow-500 rounded-xl flex-shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">Uncle Sam&apos;s</p>
          <p className="text-slate-400 text-xs truncate">Apartment</p>
        </div>
        <div className="ml-auto sm:hidden">
          <button onClick={onClose} className="p-2 rounded-md text-white/90 hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={active ? "sidebar-link-active" : "sidebar-link"}
                    >
                      <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? "text-yellow-400" : ""}`} />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-yellow-400/70" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link href="/settings" className={isActive("/settings") ? "sidebar-link-active" : "sidebar-link"}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-link w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
      </aside>
    </div>
  );
}
