"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="p-4 bg-red-50 rounded-2xl inline-block mb-6">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-8">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
          <a href="/dashboard" className="btn-outline">
            <Home className="h-4 w-4" /> Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
