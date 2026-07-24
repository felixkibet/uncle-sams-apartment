"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="sm:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 flex flex-col ml-0 sm:ml-[260px] min-h-screen">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
