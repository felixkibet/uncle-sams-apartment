"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, Home, Calendar, CreditCard, FileText, X } from "lucide-react";
import { formatCurrency, formatDate, formatMonth, unitTypeLabel } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PAID: "badge-paid", UNPAID: "badge-unpaid", PARTIAL: "badge-partial", OVERDUE: "badge-overdue",
};

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferUnitId, setTransferUnitId] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    loadTenant();
  }, [id]);

  async function loadTenant() {
    setLoading(true);
    try {
      const [tenantRes, unitsRes] = await Promise.all([
        fetch(`/api/tenants/${id}`),
        fetch("/api/units"),
      ]);
      const tenantData = await tenantRes.json();
      const unitsData = await unitsRes.json();
      setTenant(tenantData);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="card h-48" /><div className="card h-64" /></div>;
  if (!tenant || tenant.error) return <div className="card p-8 text-center text-slate-500">Tenant not found</div>;

  const totalPaid = tenant.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const totalOwed = tenant.invoices.reduce((s: number, i: any) => s + i.balanceDue, 0);
  const availableUnits = units.filter((u) => !u.isOccupied && u.id !== tenant.unit.id);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost p-2"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {tenant.firstName[0]}{tenant.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{tenant.firstName} {tenant.lastName}</h1>
            <p className="text-slate-500 text-sm">{tenant.unit.unitNumber} · {tenant.unit.floor.label}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {tenant.isActive && (
              <button
                onClick={() => setShowTransfer(true)}
                className="btn-outline py-1.5 px-3 text-xs"
                disabled={availableUnits.length === 0}
              >
                Transfer Unit
              </button>
            )}
            <span className={`badge ${tenant.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {tenant.isActive ? "Active" : "Moved out"}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Contact</h3>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">{tenant.phone}</span>
          </div>
          {tenant.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">{tenant.email}</span>
            </div>
          )}
          {tenant.idNumber && (
            <div className="flex items-center gap-3 text-sm">
              <span className="h-4 w-4 text-slate-400 text-xs font-bold">ID</span>
              <span className="text-slate-700">{tenant.idNumber}</span>
            </div>
          )}
        </div>

        {/* Tenancy */}
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Tenancy</h3>
          <div className="flex items-center gap-3 text-sm">
            <Home className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">{tenant.unit.unitNumber} — {unitTypeLabel(tenant.unit.type)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">Moved in: {formatDate(tenant.moveInDate)}</span>
          </div>
          {tenant.moveOutDate && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-700">Moved out: {formatDate(tenant.moveOutDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="h-4 w-4 text-slate-400" />
            <span className="text-slate-700">Rent: {formatCurrency(tenant.unit.rentAmount)}/month</span>
          </div>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Paid</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Outstanding</p>
          <p className={`text-xl font-bold ${totalOwed > 0 ? "text-red-600" : "text-slate-400"}`}>{formatCurrency(totalOwed)}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Invoices</p>
          <p className="text-xl font-bold text-slate-900">{tenant.invoices.length}</p>
        </div>
      </div>

      {showTransfer && (
        <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Transfer Tenant Unit</h2>
                <p className="text-sm text-slate-500 mt-0.5">Select a vacant unit for this tenant.</p>
              </div>
              <button onClick={() => setShowTransfer(false)} className="btn-ghost p-2 -mr-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!transferUnitId) {
                  setTransferError("Please select a new unit.");
                  return;
                }
                setTransferring(true);
                setTransferError("");
                const res = await fetch(`/api/tenants/${id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ unitId: transferUnitId }),
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => null);
                  setTransferError(data?.error || "Failed to transfer unit");
                  setTransferring(false);
                  return;
                }
                await loadTenant();
                setShowTransfer(false);
                setTransferUnitId("");
                setTransferring(false);
              }}
            >
              <div className="modal-body space-y-4">
                {transferError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {transferError}
                  </div>
                )}
                <div>
                  <label className="label">Current Unit</label>
                  <div className="input bg-slate-50 text-slate-700">{tenant.unit.unitNumber} · {tenant.unit.floor.label}</div>
                </div>
                <div>
                  <label className="label">New Unit</label>
                  <select
                    className="select"
                    value={transferUnitId}
                    onChange={(e) => setTransferUnitId(e.target.value)}
                    required
                  >
                    <option value="">Select vacant unit…</option>
                    {availableUnits.length === 0 ? (
                      <option value="" disabled>No vacant units available</option>
                    ) : (
                      availableUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.unitNumber} — {unit.floor.label} · {unitTypeLabel(unit.type)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowTransfer(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={transferring}>
                  {transferring ? "Transferring…" : "Transfer Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Invoice History</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Period</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tenant.invoices.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">No invoices yet</td></tr>
              )}
              {tenant.invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-slate-500">{inv.invoiceNumber}</td>
                  <td className="text-slate-600">{formatMonth(inv.month, inv.year)}</td>
                  <td className="font-medium">{formatCurrency(inv.totalAmount)}</td>
                  <td className="text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                  <td className={inv.balanceDue > 0 ? "text-red-600 font-medium" : "text-slate-400"}>{formatCurrency(inv.balanceDue)}</td>
                  <td><span className={`badge ${STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
                  <td><a href={`/invoices/${inv.id}`} className="btn-outline py-1 px-3 text-xs">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Payment History</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {tenant.payments.length === 0 && (
            <p className="py-8 text-center text-slate-400 text-sm">No payments recorded</p>
          )}
          {tenant.payments.map((p: any) => (
            <div key={p.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{formatCurrency(p.amount)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{formatDate(p.paidAt)} · {p.method}</p>
                {p.reference && <p className="text-xs font-mono text-slate-400">{p.reference}</p>}
              </div>
              <span className="badge bg-emerald-50 text-emerald-700">Received</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
