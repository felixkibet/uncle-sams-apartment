import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const floor = await db.floor.findUnique({
      where: { id },
      include: {
        units: { include: { tenants: { where: { isActive: true } } } },
      },
    });
    if (!floor)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(floor);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch floor" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const { id } = (await params) as { id: string };
    const floor = await db.floor.update({ where: { id }, data });
    return NextResponse.json(floor);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update floor" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const units = await db.unit.count({ where: { floorId: id } });
    if (units > 0) {
      return NextResponse.json(
        { error: "Cannot delete floor with existing units" },
        { status: 400 },
      );
    }
    await db.floor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete floor" },
      { status: 500 },
    );
  }
}
