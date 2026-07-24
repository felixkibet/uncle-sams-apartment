import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { parseTenantSessionToken } from "@/lib/tenantAuth";
import type { ReactNode } from "react";
import ClientTenantAuth from "./ClientTenantAuth";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match?.split("=").slice(1).join("=") ?? null;
}

function getCookieHeader() {
  const headerSource: any = headers();
  if (typeof headerSource.get === "function") {
    return headerSource.get("cookie");
  }
  if (typeof headerSource.cookie === "string") {
    return headerSource.cookie;
  }
  return null;
}

async function validateTenantSession() {
  const cookieHeader = getCookieHeader();

  const validateUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? `${process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "")}/api/tenant/validate`
    : "http://localhost:3000/api/tenant/validate";

  const resp = await fetch(validateUrl, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });

  if (!resp.ok) {
    // Return false so client-side fallback can handle redirect
    return { valid: false };
  }

  const data = await resp.json();
  return data;
}

export default async function TenantPrivateLayout({ children }: { children: ReactNode }) {
  const serverValidation = await validateTenantSession();

  if (serverValidation && serverValidation.valid) {
    return <>{children}</>;
  }

  // If server-side couldn't validate (dev header issues), fall back to client-side check
  return <ClientTenantAuth>{children}</ClientTenantAuth>;
}
