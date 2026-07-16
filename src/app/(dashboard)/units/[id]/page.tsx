"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Unit = {
  id: string;
  unitNumber: string;
  floor: { id: string; label: string } | null;
  type: string;
  rentAmount: number;
  isOccupied: boolean;
  tenants?: any[];
};

export default function UnitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ unitNumber: "", type: "BEDSITTER", rentAmount: 0, hasWifi: true, wifiAmount: 1500, isOccupied: false });

  async function fetchUnit() {
    setLoading(true);
    try {
      if (!id) return;
      const res = await fetch(`/api/units/${id}`);
      const data = await res.json();
      if (!res.ok) console.error(data);
      setUnit(data);
      setForm({ unitNumber: data?.unitNumber ?? "", type: data?.type ?? "BEDSITTER", rentAmount: data?.rentAmount ?? 0, hasWifi: data?.hasWifi ?? true, wifiAmount: data?.wifiAmount ?? 1500, isOccupied: data?.isOccupied ?? false });
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchUnit(); }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/units/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        setEditing(false);
        fetchUnit();
      } else console.error(await res.text());
    } catch (err) { console.error(err); }
  }

  async function handleDelete() {
    if (!confirm("Delete this unit?")) return;
    try {
      const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
      if (res.ok) router.push('/units');
      else console.error(await res.text());
    } catch (err) { console.error(err); }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!unit) return <div className="p-6">Unit not found</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{unit.unitNumber}</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={()=>setEditing(e=>!e)}>{editing? 'Cancel' : 'Edit'}</button>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {!editing && (
        <div className="space-y-2">
          <p><strong>Floor:</strong> {unit.floor?.label ?? '-'}</p>
          <p><strong>Type:</strong> {unit.type}</p>
          <p><strong>Rent:</strong> {unit.rentAmount}</p>
          <p><strong>Occupied:</strong> {unit.isOccupied ? 'Yes' : 'No'}</p>
          <p><strong>Tenants:</strong> {(unit.tenants || []).length}</p>
        </div>
      )}

      {editing && (
        <form onSubmit={handleUpdate} className="mt-4 space-y-2 max-w-md">
          <input value={form.unitNumber} onChange={e=>setForm({...form,unitNumber:e.target.value})} className="input" />
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="input">
            <option value="BEDSITTER">BEDSITTER</option>
            <option value="ONE_BEDROOM">ONE_BEDROOM</option>
            <option value="TWO_BEDROOM">TWO_BEDROOM</option>
          </select>
          <input type="number" value={form.rentAmount} onChange={e=>setForm({...form,rentAmount:Number(e.target.value)})} className="input" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasWifi} onChange={e=>setForm({...form,hasWifi:e.target.checked})} /> Has wifi</label>
          <div>
            <button className="btn-primary" type="submit">Save</button>
          </div>
        </form>
      )}
    </div>
  );
}
