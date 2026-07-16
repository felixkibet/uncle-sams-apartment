"use client";

import { useEffect, useState } from "react";
import { Plus, Home, Users, Wifi, WifiOff, X, Loader2, ChevronDown } from "lucide-react";
import { formatCurrency, unitTypeLabel } from "@/lib/utils";

type Unit = {
  id: string; unitNumber: string; type: string; rentAmount: number;
  isOccupied: boolean; hasWifi: boolean; wifiAmount: number;
  floor: { id: string; number: number; label: string };
  tenants: Array<{ id: string; firstName: string; lastName: string; phone: string }>;
};
type Floor = { id: string; number: number; label: string };

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [uRes, fRes] = await Promise.all([fetch("/api/units"), fetch("/api/floors")]);
      const uJson = await uRes.json().catch(() => []);
      const fJson = await fRes.json().catch(() => []);
      setUnits(Array.isArray(uJson) ? uJson : []);
      setFloors(Array.isArray(fJson) ? fJson : []);
    } catch (err) {
      console.error("Failed to load units/floors", err);
      setUnits([]);
      setFloors([]);
    } finally {
      setLoading(false);
    }
  }

  const byFloor = floors.map(f => ({
    floor: f,
    units: units.filter(u => u.floor.id === f.id),
  }));

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-48" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Units</h1>
          <p className="page-subtitle">{units.length} total · {units.filter(u => u.isOccupied).length} occupied · {units.filter(u => !u.isOccupied).length} vacant</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddFloor(true)} className="btn-outline">
            <Plus className="h-4 w-4" /> Add Floor
          </button>
          <button onClick={() => setShowAddUnit(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Unit
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-900 inline-block" />Occupied</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border-2 border-dashed border-slate-300 inline-block" />Vacant</span>
      </div>

      {/* Floor grids */}
      {byFloor.length === 0 && (
        <div className="card p-12 text-center">
          <Home className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No floors yet</p>
          <p className="text-slate-400 text-sm mt-1">Add a floor first, then add units to it.</p>
        </div>
      )}

      {byFloor.map(({ floor, units: floorUnits }) => (
        <div key={floor.id} className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold">{floor.number}</span>
              <h2 className="font-semibold text-slate-900">{floor.label}</h2>
            </div>
            <span className="text-xs text-slate-500">{floorUnits.length} units · {floorUnits.filter(u => u.isOccupied).length} occupied</span>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {floorUnits.map(unit => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className={unit.isOccupied ? "unit-card-occupied text-left" : "unit-card-vacant text-left"}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold opacity-70">{unit.unitNumber}</span>
                  {unit.hasWifi
                    ? <Wifi className={`h-3 w-3 ${unit.isOccupied ? "text-yellow-400" : "text-slate-400"}`} />
                    : <WifiOff className="h-3 w-3 opacity-30" />}
                </div>
                <p className={`text-sm font-semibold ${unit.isOccupied ? "text-white" : "text-slate-900"}`}>
                  {unitTypeLabel(unit.type)}
                </p>
                <p className={`text-xs mt-1 ${unit.isOccupied ? "text-slate-300" : "text-slate-500"}`}>
                  {formatCurrency(unit.rentAmount)}/mo
                </p>
                {unit.isOccupied && unit.tenants[0] && (
                  <p className="text-xs mt-1.5 text-yellow-300 truncate">
                    {unit.tenants[0].firstName} {unit.tenants[0].lastName}
                  </p>
                )}
              </button>
            ))}
            {floorUnits.length === 0 && (
              <div className="col-span-full py-6 text-center text-slate-400 text-sm">
                No units on this floor yet
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <UnitDetailModal unit={selectedUnit} onClose={() => { setSelectedUnit(null); loadData(); }} />
      )}

      {/* Add Floor Modal */}
      {showAddFloor && (
        <AddFloorModal onClose={() => { setShowAddFloor(false); loadData(); }} />
      )}

      {/* Add Unit Modal */}
      {showAddUnit && (
        <AddUnitModal floors={floors} onClose={() => { setShowAddUnit(false); loadData(); }} />
      )}
    </div>
  );
}

function UnitDetailModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Unit {unit.unitNumber}</h2>
            <p className="text-sm text-slate-500">{unit.floor.label} · {unitTypeLabel(unit.type)}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Rent", value: formatCurrency(unit.rentAmount) + "/mo" },
              { label: "Status", value: unit.isOccupied ? "Occupied" : "Vacant" },
              { label: "WiFi", value: unit.hasWifi ? `Yes · ${formatCurrency(unit.wifiAmount)}/mo` : "No" },
              { label: "Type", value: unitTypeLabel(unit.type) },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-semibold text-slate-900 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          {unit.tenants.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Current Tenant</p>
              {unit.tenants.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
                    {t.firstName[0]}{t.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{t.firstName} {t.lastName}</p>
                    <p className="text-xs text-slate-500">{t.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <a href={`/units/${unit.id}`} className="btn-primary">View Full Details</a>
        </div>
      </div>
    </div>
  );
}

function AddFloorModal({ onClose }: { onClose: () => void }) {
  const [number, setNumber] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/floors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: parseInt(number), label }),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Add Floor</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <label className="label">Floor Number</label>
              <input className="input" type="number" min="1" value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 1" required />
            </div>
            <div>
              <label className="label">Floor Label</label>
              <input className="input" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. 1st Floor" required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Floor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUnitModal({ floors, onClose }: { floors: Floor[]; onClose: () => void }) {
  const [form, setForm] = useState({
    floorId: "", unitNumber: "", type: "BEDSITTER", rentAmount: "", hasWifi: true, wifiAmount: "1500",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rentAmount: parseFloat(form.rentAmount), wifiAmount: parseFloat(form.wifiAmount) }),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-lg font-semibold">Add Unit</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Floor</label>
                <select className="select" value={form.floorId} onChange={e => setForm(f => ({ ...f, floorId: e.target.value }))} required>
                  <option value="">Select floor</option>
                  {floors.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unit Number</label>
                <input className="input" value={form.unitNumber} onChange={e => setForm(f => ({ ...f, unitNumber: e.target.value }))} placeholder="e.g. 1F-1" required />
              </div>
            </div>
            <div>
              <label className="label">Unit Type</label>
              <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="BEDSITTER">Bedsitter</option>
                <option value="ONE_BEDROOM">1 Bedroom</option>
                <option value="TWO_BEDROOM">2 Bedrooms</option>
              </select>
            </div>
            <div>
              <label className="label">Monthly Rent (KES)</label>
              <input className="input" type="number" value={form.rentAmount} onChange={e => setForm(f => ({ ...f, rentAmount: e.target.value }))} placeholder="e.g. 8000" required />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="hasWifi" checked={form.hasWifi} onChange={e => setForm(f => ({ ...f, hasWifi: e.target.checked }))} className="h-4 w-4 rounded" />
              <label htmlFor="hasWifi" className="text-sm text-slate-700">WiFi included</label>
            </div>
            {form.hasWifi && (
              <div>
                <label className="label">WiFi Charge (KES/mo)</label>
                <input className="input" type="number" value={form.wifiAmount} onChange={e => setForm(f => ({ ...f, wifiAmount: e.target.value }))} />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
