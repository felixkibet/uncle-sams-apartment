import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "monthly";
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (type === "monthly") {
      // Monthly revenue for the year
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const data = await Promise.all(
        months.map(async (month) => {
          const invoices = await db.invoice.findMany({ where: { month, year } });
          const payments = await db.payment.findMany({
            where: {
              paidAt: {
                gte: new Date(year, month - 1, 1),
                lt: new Date(year, month, 1),
              },
            },
          });
          return {
            month,
            year,
            revenue: invoices.reduce((s, i) => s + i.paidAmount, 0),
            target: invoices.reduce((s, i) => s + i.totalAmount, 0),
            collected: payments.reduce((s, p) => s + p.amount, 0),
            invoiceCount: invoices.length,
          };
        })
      );
      return NextResponse.json(data);
    }

    if (type === "occupancy") {
      const units = await db.unit.findMany({
        include: { floor: true },
      });
      const byFloor = units.reduce((acc: any, u) => {
        const key = u.floor.label;
        if (!acc[key]) acc[key] = { floor: key, total: 0, occupied: 0 };
        acc[key].total++;
        if (u.isOccupied) acc[key].occupied++;
        return acc;
      }, {});
      return NextResponse.json(Object.values(byFloor));
    }

    if (type === "arrears") {
      const arrears = await db.invoice.findMany({
        where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } },
        include: {
          tenant: { select: { firstName: true, lastName: true, phone: true } },
          unit: { select: { unitNumber: true } },
        },
        orderBy: { balanceDue: "desc" },
      });
      return NextResponse.json(arrears);
    }

    if (type === "expenses") {
      const expenses = await db.expense.groupBy({
        by: ["category"],
        _sum: { amount: true },
        where: {
          date: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
      });
      return NextResponse.json(expenses);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
