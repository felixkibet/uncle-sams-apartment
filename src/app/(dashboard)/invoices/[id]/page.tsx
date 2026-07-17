"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, X, Loader2, Printer, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  UNPAID: "bg-red-50 text-red-700 border-red-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  async function handleEmail() {
    try {
      const res = await fetch(`/api/invoices/${id}/send-email`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send');
      alert('Email queued/sent successfully');
    } catch (err: any) {
      alert('Email failed: ' + (err.message || err));
    }
  }

  async function handleDownloadPdf() {
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`, { method: "GET" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Download failed: " + (err.message || err));
    }
  }

  useEffect(() => { loadInvoice(); }, [id]);

  async function loadInvoice() {
    const res = await fetch(`/api/invoices/${id}`);
    setInvoice(await res.json());
    setLoading(false);
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="card h-64" /></div>;
  if (!invoice) return <div className="card p-8 text-center text-slate-500">Invoice not found</div>;

  const lineItems = [
    { label: "Rent", amount: invoice.rentAmount },
    { label: "Water", amount: invoice.waterAmount },
    { label: "WiFi", amount: invoice.wifiAmount },
    { label: "Other Charges", amount: invoice.otherCharges },
  ].filter(item => item.amount > 0);

  return (
    <div className="space-y-6 max-w-3xl invoice-page">
      {/* Header */}
      <div className="flex items-center gap-4 no-print">
        <button onClick={() => router.back()} className="btn-ghost p-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">Invoice {invoice.invoiceNumber}</h1>
          <p className="page-subtitle">{formatMonth(invoice.month, invoice.year)}</p>
        </div>
        <span className={`badge border px-3 py-1.5 text-sm ${STATUS_COLORS[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>

      {/* Print Header */}
      <div className="invoice-print-header hidden">
        <div className="invoice-print-header-inner">
          <div>
            <p className="invoice-print-label">Uncle Sam&apos;s Apartment</p>
            <h2>Invoice {invoice.invoiceNumber}</h2>
            <p>{formatMonth(invoice.month, invoice.year)} · Due {formatDate(invoice.dueDate)}</p>
          </div>
          <div style={{ minWidth: 220, textAlign: "right" }}>
            <p className="invoice-print-label">Contact</p>
            <p>0738 822 454</p>
            <p>unglesam@gmail.com</p>
            <p>Nyayo Gate B, Naivas Court, Embakasi</p>
          </div>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="card overflow-hidden invoice-print-card">
        {/* Invoice Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">US</div>
                <div>
                  <p className="font-bold">Uncle Sam&apos;s Apartment</p>
                  <p className="text-slate-300 text-xs">Nyayo Gate B, Naivas Court, Embakasi</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm">0738 822 454 · unglesam@gmail.com</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-xs uppercase tracking-wider">Invoice</p>
              <p className="text-xl font-bold font-mono mt-1">{invoice.invoiceNumber}</p>
              <p className="text-slate-300 text-xs mt-1">Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Tenant & Unit */}
        <div className="p-6 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-semibold text-slate-900">{invoice.tenant.firstName} {invoice.tenant.lastName}</p>
              <p className="text-slate-500 text-sm">{invoice.tenant.phone}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Unit</p>
              <p className="font-semibold text-slate-900">{invoice.unit.unitNumber}</p>
              <p className="text-slate-500 text-sm">{invoice.unit.floor?.label}</p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 border-b border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs text-slate-500 uppercase tracking-wider pb-3">Description</th>
                <th className="text-right text-xs text-slate-500 uppercase tracking-wider pb-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lineItems.map(item => (
                <tr key={item.label}>
                  <td className="py-3 text-slate-700">{item.label}</td>
                  <td className="py-3 text-right font-medium text-slate-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="pt-4 font-bold text-slate-900">Total</td>
                <td className="pt-4 text-right font-bold text-xl text-slate-900">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
              {invoice.paidAmount > 0 && (
                <>
                  <tr>
                    <td className="pt-2 text-emerald-600">Amount Paid</td>
                    <td className="pt-2 text-right text-emerald-600 font-medium">- {formatCurrency(invoice.paidAmount)}</td>
                  </tr>
                  <tr>
                    <td className="pt-2 font-semibold text-red-600">Balance Due</td>
                    <td className="pt-2 text-right font-bold text-red-600">{formatCurrency(invoice.balanceDue)}</td>
                  </tr>
                </>
              )}
            </tfoot>
          </table>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3 print-hidden">
          {invoice.status !== "PAID" && (
            <button onClick={() => setShowPayment(true)} className="btn-primary flex-1">
              <CreditCard className="h-4 w-4" /> Record Payment
            </button>
          )}
            <button onClick={handleEmail} className="btn-outline">Email</button>
          {invoice.status === "PAID" && (
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="h-5 w-5" /> Fully Paid
            </div>
          )}
          <button onClick={handleDownloadPdf} className="btn-outline">
            <Printer className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Payment History</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {invoice.payments.map((p: any) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(p.paidAt)} · {p.method}</p>
                  {p.reference && <p className="text-xs text-slate-400 font-mono">{p.reference}</p>}
                </div>
                <span className="badge bg-emerald-50 text-emerald-700">Received</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPayment && (
        <RecordPaymentModal
          invoice={invoice}
          onClose={() => { setShowPayment(false); loadInvoice(); }}
        />
      )}
    </div>
  );
}

function RecordPaymentModal({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  const [form, setForm] = useState({
    amount: String(invoice.balanceDue), method: "MPESA", reference: "", notes: "", paidAt: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        amount: parseFloat(form.amount),
      }),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Record Payment</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Balance Due</span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(invoice.balanceDue)}</span>
            </div>
            <div>
              <label className="label">Amount (KES)</label>
              <input className="input text-lg font-semibold" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} max={invoice.balanceDue} required />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="select" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
                <option value="MPESA">M-Pesa</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            {form.method === "MPESA" && (
              <div>
                <label className="label">M-Pesa Transaction Code</label>
                <input className="input font-mono uppercase" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value.toUpperCase() }))} placeholder="e.g. QHX7Y2ABCD" />
              </div>
            )}
            <div>
              <label className="label">Payment Date</label>
              <input className="input" type="date" value={form.paidAt} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
