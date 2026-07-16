import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "paid" | "unpaid" | "partial" | "overdue" | "active" | "inactive";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  paid: "bg-emerald-50 text-emerald-700",
  unpaid: "bg-red-50 text-red-700",
  partial: "bg-amber-50 text-amber-700",
  overdue: "bg-red-50 text-red-700",
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("badge", variants[variant], className)}>
      {children}
    </span>
  );
}
