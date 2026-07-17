"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import Link from "next/link";

export default function TenantInvoicesPage() {
  const [invoiceCode, setInvoiceCode] = useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tenant Invoices</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Access your invoice</h1>
            <p className="mt-4 text-slate-600">Enter the invoice code from your email to view the invoice details and download your PDF.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="w-full">
              <span className="mb-2 block text-sm font-medium text-slate-700">Invoice Code</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-12 w-full"
                  placeholder="e.g. USA-202607-008"
                  value={invoiceCode}
                  onChange={(e) => setInvoiceCode(e.target.value)}
                />
              </div>
            </label>
            <Link
              href={invoiceCode ? `/tenant/invoices/${encodeURIComponent(invoiceCode)}` : "/tenant/invoices"}
              className={`btn-primary w-full sm:w-auto ${!invoiceCode ? "opacity-50 pointer-events-none" : ""}`}
            >
              View Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <div className="flex items-center gap-3 text-slate-900">
          <FileText className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Invoice lookup</p>
            <p className="text-sm text-slate-600">Use your invoice number to access the latest billing details securely.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
