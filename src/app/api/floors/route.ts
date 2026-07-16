import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const floorSchema = z.object({
  number: z.number().int().positive(),
  label: z.string().min(1),
});

export async function GET() {
  try {
    const floors = await db.floor.findMany({
      include: { units: true },
      orderBy: { number: "asc" },
    });
    return NextResponse.json(floors);
  } catch {
    return NextResponse.json({ error: "Failed to fetch floors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = floorSchema.parse(body);
    const floor = await db.floor.create({ data });
    return NextResponse.json(floor, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create floor" }, { status: 500 });
  }
}
