import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  previousReading: z.number().nonnegative().optional(),
  currentReading: z.number().nonnegative().optional(),
  ratePerUnit: z.number().positive().optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const reading = await db.waterReading.findUnique({
      where: { id },
      include: { unit: { include: { floor: true } } },
    });
    if (!reading)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reading);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reading" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const { id } = (await params) as { id: string };
    const existing = await db.waterReading.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const prev = data.previousReading ?? existing.previousReading;
    const curr = data.currentReading ?? existing.currentReading;
    const rate = data.ratePerUnit ?? existing.ratePerUnit;

    if (curr < prev)
      return NextResponse.json(
        { error: "Current reading cannot be less than previous" },
        { status: 400 },
      );

    const unitsUsed = curr - prev;
    const totalAmount = unitsUsed * rate;

    const reading = await db.waterReading.update({
      where: { id },
      data: { ...data, unitsUsed, totalAmount },
      include: { unit: { include: { floor: true } } },
    });
    return NextResponse.json(reading);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update reading" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    await db.waterReading.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete reading" },
      { status: 500 },
    );
  }
}
