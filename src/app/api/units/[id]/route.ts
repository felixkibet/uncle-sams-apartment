import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  unitNumber: z.string().min(1).optional(),
  type: z.enum(["BEDSITTER", "ONE_BEDROOM", "TWO_BEDROOM"]).optional(),
  rentAmount: z.number().positive().optional(),
  hasWifi: z.boolean().optional(),
  wifiAmount: z.number().optional(),
  isOccupied: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const unit = await db.unit.findUnique({
      where: { id },
      include: {
        floor: true,
        tenants: { where: { isActive: true } },
        invoices: { orderBy: { createdAt: "desc" }, take: 6 },
        waterReadings: { orderBy: { year: "desc" }, take: 12 },
      },
    });
    if (!unit)
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    return NextResponse.json(unit);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch unit" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const { id } = (await params) as { id: string };
    const unit = await db.unit.update({
      where: { id },
      data,
      include: { floor: true },
    });
    return NextResponse.json(unit);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    await db.unit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 },
    );
  }
}
