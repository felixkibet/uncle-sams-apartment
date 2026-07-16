"use client";

import { useEffect, useState } from "react";
import { Plus, Receipt, Search, X, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Expense = {
  id: string; category: string; description: string;
  amount: number; date: string; receipt?: string;
};

const CATEGORIES = ["MAINTENANCE", "REPAIRS", "UTILITIES", "CLEANING", "SECURITY", "INSURANCE", "OTHER"];
const CATEGORY_COLORS: Record<string, string> = {
  MAINTENANCE: "#3b82f6", REPAIRS: "#ef4444", UTILITIES: "#f59e0b",
  CLEANING: "#10b981", SECURITY: "#8b5cf6", INSURANCE: "#06b6d4", OTHER: "#64748b",
};
const CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: "Maintenance", REPAIRS: "Repairs", UTILITIES: "Utilities",
  CLEANING: "Cleaning", SECURITY: "Security", INSURANCE: "Insurance", OTHER: "Other",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json().catch(() => []);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = expenses.filter(e => {
    const matchSearch = `${e.description} ${e.category}`.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Chart data
  const byCategory = CATEGORIES.map(cat => ({
    name: CATEGORY_LABELS[cat],
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: CATEGORY_COLORS[cat],
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{expenses.length} expenses · Total: {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* Charts + Summary */}
      {byCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {byCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Breakdown</h3>
            <div className="space-y-3">
              {byCategory.sort((a, b) => b.value - a.value).map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.value / Math.max(...byCategory.map(d => d.value))) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search expenses…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-auto" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="py-12 text-center text-slate-400">Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="py-12 text-center text-slate-400">
                  <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No expenses found
                </td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id}>
                  <td>
                    <span className="badge" style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}18`, color: CATEGORY_COLORS[e.category] }}>
                      {CATEGORY_LABELS[e.category]}
                    </span>
                  </td>
                  <td className="text-slate-700">{e.description}</td>
                  <td className="font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                  <td className="text-slate-500 text-xs">{formatDate(e.date)}</td>
                </tr>
              ))}
              {filtered.length > 0 && (
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="text-slate-600">Total</td>
                  <td className="text-red-700">{formatCurrency(total)}</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddExpenseModal onClose={() => { setShowAdd(false); loadData(); }} />}
    </div>
  );
}

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ category: "MAINTENANCE", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Add Expense</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Plumber for Unit 2F-3" required />
            </div>
            <div>
              <label className="label">Amount (KES)</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" required />
            </div>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
