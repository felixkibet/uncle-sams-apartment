"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export function Toast({ message, type = "success", onClose }: ToastProps) {
  const styles = {
    success: "bg-emerald-600 text-white",
    error: "bg-red-600 text-white",
    info: "bg-slate-800 text-white",
  };

  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
  }[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-card-lg text-sm font-medium animate-slide-up ${styles[type]}`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ── ToastContainer ───────────────────────────────────────────────────────────
interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
