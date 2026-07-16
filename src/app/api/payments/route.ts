import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const paymentSchema = z.object({
  invoiceId: z.string(),
  tenantId: z.string(),
  amount: z.number().positive(),
  method: z.enum(["MPESA", "CASH", "BANK_TRANSFER", "CHEQUE"]),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paidAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const invoiceId = searchParams.get("invoiceId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const payments = await db.payment.findMany({
      where: {
        ...(tenantId ? { tenantId } : {}),
        ...(invoiceId ? { invoiceId } : {}),
      },
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
        invoice: { select: { id: true, invoiceNumber: true, month: true, year: true } },
      },
      orderBy: { paidAt: "desc" },
      take: limit,
    });

    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = paymentSchema.parse(body);

    const payment = await db.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          ...data,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        },
        include: {
          tenant: { select: { id: true, firstName: true, lastName: true, phone: true } },
          invoice: true,
        },
      });

      // Update invoice paid amount and status
      const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
      if (!invoice) throw new Error("Invoice not found");

      const newPaidAmount = invoice.paidAmount + data.amount;
      const newBalance = invoice.totalAmount - newPaidAmount;
      const newStatus =
        newBalance <= 0 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "UNPAID";

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceDue: Math.max(0, newBalance),
          status: newStatus,
        },
      });

      return p;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
