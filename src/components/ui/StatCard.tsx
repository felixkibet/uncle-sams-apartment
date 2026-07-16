import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconClass?: string;
  valueClass?: string;
  trend?: { value: number; label: string };
}

export function StatCard({
  label, value, subtitle, icon: Icon,
  iconClass = "bg-slate-100 text-slate-600",
  valueClass = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={cn("stat-icon rounded-xl p-2.5", iconClass)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={cn("text-2xl font-bold mt-0.5 truncate", valueClass)}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
