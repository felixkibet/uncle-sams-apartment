import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const unitSchema = z.object({
  unitNumber: z.string().min(1),
  floorId: z.string().min(1),
  type: z.enum(["BEDSITTER", "ONE_BEDROOM", "TWO_BEDROOM"]),
  rentAmount: z.number().positive(),
  hasWifi: z.boolean().default(true),
  wifiAmount: z.number().default(1500),
});

export async function GET() {
  try {
    const units = await db.unit.findMany({
      include: {
        floor: true,
        tenants: {
          where: { isActive: true },
          select: { id: true, firstName: true, lastName: true, phone: true, isActive: true },
        },
      },
      orderBy: [{ floor: { number: "asc" } }, { unitNumber: "asc" }],
    });
    return NextResponse.json(units);
  } catch {
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = unitSchema.parse(body);
    const unit = await db.unit.create({ data, include: { floor: true } });
    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}
