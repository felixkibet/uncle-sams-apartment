import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/utils";

const invoiceSchema = z.object({
  unitId: z.string(),
  tenantId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  rentAmount: z.number().nonnegative(),
  waterAmount: z.number().nonnegative().default(0),
  wifiAmount: z.number().nonnegative().default(0),
  otherCharges: z.number().nonnegative().default(0),
  dueDate: z.string(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const tenantId = searchParams.get("tenantId");
    const invoiceNumber = searchParams.get("invoiceNumber");

    const invoices = await db.invoice.findMany({
      where: {
        ...(month ? { month: parseInt(month) } : {}),
        ...(year ? { year: parseInt(year) } : {}),
        ...(status ? { status: status as any } : {}),
        ...(tenantId ? { tenantId } : {}),
        ...(invoiceNumber ? { invoiceNumber } : {}),
      },
      include: {
        unit: { include: { floor: true } },
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        payments: { orderBy: { paidAt: "desc" } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = invoiceSchema.parse(body);

    const totalAmount =
      data.rentAmount + data.waterAmount + data.wifiAmount + data.otherCharges;

    // Get sequence number for invoice
    const count = await db.invoice.count({
      where: { month: data.month, year: data.year },
    });
    const invoiceNumber = generateInvoiceNumber(
      data.month,
      data.year,
      count + 1,
    );

    const invoice = await db.invoice.create({
      data: {
        ...data,
        invoiceNumber,
        totalAmount,
        balanceDue: totalAmount,
        dueDate: new Date(data.dueDate),
        status: "UNPAID",
      },
      include: {
        unit: { include: { floor: true } },
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        payments: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}

// Bulk generate invoices for all active tenants
export async function PUT(req: NextRequest) {
  try {
    const { month, year, dueDate, includeWifi = true } = await req.json();

    const activeTenants = await db.tenant.findMany({
      where: { isActive: true },
      include: {
        unit: { include: { waterReadings: { where: { month, year } } } },
      },
    });

    const created = [];
    const skipped = [];

    for (const tenant of activeTenants) {
      const existing = await db.invoice.findUnique({
        where: { unitId_month_year: { unitId: tenant.unitId, month, year } },
      });
      if (existing) {
        skipped.push(tenant.unit.unitNumber);
        continue;
      }

      const waterReading = tenant.unit.waterReadings[0];
      const waterAmount = waterReading?.totalAmount || 0;
      const wifiAmount =
        includeWifi && tenant.unit.hasWifi ? tenant.unit.wifiAmount : 0;
      const totalAmount = tenant.unit.rentAmount + waterAmount + wifiAmount;

      const count = await db.invoice.count({ where: { month, year } });
      const invoiceNumber = generateInvoiceNumber(month, year, count + 1);

      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          unitId: tenant.unitId,
          tenantId: tenant.id,
          month,
          year,
          rentAmount: tenant.unit.rentAmount,
          waterAmount,
          wifiAmount,
          totalAmount,
          balanceDue: totalAmount,
          dueDate: new Date(dueDate),
          status: "UNPAID",
        },
      });
      created.push(invoice);
    }

    return NextResponse.json({
      created: created.length,
      skipped: skipped.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to bulk generate invoices" },
      { status: 500 },
    );
  }
}
