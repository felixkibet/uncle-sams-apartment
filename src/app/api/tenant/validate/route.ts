import { NextRequest, NextResponse } from "next/server";
import { parseTenantSessionToken } from "@/lib/tenantAuth";
import { db } from "@/lib/db";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=") ?? null;
}

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");
  const token = getCookieValue(cookieHeader, "tenant_session");
  if (!token) return NextResponse.json({ valid: false }, { status: 401 });

  const payload = parseTenantSessionToken(token);
  if (!payload || payload.expiresAt < Date.now()) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const invoice = await db.invoice.findUnique({
    where: { invoiceNumber: payload.invoiceNumber },
  });

  if (!invoice || invoice.tenantId !== payload.tenantId) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
