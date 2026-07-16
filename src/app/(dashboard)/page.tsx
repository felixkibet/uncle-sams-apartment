"use client";

import { useEffect, useState } from "react";
import {
  Home, Users, TrendingUp, AlertCircle, CheckCircle2,
  Building2, Droplets, ArrowUpRight, Clock
} from "lucide-react";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, chartRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch(`/api/reports?type=monthly&year=${now.getFullYear()}`),
        ]);
        const sJson = await statsRes.json().catch(() => ({}));
        const cJson = await chartRes.json().catch(() => []);
        const s = (sJson && typeof sJson === 'object') ? sJson : {};
        const cArr = Array.isArray(cJson) ? cJson : [];
        const safeStats = {
          totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
          totalTenants: 0, monthlyRevenue: 0, collectionRate: 0,
          totalArrears: 0, unpaidInvoices: 0, paidInvoices: 0, monthlyTarget: 0,
          recentPayments: [],
          ...s,
        };
        setStats(safeStats);
        setChartData(cArr.map((d: any) => ({ ...d, name: MONTHS[(d.month || 1) - 1] })));
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setStats({
          totalUnits: 0, occupiedUnits: 0, vacantUnits: 0,
          totalTenants: 0, monthlyRevenue: 0, collectionRate: 0,
          totalArrears: 0, unpaidInvoices: 0, paidInvoices: 0, monthlyTarget: 0,
          recentPayments: [],
        });
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    {
      label: "Total Units",
      value: stats.totalUnits,
      sub: `${stats.occupiedUnits} occupied · ${stats.vacantUnits} vacant`,
      icon: Home,
      color: "bg-slate-100 text-slate-700",
      accent: "text-slate-900",
    },
    {
      label: "Active Tenants",
      value: stats.totalTenants,
      sub: "Currently residing",
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      accent: "text-blue-700",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      sub: `${stats.collectionRate}% collection rate`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
      accent: "text-emerald-700",
    },
    {
      label: "Total Arrears",
      value: formatCurrency(stats.totalArrears),
      sub: `${stats.unpaidInvoices} unpaid invoices`,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
      accent: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {formatMonth(now.getMonth() + 1, now.getFullYear())} · Uncle Sam&apos;s Apartment
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
          <Building2 className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700 font-medium">Nyayo Gate B, Embakasi</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`stat-icon ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{card.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${card.accent}`}>{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-slate-900">Revenue Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">{now.getFullYear()} monthly collection</p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700">
              {stats.collectionRate}% collected
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any, name: string) => [formatCurrency(v), name === "revenue" ? "Collected" : "Target"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Area type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2}
                fill="url(#colorTarget)" strokeDasharray="4 4" name="target" />
              <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2}
                fill="url(#colorRev)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Collection status */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">Collection Progress</span>
                <span className="font-semibold text-slate-900">{stats.collectionRate}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-emerald-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Paid</span>
                </div>
                <p className="text-xl font-bold text-emerald-700">{stats.paidInvoices}</p>
                <p className="text-xs text-emerald-600">invoices</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs text-red-500 font-medium">Pending</span>
                </div>
                <p className="text-xl font-bold text-red-600">{stats.unpaidInvoices}</p>
                <p className="text-xs text-red-500">invoices</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Target</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.monthlyTarget)}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Collected: <span className="text-emerald-600 font-medium">{formatCurrency(stats.monthlyRevenue)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Payments</h3>
          <a href="/payments" className="text-xs text-yellow-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-8">No payments recorded yet</td>
                </tr>
              )}
              {stats.recentPayments?.map((p: any) => (
                <tr key={p.id}>
                  <td className="font-medium text-slate-900">
                    {p.tenant.firstName} {p.tenant.lastName}
                  </td>
                  <td className="text-slate-500 font-mono text-xs">{p.invoice?.invoiceNumber}</td>
                  <td className="font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td>
                    <span className={`badge ${p.method === "MPESA" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {p.method}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs">{formatDate(p.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card h-72" />
        <div className="card h-72" />
      </div>
    </div>
  );
}
