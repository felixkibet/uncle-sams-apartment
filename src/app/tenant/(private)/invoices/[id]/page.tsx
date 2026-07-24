"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Download, Info } from "lucide-react";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

export default function TenantInvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const invoiceNumber = Array.isArray(id) ? id[0] : id;
      const res = await fetch(`/api/invoices?invoiceNumber=${encodeURIComponent(invoiceNumber)}`);
      const data = await res.json();
      setInvoice(Array.isArray(data) ? data[0] : data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="card h-64" /></div>;
  if (!invoice || invoice.error) return <div className="card p-8 text-center text-slate-500">Invoice not found</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Invoice details</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">{invoice.invoiceNumber}</h1>
            <p className="text-slate-600 mt-2">{formatMonth(invoice.month, invoice.year)} · Due {formatDate(invoice.dueDate)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tenant</p>
              <p className="mt-3 text-slate-900 font-semibold">{invoice.tenant.firstName} {invoice.tenant.lastName}</p>
              <p className="text-sm text-slate-500 mt-1">{invoice.tenant.phone}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Unit</p>
              <p className="mt-3 text-slate-900 font-semibold">{invoice.unit.unitNumber}</p>
              <p className="text-sm text-slate-500 mt-1">{invoice.unit.floor.label}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</p>
              <span className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{invoice.status}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Rent</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.rentAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Water</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.waterAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">WiFi</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.wifiAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Other Charges</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(invoice.otherCharges)}</p>
              </div>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-100 p-6">
              <p className="text-sm text-slate-500">Total Due</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => window.location.href = `/api/invoices/${invoice.id}/pdf`}
              className="btn-primary w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </button>
            <div className="text-sm text-slate-500">Need help? <span className="font-semibold text-slate-900">Contact management.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
