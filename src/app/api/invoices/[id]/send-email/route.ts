import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

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

    const tenantName = `${invoice.tenant.firstName} ${invoice.tenant.lastName}`;
    const invoiceDate = formatMonth(invoice.month, invoice.year);
    const dueDate = formatDate(invoice.dueDate);
    const totalAmount = formatCurrency(invoice.totalAmount);
    const unitLabel = invoice.unit?.unitNumber || "Unit";
    const portalUrl = process.env.APP_URL || "https://app.example.com";

    const html = `
      <div style="font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="padding: 24px; border-bottom: 1px solid #E5E7EB;">
          <p style="margin: 0; color: #6B7280; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;">Uncle Sam's Apartment</p>
          <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #111827;">Invoice ${invoice.invoiceNumber}</h1>
          <p style="margin: 8px 0 0; color: #4B5563; font-size: 14px;">${invoiceDate} · Due ${dueDate}</p>
        </div>

        <div style="padding: 24px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em;">Billed To</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${tenantName}</p>
          <p style="margin: 4px 0 0; color: #4B5563; font-size: 14px;">${invoice.tenant.email || ""}</p>
          <p style="margin: 4px 0 0; color: #4B5563; font-size: 14px;">${unitLabel}</p>
        </div>

        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 16px; color: #111827;">Dear ${tenantName},</p>
          <p style="margin: 0 0 16px; color: #4B5563; font-size: 15px;">Please find your invoice summary for the period <strong>${invoiceDate}</strong>. Your total amount due is <strong>${totalAmount}</strong>.</p>

          <div style="border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
            <div style="background: #F3F4F6; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; color: #6B7280;">Invoice Number</span>
              <span style="font-size: 14px; color: #111827; font-weight: 600;">${invoice.invoiceNumber}</span>
            </div>
            <div style="padding: 16px; display: grid; gap: 12px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280;">Billing Period</span>
                <span style="color: #111827; font-weight: 600;">${invoiceDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280;">Due Date</span>
                <span style="color: #111827; font-weight: 600;">${dueDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #6B7280;">Property</span>
                <span style="color: #111827; font-weight: 600;">Uncle Sam's Apartment</span>
              </div>
            </div>
          </div>

          <div style="margin: 24px 0; padding: 20px; background: #111827; color: #FFFFFF; border-radius: 12px;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em;">Amount Due</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700;">${totalAmount}</p>
          </div>

          <p style="margin: 0 0 16px; color: #4B5563; font-size: 15px;">If you have already paid, please disregard this message. Otherwise, you may make payment via the tenant portal.</p>
          <p style="margin: 0 0 24px; color: #4B5563; font-size: 15px;">View your invoice and payment options here:</p>
          <a href="${portalUrl}/invoices/${invoice.id}" style="display: inline-block; padding: 12px 20px; background: #111827; color: #FFFFFF; border-radius: 8px; text-decoration: none; font-size: 15px;">View Invoice</a>
        </div>

        <div style="padding: 24px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 13px;">
          <p style="margin: 0 0 4px;">Uncle Sam's Apartment</p>
          <p style="margin: 0;">Nyayo Gate B, Naivas Court, Embakasi</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: invoice.tenant.email || undefined,
      subject: `Invoice ${invoice.invoiceNumber} from Uncle Sam's Apartment`,
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
