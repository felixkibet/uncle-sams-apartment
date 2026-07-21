import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  createTenantSessionToken,
  TENANT_SESSION_COOKIE,
} from "@/lib/tenantAuth";

const loginSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  phone: z.string().trim().min(7),
});

function normalizeInvoiceNumber(invoiceNumber: string) {
  return invoiceNumber.trim().replace(/\s+/g, "").toUpperCase();
}

function normalizePhone(phone: string) {
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("254") && digits.length > 9) {
    digits = `0${digits.slice(3)}`;
  }
  if (digits.length === 9 && digits.startsWith("7")) {
    digits = `0${digits}`;
  }
  return digits;
}

function phoneMatches(inputPhone: string, savedPhone: string) {
  const normalizedInput = normalizePhone(inputPhone);
  const normalizedSaved = normalizePhone(savedPhone);
  return normalizedInput === normalizedSaved;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);
    const invoiceNumber = normalizeInvoiceNumber(data.invoiceNumber);

    const invoice = await db.invoice.findFirst({
      where: { invoiceNumber: { equals: invoiceNumber, mode: "insensitive" } },
      include: { tenant: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invalid invoice number or phone" },
        { status: 401 },
      );
    }

    const tenantPhone = invoice.tenant.phone || "";
    if (!tenantPhone || !phoneMatches(data.phone, tenantPhone)) {
      return NextResponse.json(
        { error: "Invalid invoice number or phone" },
        { status: 401 },
      );
    }

    const token = createTenantSessionToken({
      tenantId: invoice.tenantId,
      invoiceNumber: invoice.invoiceNumber,
      expiresAt: Date.now() + 1000 * 60 * 30,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: TENANT_SESSION_COOKIE,
      value: token,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 30,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid login details" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Unable to sign in" }, { status: 500 });
  }
}
