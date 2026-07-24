import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const waterSchema = z.object({
  unitId: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  previousReading: z.number().nonnegative(),
  currentReading: z.number().nonnegative(),
  ratePerUnit: z.number().positive().default(150),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const unitId = searchParams.get("unitId");

    const readings = await db.waterReading.findMany({
      where: {
        ...(month ? { month: parseInt(month) } : {}),
        ...(year ? { year: parseInt(year) } : {}),
        ...(unitId ? { unitId } : {}),
      },
      include: {
        unit: {
          include: { floor: true, tenants: { where: { isActive: true } } },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json(readings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch water readings" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = waterSchema.parse(body);

    if (data.currentReading < data.previousReading) {
      return NextResponse.json(
        { error: "Current reading cannot be less than previous reading" },
        { status: 400 },
      );
    }

    const unitsUsed = data.currentReading - data.previousReading;
    const totalAmount = unitsUsed * data.ratePerUnit;

    const reading = await db.waterReading.upsert({
      where: {
        unitId_month_year: {
          unitId: data.unitId,
          month: data.month,
          year: data.year,
        },
      },
      create: { ...data, unitsUsed, totalAmount },
      update: { ...data, unitsUsed, totalAmount },
      include: {
        unit: { include: { floor: true } },
      },
    });

    return NextResponse.json(reading, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to save water reading" },
      { status: 500 },
    );
  }
}
