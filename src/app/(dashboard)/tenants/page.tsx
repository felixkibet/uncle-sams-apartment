"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X, Loader2, Users, Phone, Home } from "lucide-react";
import { formatDate, unitTypeLabel } from "@/lib/utils";

type Tenant = {
  id: string; firstName: string; lastName: string; phone: string;
  email?: string; idNumber?: string; moveInDate: string; isActive: boolean;
  unit: { unitNumber: string; type: string; floor: { label: string } };
};
type Unit = { id: string; unitNumber: string; type: string; floor: { label: string } };

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [tRes, uRes] = await Promise.all([fetch("/api/tenants"), fetch("/api/units")]);
      const tJson = await tRes.json().catch(() => []);
      const uJson = await uRes.json().catch(() => []);
      setTenants(Array.isArray(tJson) ? tJson : []);
      setUnits(Array.isArray(uJson) ? uJson.filter((u: any) => !u.isOccupied) : []);
    } catch (err) {
      console.error("Failed to load tenants/units", err);
      setTenants([]);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = tenants.filter(t => {
    const matchesSearch = `${t.firstName} ${t.lastName} ${t.phone} ${t.unit.unitNumber}`
      .toLowerCase().includes(search.toLowerCase());
    const matchesActive = activeOnly ? t.isActive : true;
    return matchesSearch && matchesActive;
  });

  async function handleMoveOut(tenantId: string) {
    if (!confirm("Mark this tenant as moved out?")) return;
    await fetch(`/api/tenants/${tenantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false, moveOutDate: new Date().toISOString() }),
    });
    loadData();
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="card h-16" /><div className="card h-64" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">{tenants.filter(t => t.isActive).length} active tenants</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input className="input pl-10" placeholder="Search by name, phone, or unit…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          <button onClick={() => setActiveOnly(true)} className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeOnly ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Active</button>
          <button onClick={() => setActiveOnly(false)} className={`px-4 py-2.5 text-sm font-medium transition-colors ${!activeOnly ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}>All</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Phone</th>
                <th>Move-in Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No tenants found
                </td></tr>
              )}
              {filtered.map(tenant => (
                <tr key={tenant.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {tenant.firstName[0]}{tenant.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{tenant.firstName} {tenant.lastName}</p>
                        {tenant.email && <p className="text-xs text-slate-500">{tenant.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{tenant.unit.unitNumber}</p>
                      <p className="text-xs text-slate-500">{tenant.unit.floor.label} · {unitTypeLabel(tenant.unit.type)}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {tenant.phone}
                    </div>
                  </td>
                  <td className="text-slate-500">{formatDate(tenant.moveInDate)}</td>
                  <td>
                    <span className={`badge ${tenant.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {tenant.isActive ? "Active" : "Moved out"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <a href={`/tenants/${tenant.id}`} className="btn-outline py-1.5 px-3 text-xs">View</a>
                      {tenant.isActive && (
                        <button onClick={() => handleMoveOut(tenant.id)} className="btn-ghost py-1.5 px-3 text-xs text-red-500 hover:text-red-700 hover:bg-red-50">
                          Move out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddTenantModal units={units} onClose={() => { setShowAdd(false); loadData(); }} />}
    </div>
  );
}

function AddTenantModal({ units, onClose }: { units: Unit[]; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "", idNumber: "", unitId: "", moveInDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { onClose(); }
    else { const d = await res.json(); setError(d.error || "Failed to add tenant"); setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Add New Tenant</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XXXXXXXX" required />
            </div>
            <div>
              <label className="label">Email (optional)</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">National ID Number (optional)</label>
              <input className="input" value={form.idNumber} onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))} />
            </div>
            <div>
              <label className="label">Assign Unit</label>
              <select className="select" value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))} required>
                <option value="">Select vacant unit…</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.unitNumber} — {u.floor.label} · {unitTypeLabel(u.type)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Move-in Date</label>
              <input className="input" type="date" value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
