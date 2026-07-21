"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocalStorage } from "@/hooks";
import {
  Building2, Phone, Mail, MapPin, Save, Loader2,
  Lock, CheckCircle2, User, Shield,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Property form state
  const [propSaving, setPropSaving] = useState(false);
  const [propSaved, setPropSaved] = useState(false);
  const [prop, setProp] = useLocalStorage<{
    name: string;
    email: string;
    phone: string;
    address: string;
    waterRate: string;
    wifiRate: string;
    rentDueDay: string;
  }>("uncle-sams-apt-settings", {
    name: "Uncle Sam's Apartment",
    email: "unglesam@gmail.com",
    phone: "0738822454",
    address: "Nyayo Gate B, Naivas Court, Embakasi, Nairobi",
    waterRate: "150",
    wifiRate: "1500",
    rentDueDay: "5",
  });

  // Password form state
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  async function handlePropSave(e: React.FormEvent) {
    e.preventDefault();
    setPropSaving(true);
    // In a real app, save to a settings table or env config
    await new Promise((r) => setTimeout(r, 600));
    setPropSaving(false);
    setPropSaved(true);
    setTimeout(() => setPropSaved(false), 3000);
  }

  async function handlePwChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pw.next !== pw.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pw.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to update password.");
        return;
      }
      setPwSaved(true);
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch {
      setPwError("An error occurred. Please try again.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage property details and account preferences</p>
      </div>

      {/* ── Property Information ── */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Property Information</h2>
        </div>
        <form onSubmit={handlePropSave}>
          <div className="p-6 space-y-4">
            <div>
              <label className="label">Property Name</label>
              <input
                className="input"
                value={prop.name}
                onChange={(e) => setProp((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-10"
                    type="email"
                    value={prop.email}
                    onChange={(e) => setProp((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="input pl-10"
                    value={prop.phone}
                    onChange={(e) => setProp((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="label">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  className="input pl-10 h-20 resize-none"
                  value={prop.address}
                  onChange={(e) => setProp((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-4">Default Billing Rates</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Water Rate (KES/m³)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={prop.waterRate}
                    onChange={(e) => setProp((p) => ({ ...p, waterRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Default WiFi (KES/mo)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={prop.wifiRate}
                    onChange={(e) => setProp((p) => ({ ...p, wifiRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Rent Due Day</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="28"
                    value={prop.rentDueDay}
                    onChange={(e) => setProp((p) => ({ ...p, rentDueDay: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            {propSaved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Settings saved
              </span>
            ) : <span />}
            <button type="submit" className="btn-primary" disabled={propSaving}>
              {propSaving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <><Save className="h-4 w-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change Password ── */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handlePwChange}>
          <div className="p-6 space-y-4">
            {pwError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {pwError}
              </div>
            )}
            <div>
              <label className="label">Current Password</label>
              <input
                className="input"
                type="password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                className="input"
                type="password"
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                minLength={8}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                required
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            {pwSaved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Password updated successfully
              </span>
            ) : <span />}
            <button type="submit" className="btn-primary" disabled={pwSaving}>
              {pwSaving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Account Info ── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Account</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-28 text-slate-500 flex-shrink-0">Name</dt>
            <dd className="text-slate-900 font-medium">{session?.user?.name || "—"}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-28 text-slate-500 flex-shrink-0">Email</dt>
            <dd className="text-slate-900 font-medium">{session?.user?.email || "—"}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-28 text-slate-500 flex-shrink-0">Role</dt>
            <dd>
              <span className="badge bg-slate-900 text-white">
                {(session?.user as any)?.role || "MANAGER"}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* ── System Info ── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">System</h2>
        </div>
        <dl className="space-y-3 text-sm">
          {[
            { label: "App", value: "Uncle Sam's Apartment Management System" },
            { label: "Version", value: "1.0.0" },
            { label: "Framework", value: "Next.js 14 · Prisma · Supabase" },
            { label: "Hosting", value: "Vercel" },
            { label: "Location", value: "Nyayo Gate B, Naivas Court, Embakasi" },
          ].map((item) => (
            <div key={item.label} className="flex gap-4">
              <dt className="w-28 text-slate-500 flex-shrink-0">{item.label}</dt>
              <dd className="text-slate-900 font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
