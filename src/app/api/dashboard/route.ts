import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      totalUnits,
      occupiedUnits,
      totalTenants,
      monthInvoices,
      recentPayments,
      totalArrearsAgg,
    ] = await Promise.all([
      db.unit.count(),
      db.unit.count({ where: { isOccupied: true } }),
      db.tenant.count({ where: { isActive: true } }),
      db.invoice.findMany({
        where: { month, year },
        select: { totalAmount: true, paidAmount: true, status: true },
      }),
      db.payment.findMany({
        take: 8,
        orderBy: { paidAt: "desc" },
        include: {
          tenant: { select: { firstName: true, lastName: true } },
          invoice: { select: { id: true, invoiceNumber: true } },
        },
      }),
      db.invoice.aggregate({
        where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } },
        _sum: { balanceDue: true },
      }),
    ]);

    const monthlyRevenue = monthInvoices.reduce((s, i) => s + i.paidAmount, 0);
    const monthlyTarget  = monthInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const paidInvoices   = monthInvoices.filter((i) => i.status === "PAID").length;
    const unpaidInvoices = monthInvoices.filter((i) => i.status !== "PAID").length;
    const collectionRate = monthlyTarget > 0
      ? Math.round((monthlyRevenue / monthlyTarget) * 100)
      : 0;

    return NextResponse.json({
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      totalTenants,
      monthlyRevenue,
      monthlyTarget,
      collectionRate,
      totalArrears: totalArrearsAgg._sum.balanceDue || 0,
      paidInvoices,
      unpaidInvoices,
      recentPayments,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
