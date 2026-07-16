"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  title, message,
  confirmLabel = "Confirm",
  confirmClass = "btn-danger",
  onConfirm, onCancel, loading,
}: ConfirmDialogProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-card-lg w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2.5 bg-red-100 rounded-xl flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline">Cancel</button>
          <button onClick={onConfirm} className={confirmClass} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
