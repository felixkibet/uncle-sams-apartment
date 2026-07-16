"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Home, AlertCircle, Download } from "lucide-react";
import { formatCurrency, formatMonth } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [arrearsData, setArrearsData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [year]);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, oRes, aRes, eRes] = await Promise.all([
        fetch(`/api/reports?type=monthly&year=${year}`),
        fetch(`/api/reports?type=occupancy`),
        fetch(`/api/reports?type=arrears`),
        fetch(`/api/reports?type=expenses&year=${year}`),
      ]);
      const mJson = await mRes.json().catch(() => []);
      const oJson = await oRes.json().catch(() => []);
      const aJson = await aRes.json().catch(() => []);
      const eJson = await eRes.json().catch(() => []);

      const mArr = Array.isArray(mJson) ? mJson : [];
      const oArr = Array.isArray(oJson) ? oJson : [];
      const aArr = Array.isArray(aJson) ? aJson : [];
      const eArr = Array.isArray(eJson) ? eJson : [];

      setMonthlyData(mArr.map((d: any) => ({ ...d, name: MONTHS[d.month - 1] })));
      setOccupancyData(oArr);
      setArrearsData(aArr);
      setExpenseData(eArr.map((d: any) => ({ name: d.category, value: (d._sum && d._sum.amount) || 0 })));
    } catch (err) {
      console.error('Failed to load reports', err);
      setMonthlyData([]);
      setOccupancyData([]);
      setArrearsData([]);
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalTarget = monthlyData.reduce((s, d) => s + d.target, 0);
  const avgCollection = totalTarget > 0 ? Math.round((totalRevenue / totalTarget) * 100) : 0;
  const totalArrears = arrearsData.reduce((s: number, d: any) => s + d.balanceDue, 0);

  const PIE_COLORS = ["#0F172A","#F59E0B","#10b981","#ef4444","#8b5cf6","#06b6d4","#64748b"];

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i)=><div key={i} className="card h-24"/>)}</div>
      <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i)=><div key={i} className="card h-64"/>)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial & occupancy analytics</p>
        </div>
        <select className="select w-auto" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-slate-100 text-slate-700"><TrendingUp className="h-5 w-5"/></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Revenue {year}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{avgCollection}% avg collection rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow-50 text-yellow-600"><BarChart3 className="h-5 w-5"/></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Target {year}</p>
            <p className="text-2xl font-bold text-yellow-700 mt-0.5">{formatCurrency(totalTarget)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Gap: {formatCurrency(totalTarget - totalRevenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-50 text-red-600"><AlertCircle className="h-5 w-5"/></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Arrears</p>
            <p className="text-2xl font-bold text-red-600 mt-0.5">{formatCurrency(totalArrears)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{arrearsData.length} outstanding invoices</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-slate-900">Monthly Revenue vs Target — {year}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Collected vs billed per month</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: any, name: string) => [formatCurrency(v), name === "revenue" ? "Collected" : "Target"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="target" fill="#e2e8f0" radius={[4,4,0,0]} name="target" />
            <Bar dataKey="revenue" fill="#0F172A" radius={[4,4,0,0]} name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Occupancy + Expenses row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Occupancy by Floor */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Occupancy by Floor</h3>
          {occupancyData.length === 0
            ? <p className="text-slate-400 text-sm text-center py-8">No data</p>
            : (
              <div className="space-y-4">
                {occupancyData.map((d: any) => {
                  const pct = d.total > 0 ? Math.round((d.occupied / d.total) * 100) : 0;
                  return (
                    <div key={d.floor}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-slate-700">{d.floor}</span>
                        <span className="text-slate-500">{d.occupied}/{d.total} units · <span className="font-semibold text-slate-900">{pct}%</span></span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>

        {/* Expenses Breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Expenses by Category — {year}</h3>
          {expenseData.length === 0
            ? <p className="text-slate-400 text-sm text-center py-8">No expense data</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expenseData} dataKey="value" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                    {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => v.charAt(0) + v.slice(1).toLowerCase()} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </div>
      </div>

      {/* Arrears Table */}
      {arrearsData.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Outstanding Arrears</h3>
            <span className="badge bg-red-50 text-red-700">{formatCurrency(totalArrears)} total</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Invoice</th>
                  <th>Period</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {arrearsData.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="font-medium text-slate-900">{inv.tenant.firstName} {inv.tenant.lastName}</td>
                    <td className="text-slate-500">{inv.unit.unitNumber}</td>
                    <td><a href={`/invoices/${inv.id}`} className="font-mono text-xs text-yellow-600 hover:underline">{inv.invoiceNumber}</a></td>
                    <td className="text-slate-500 text-xs">{formatMonth(inv.month, inv.year)}</td>
                    <td className="font-bold text-red-600">{formatCurrency(inv.balanceDue)}</td>
                    <td><span className={`badge ${inv.status === "OVERDUE" ? "badge-overdue" : "badge-unpaid"}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
