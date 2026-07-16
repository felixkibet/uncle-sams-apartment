"use client";

import { useEffect, useState } from "react";
import { Search, CreditCard, TrendingUp, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Payment = {
  id: string; amount: number; method: string; reference?: string;
  paidAt: string; notes?: string;
  tenant: { id: string; firstName: string; lastName: string; phone: string };
  invoice: { id: string; invoiceNumber: string; month: number; year: number };
};

const METHOD_COLORS: Record<string, string> = {
  MPESA: "bg-emerald-50 text-emerald-700",
  CASH: "bg-blue-50 text-blue-700",
  BANK_TRANSFER: "bg-purple-50 text-purple-700",
  CHEQUE: "bg-orange-50 text-orange-700",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/payments?limit=100");
      const data = await res.json().catch(() => []);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = payments.filter(p => {
    const matchSearch = `${p.tenant.firstName} ${p.tenant.lastName} ${p.invoice.invoiceNumber} ${p.reference || ""}`
      .toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "ALL" || p.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalCollected = filtered.reduce((s, p) => s + p.amount, 0);
  const mpesaTotal = filtered.filter(p => p.method === "MPESA").reduce((s, p) => s + p.amount, 0);
  const cashTotal = filtered.filter(p => p.method === "CASH").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{payments.length} transactions recorded</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-slate-100 text-slate-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(totalCollected)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-50 text-emerald-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Via M-Pesa</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">{formatCurrency(mpesaTotal)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Via Cash</p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5">{formatCurrency(cashTotal)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search by tenant, invoice, or M-Pesa code…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          {["ALL", "MPESA", "CASH", "BANK_TRANSFER", "CHEQUE"].map(m => (
            <button key={m} onClick={() => setMethodFilter(m)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${methodFilter === m ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              {m === "BANK_TRANSFER" ? "BANK" : m}
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
                <th>Tenant</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No payments found
                </td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {p.tenant.firstName[0]}{p.tenant.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{p.tenant.firstName} {p.tenant.lastName}</p>
                        <p className="text-xs text-slate-500">{p.tenant.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={`/invoices/${p.invoice.id}`} className="font-mono text-xs text-yellow-600 hover:text-yellow-700 hover:underline">
                      {p.invoice.invoiceNumber}
                    </a>
                  </td>
                  <td className="font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td><span className={`badge ${METHOD_COLORS[p.method] || "bg-slate-100 text-slate-600"}`}>{p.method}</span></td>
                  <td className="font-mono text-xs text-slate-500">{p.reference || "—"}</td>
                  <td className="text-slate-500 text-xs">{formatDate(p.paidAt)}</td>
                  <td className="text-slate-400 text-xs max-w-32 truncate">{p.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
