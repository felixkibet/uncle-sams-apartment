import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: any }) {
  const { id } = (await params) as { id: string };
  // Minimal implementation: attempt to find SMTP config, otherwise return instructions.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } =
    process.env as any;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !FROM_EMAIL) {
    return NextResponse.json(
      {
        error:
          "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, FROM_EMAIL in .env and install nodemailer.",
      },
      { status: 501 },
    );
  }

  // Try dynamic import of nodemailer so project doesn't fail if missing.
  let nodemailer: any;
  try {
    nodemailer = await import("nodemailer");
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "nodemailer not installed. Run `npm i nodemailer` to enable email sending.",
      },
      { status: 501 },
    );
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { tenant: true, unit: true },
    });
    if (!invoice)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || "587"),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const html = `
      <h2>Invoice ${invoice.invoiceNumber}</h2>
      <p>Dear ${invoice.tenant.firstName} ${invoice.tenant.lastName},</p>
      <p>Attached is your invoice for ${invoice.month}/${invoice.year}. Total: ${invoice.totalAmount}</p>
      <p>Visit the portal to view details.</p>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: invoice.tenant.email || undefined,
      subject: `Invoice ${invoice.invoiceNumber}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 },
    );
  }
}
