"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
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
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Manage your<br />property with ease
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Streamlined rent collection, water billing, invoice generation,
              and financial reporting for Uncle Sam&apos;s Apartment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Units", value: "Multi-floor" },
              { label: "Location", value: "Embakasi, NBI" },
              { label: "Billing", value: "Auto-monthly" },
              { label: "Reports", value: "Real-time" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-white font-semibold mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-sm">
          Nyayo Gate B, Naivas Court · Embakasi, Nairobi
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2.5 bg-slate-900 rounded-xl">
              <Building2 className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="font-bold text-slate-900">Uncle Sam&apos;s Apartment</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-1">Sign in to access the management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="unglesam@gmail.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center">
              Uncle Sam&apos;s Apartment Management System
              <br />0738 822 454 · unglesam@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
