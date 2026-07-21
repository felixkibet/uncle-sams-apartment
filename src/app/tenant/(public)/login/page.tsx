"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function TenantLoginPage() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tenant/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber: invoiceNumber.trim(), phone: phone.trim() }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Invalid login details. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/tenant");
    } catch (err) {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-navy flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500 rounded-xl">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Uncle Sam&apos;s Apartment</span>
        </div>

        <div>
          <div className="mb-8">
            <div className="w-16 h-1 bg-yellow-500 rounded-full mb-6" />
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">Tenant portal access</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sign in to view your invoices, download your PDF, and see payment instructions.
            </p>
          </div>
        </div>

        <p className="text-slate-500 text-sm">Nyayo Gate B, Naivas Court · Embakasi, Nairobi</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Tenant login</h2>
            <p className="text-slate-500 mt-1">Enter your invoice number and the phone number registered with your tenancy.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Invoice number</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. USA-202607-008"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone number</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPhone ? "text" : "tel"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPhone ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
