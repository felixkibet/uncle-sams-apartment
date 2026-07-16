import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
        invoice: true,
      },
    });
    if (!payment)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(payment);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id } });

      // Reverse the invoice paid amount
      const invoice = await tx.invoice.findUnique({
        where: { id: payment.invoiceId },
      });
      if (invoice) {
        const newPaid = Math.max(0, invoice.paidAmount - payment.amount);
        const newBalance = invoice.totalAmount - newPaid;
        const newStatus =
          newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID";
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 },
    );
  }
}
