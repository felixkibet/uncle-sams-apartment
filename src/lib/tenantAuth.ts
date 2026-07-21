import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "tenant-session-secret";
export const TENANT_SESSION_COOKIE = "tenant_session";
export type TenantSessionPayload = {
  tenantId: string;
  invoiceNumber: string;
  expiresAt: number;
};

function signValue(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createTenantSessionToken(payload: TenantSessionPayload) {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signature = signValue(encoded);
  return `${encoded}.${signature}`;
}

export function parseTenantSessionToken(
  token: string,
): TenantSessionPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (signValue(encoded) !== signature) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    if (
      !payload ||
      typeof payload.tenantId !== "string" ||
      typeof payload.invoiceNumber !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
