import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="p-4 bg-slate-100 rounded-2xl inline-block mb-6">
          <AlertCircle className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 text-lg mb-8">Page not found</p>
        <Link href="/dashboard" className="btn-primary inline-flex">
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
