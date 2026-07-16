"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Search, X, Loader2, Zap } from "lucide-react";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

type Invoice = {
  id: string; invoiceNumber: string; month: number; year: number;
  rentAmount: number; waterAmount: number; wifiAmount: number; otherCharges: number;
  totalAmount: number; paidAmount: number; balanceDue: number;
  status: string; dueDate: string;
  unit: { unitNumber: string; type: string };
  tenant: { firstName: string; lastName: string; phone: string };
  payments: any[];
};
type Tenant = { id: string; firstName: string; lastName: string; unit: { id: string; unitNumber: string; rentAmount: number; hasWifi: boolean; wifiAmount: number } };

const STATUS_COLORS: Record<string, string> = {
  PAID: "badge-paid", UNPAID: "badge-unpaid", PARTIAL: "badge-partial", OVERDUE: "badge-overdue",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const now = new Date();
  const [monthFilter, setMonthFilter] = useState(now.getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(now.getFullYear());

  useEffect(() => { loadData(); }, [monthFilter, yearFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [invRes, tenRes] = await Promise.all([
        fetch(`/api/invoices?month=${monthFilter}&year=${yearFilter}`),
        fetch("/api/tenants?active=true"),
      ]);
      const invJson = await invRes.json().catch(() => []);
      const tenJson = await tenRes.json().catch(() => []);
      setInvoices(Array.isArray(invJson) ? invJson : []);
      setTenants(Array.isArray(tenJson) ? tenJson : []);
    } catch (err) {
      console.error("Failed to load invoices/tenants", err);
      setInvoices([]);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = invoices.filter(i => {
    const matchSearch = `${i.tenant.firstName} ${i.tenant.lastName} ${i.unit.unitNumber} ${i.invoiceNumber}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalDue = invoices.reduce((s, i) => s + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{formatMonth(monthFilter, yearFilter)} · {invoices.length} invoices</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulk(true)} className="btn-outline">
            <Zap className="h-4 w-4" /> Bulk Generate
          </button>
          <button onClick={() => exportCsv(filtered)} className="btn-outline">
            CSV Export
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Invoiced</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(invoices.reduce((s, i) => s + i.totalAmount, 0))}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Collected</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Outstanding</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search invoices…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={monthFilter} onChange={e => setMonthFilter(parseInt(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("en", { month: "long" })}</option>
          ))}
        </select>
        <select className="select w-auto" value={yearFilter} onChange={e => setYearFilter(parseInt(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {["ALL", "PAID", "PARTIAL", "UNPAID", "OVERDUE"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="py-12 text-center text-slate-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-slate-400">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No invoices found
                </td></tr>
              )}
              {filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</td>
                  <td className="font-medium text-slate-900">{inv.tenant.firstName} {inv.tenant.lastName}</td>
                  <td className="text-slate-500">{inv.unit.unitNumber}</td>
                  <td className="font-semibold">{formatCurrency(inv.totalAmount)}</td>
                  <td className="text-emerald-600 font-medium">{formatCurrency(inv.paidAmount)}</td>
                  <td className={inv.balanceDue > 0 ? "text-red-600 font-medium" : "text-slate-400"}>
                    {formatCurrency(inv.balanceDue)}
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(inv.dueDate)}</td>
                  <td><span className={`badge ${STATUS_COLORS[inv.status] || ""}`}>{inv.status}</span></td>
                  <td>
                    <a href={`/invoices/${inv.id}`} className="btn-outline py-1.5 px-3 text-xs">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddInvoiceModal tenants={tenants} onClose={() => { setShowAdd(false); loadData(); }} />}
      {showBulk && <BulkGenerateModal onClose={() => { setShowBulk(false); loadData(); }} />}
    </div>
  );
}

function exportCsv(invoices: any[]) {
  if (!Array.isArray(invoices)) invoices = [];
  const headers = ["invoiceNumber", "tenant", "unit", "totalAmount", "paidAmount", "balanceDue", "dueDate", "status"];
  const rows = invoices.map(i => ([
    i.invoiceNumber,
    `${i.tenant?.firstName || ''} ${i.tenant?.lastName || ''}`.trim(),
    i.unit?.unitNumber || '',
    i.totalAmount,
    i.paidAmount,
    i.balanceDue,
    i.dueDate,
    i.status,
  ]));
  const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoices-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function AddInvoiceModal({ tenants, onClose }: { tenants: Tenant[]; onClose: () => void }) {
  const now = new Date();
  const [form, setForm] = useState({
    tenantId: "", unitId: "", rentAmount: "", waterAmount: "0", wifiAmount: "0",
    otherCharges: "0", month: now.getMonth() + 1, year: now.getFullYear(),
    dueDate: "", notes: "",
  });
  const [loading, setLoading] = useState(false);

  function handleTenantChange(tenantId: string) {
    const t = tenants.find(t => t.id === tenantId);
    if (t) setForm(f => ({
      ...f, tenantId, unitId: t.unit.id,
      rentAmount: String(t.unit.rentAmount),
      wifiAmount: t.unit.hasWifi ? String(t.unit.wifiAmount) : "0",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        rentAmount: parseFloat(form.rentAmount),
        waterAmount: parseFloat(form.waterAmount),
        wifiAmount: parseFloat(form.wifiAmount),
        otherCharges: parseFloat(form.otherCharges),
      }),
    });
    onClose();
  }

  const total = (parseFloat(form.rentAmount) || 0) + (parseFloat(form.waterAmount) || 0) + (parseFloat(form.wifiAmount) || 0) + (parseFloat(form.otherCharges) || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Create Invoice</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <label className="label">Tenant</label>
              <select className="select" value={form.tenantId} onChange={e => handleTenantChange(e.target.value)} required>
                <option value="">Select tenant…</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} — {t.unit.unitNumber}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Month</label>
                <select className="select" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("en", { month: "long" })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select className="select" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Rent (KES)</label>
                <input className="input" type="number" value={form.rentAmount} onChange={e => setForm(f => ({ ...f, rentAmount: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Water (KES)</label>
                <input className="input" type="number" value={form.waterAmount} onChange={e => setForm(f => ({ ...f, waterAmount: e.target.value }))} />
              </div>
              <div>
                <label className="label">WiFi (KES)</label>
                <input className="input" type="number" value={form.wifiAmount} onChange={e => setForm(f => ({ ...f, wifiAmount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Other Charges</label>
                <input className="input" type="number" value={form.otherCharges} onChange={e => setForm(f => ({ ...f, otherCharges: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input h-20 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            {total > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Amount</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(total)}</span>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BulkGenerateModal({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [form, setForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), dueDate: "", includeWifi: true });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Bulk Generate Invoices</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        {result ? (
          <div className="modal-body text-center py-8">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Done!</h3>
            <p className="text-slate-500 mt-2">{result.created} invoices created · {result.skipped} already existed</p>
            <button onClick={onClose} className="btn-primary mt-6">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-sm text-slate-500">This will automatically generate invoices for all active tenants for the selected month.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Month</label>
                  <select className="select" value={form.month} onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("en", { month: "long" })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Year</label>
                  <select className="select" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}>
                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="wifi" checked={form.includeWifi} onChange={e => setForm(f => ({ ...f, includeWifi: e.target.checked }))} className="h-4 w-4 rounded" />
                <label htmlFor="wifi" className="text-sm text-slate-700">Include WiFi charges</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Invoices"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
