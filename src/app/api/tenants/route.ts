import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const tenantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  unitId: z.string().min(1),
  moveInDate: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const tenants = await db.tenant.findMany({
      where: active !== null ? { isActive: active === "true" } : undefined,
      include: {
        unit: { include: { floor: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tenants);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = tenantSchema.parse(body);

    const tenant = await db.$transaction(async (tx) => {
      const t = await tx.tenant.create({
        data: {
          ...data,
          moveInDate: new Date(data.moveInDate),
        },
        include: { unit: { include: { floor: true } } },
      });
      // Mark unit as occupied
      await tx.unit.update({ where: { id: data.unitId }, data: { isOccupied: true } });
      return t;
    });

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 });
  }
}
