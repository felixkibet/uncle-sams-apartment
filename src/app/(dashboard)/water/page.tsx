"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks";
import { Droplets, Plus, X, Loader2, Save, AlertCircle } from "lucide-react";
import { formatCurrency, formatMonth } from "@/lib/utils";

type Unit = {
  id: string; unitNumber: string; type: string;
  floor: { label: string };
  tenants: Array<{ firstName: string; lastName: string }>;
};
type Reading = {
  id: string; unitId: string; month: number; year: number;
  previousReading: number; currentReading: number;
  unitsUsed: number; ratePerUnit: number; totalAmount: number;
  unit: { unitNumber: string; floor: { label: string }; tenants: Array<{ firstName: string; lastName: string }> };
};

export default function WaterPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [settings] = useLocalStorage<{
    waterRate: string;
    wifiRate: string;
    rentDueDay: string;
  }>("uncle-sams-apt-settings", {
    waterRate: "150",
    wifiRate: "1500",
    rentDueDay: "5",
  });
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [ratePerUnit, setRatePerUnit] = useState(Number(settings.waterRate) || 150);
  const [showEntry, setShowEntry] = useState(false);
  const [selected, setSelected] = useState<Unit | null>(null);

  useEffect(() => { loadData(); }, [month, year]);

  useEffect(() => {
    setRatePerUnit(Number(settings.waterRate) || 150);
  }, [settings.waterRate]);

  async function loadData() {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        fetch("/api/units"),
        fetch(`/api/water?month=${month}&year=${year}`),
      ]);
      const uJson = await uRes.json().catch(() => []);
      const rJson = await rRes.json().catch(() => []);
      setUnits(Array.isArray(uJson) ? uJson : []);
      setReadings(Array.isArray(rJson) ? rJson : []);
    } catch (err) {
      console.error("Failed to load water data", err);
      setUnits([]);
      setReadings([]);
    } finally {
      setLoading(false);
    }
  }

  const occupiedUnits = units.filter(u => u.tenants.length > 0);
  const readingMap = Object.fromEntries(readings.map(r => [r.unitId, r]));

  const totalWaterRevenue = readings.reduce((s, r) => s + r.totalAmount, 0);
  const totalUnitsConsumed = readings.reduce((s, r) => s + r.unitsUsed, 0);
  const coveredCount = readings.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Water Billing</h1>
          <p className="page-subtitle">{formatMonth(month, year)} · {coveredCount}/{occupiedUnits.length} units entered</p>
        </div>
        <div className="flex gap-3 items-center">
          <select className="select w-auto" value={month} onChange={e => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("en", { month: "long" })}</option>
            ))}
          </select>
          <select className="select w-auto" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-blue-50 text-blue-600">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-700 mt-0.5">{formatCurrency(totalWaterRevenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-cyan-50 text-cyan-600">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Units Consumed</p>
            <p className="text-2xl font-bold text-cyan-700 mt-0.5">{totalUnitsConsumed.toFixed(1)} m³</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-slate-100 text-slate-600">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Rate / Unit</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-2xl font-bold text-slate-900">KES</p>
              <input
                type="number"
                value={ratePerUnit}
                onChange={e => setRatePerUnit(parseInt(e.target.value))}
                className="w-20 text-2xl font-bold text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-yellow-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Reading Entry Progress</span>
          <span className="text-slate-500">{coveredCount} of {occupiedUnits.length} units</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: occupiedUnits.length > 0 ? `${(coveredCount / occupiedUnits.length) * 100}%` : "0%" }}
          />
        </div>
        {coveredCount < occupiedUnits.length && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {occupiedUnits.length - coveredCount} unit(s) still need meter readings
          </p>
        )}
      </div>

      {/* Units Grid */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Meter Readings</h3>
          <span className="text-xs text-slate-500">Click a unit to enter/edit reading</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {occupiedUnits.map(unit => {
            const reading = readingMap[unit.id];
            const hasReading = !!reading;
            return (
              <button
                key={unit.id}
                onClick={() => { setSelected(unit); setShowEntry(true); }}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5 ${hasReading
                  ? "border-blue-200 bg-blue-50 hover:border-blue-400"
                  : "border-dashed border-slate-200 bg-white hover:border-yellow-400 hover:bg-yellow-50"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{unit.unitNumber}</span>
                  <Droplets className={`h-4 w-4 ${hasReading ? "text-blue-500" : "text-slate-300"}`} />
                </div>
                <p className="text-xs text-slate-500 mb-2">{unit.tenants[0]?.firstName} {unit.tenants[0]?.lastName}</p>
                {hasReading ? (
                  <div>
                    <p className="text-sm font-semibold text-blue-700">{formatCurrency(reading.totalAmount)}</p>
                    <p className="text-xs text-blue-500">{reading.unitsUsed.toFixed(1)} m³ used</p>
                    <p className="text-xs text-slate-400 mt-1">{reading.previousReading} → {reading.currentReading}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Enter reading
                  </p>
                )}
              </button>
            );
          })}
          {occupiedUnits.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-400">
              <Droplets className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No occupied units found
            </div>
          )}
        </div>
      </div>

      {/* Readings table */}
      {readings.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Summary Table</h3>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Tenant</th>
                  <th>Previous</th>
                  <th>Current</th>
                  <th>Units Used</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {readings.map(r => (
                  <tr key={r.id}>
                    <td className="font-medium text-slate-900">{r.unit.unitNumber}</td>
                    <td className="text-slate-600">{r.unit.tenants[0]?.firstName} {r.unit.tenants[0]?.lastName}</td>
                    <td className="font-mono text-slate-500">{r.previousReading}</td>
                    <td className="font-mono text-slate-500">{r.currentReading}</td>
                    <td className="font-semibold text-blue-700">{r.unitsUsed.toFixed(1)} m³</td>
                    <td className="text-slate-500">KES {r.ratePerUnit}/m³</td>
                    <td className="font-bold text-slate-900">{formatCurrency(r.totalAmount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="text-slate-600">Totals</td>
                  <td className="text-blue-700">{totalUnitsConsumed.toFixed(1)} m³</td>
                  <td></td>
                  <td className="text-slate-900">{formatCurrency(totalWaterRevenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEntry && selected && (
        <WaterReadingModal
          unit={selected}
          month={month}
          year={year}
          ratePerUnit={ratePerUnit}
          existing={readingMap[selected.id]}
          onClose={() => { setShowEntry(false); setSelected(null); loadData(); }}
        />
      )}
    </div>
  );
}

function WaterReadingModal({ unit, month, year, ratePerUnit, existing, onClose }: {
  unit: Unit; month: number; year: number; ratePerUnit: number; existing?: Reading; onClose: () => void;
}) {
  const [prev, setPrev] = useState(existing?.previousReading?.toString() || "");
  const [curr, setCurr] = useState(existing?.currentReading?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unitsUsed = Math.max(0, (parseFloat(curr) || 0) - (parseFloat(prev) || 0));
  const totalAmount = unitsUsed * ratePerUnit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (parseFloat(curr) < parseFloat(prev)) {
      setError("Current reading cannot be less than previous reading");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitId: unit.id, month, year,
        previousReading: parseFloat(prev),
        currentReading: parseFloat(curr),
        ratePerUnit,
      }),
    });
    if (res.ok) { onClose(); }
    else { const d = await res.json(); setError(d.error); setLoading(false); }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-lg font-semibold">Water Reading — {unit.unitNumber}</h2>
            <p className="text-sm text-slate-500">
              {unit.tenants[0]?.firstName} {unit.tenants[0]?.lastName} · {unit.floor.label}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Previous Reading (m³)</label>
                <input className="input font-mono text-lg" type="number" step="0.01" value={prev} onChange={e => setPrev(e.target.value)} placeholder="0.00" required />
              </div>
              <div>
                <label className="label">Current Reading (m³)</label>
                <input className="input font-mono text-lg" type="number" step="0.01" value={curr} onChange={e => setCurr(e.target.value)} placeholder="0.00" required />
              </div>
            </div>

            {/* Live calculation */}
            {unitsUsed > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Units consumed</span>
                  <span className="font-semibold text-blue-900">{unitsUsed.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Rate per unit</span>
                  <span className="font-semibold text-blue-900">KES {ratePerUnit}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
                  <span className="font-semibold text-blue-900">Total charge</span>
                  <span className="font-bold text-blue-900 text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Save Reading</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
