import type { ReactNode } from "react";

export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
