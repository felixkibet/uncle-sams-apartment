import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date as any);
  if (!isFinite(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatMonth(month: number, year: number): string {
  return new Date(year, month - 1).toLocaleDateString("en-KE", {
    month: "long",
    year: "numeric",
  });
}

export function getMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function generateInvoiceNumber(
  month: number,
  year: number,
  seq: number,
): string {
  const m = String(month).padStart(2, "0");
  const s = String(seq).padStart(3, "0");
  return `USA-${year}${m}-${s}`;
}

export function unitTypeLabel(type: string): string {
  const map: Record<string, string> = {
    BEDSITTER: "Bedsitter",
    ONE_BEDROOM: "1 Bedroom",
    TWO_BEDROOM: "2 Bedrooms",
  };
  return map[type] || type;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PAID: "text-success-600 bg-success-50",
    PARTIAL: "text-gold-700 bg-gold-100",
    UNPAID: "text-danger-600 bg-danger-50",
    OVERDUE: "text-danger-600 bg-danger-50",
  };
  return map[status] || "text-gray-600 bg-gray-100";
}

export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}
