import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  waterAmount: z.number().nonnegative().optional(),
  wifiAmount: z.number().nonnegative().optional(),
  otherCharges: z.number().nonnegative().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(["UNPAID", "PARTIAL", "PAID", "OVERDUE"]).optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        unit: { include: { floor: true } },
        tenant: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
    });
    if (!invoice)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { id } = (await params) as { id: string };

    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const totalAmount =
      (data.waterAmount !== undefined
        ? data.waterAmount
        : existing.waterAmount) +
      (data.wifiAmount !== undefined ? data.wifiAmount : existing.wifiAmount) +
      (data.otherCharges !== undefined
        ? data.otherCharges
        : existing.otherCharges) +
      existing.rentAmount;

    const invoice = await db.invoice.update({
      where: { id },
      data: {
        ...data,
        totalAmount,
        balanceDue: totalAmount - existing.paidAmount,
      },
      include: {
        unit: { include: { floor: true } },
        tenant: true,
        payments: true,
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    await db.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
