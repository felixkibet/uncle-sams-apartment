import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  category: z
    .enum([
      "MAINTENANCE",
      "REPAIRS",
      "UTILITIES",
      "CLEANING",
      "SECURITY",
      "INSURANCE",
      "OTHER",
    ])
    .optional(),
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  receipt: z.string().optional().nullable(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const expense = await db.expense.findUnique({ where: { id } });
    if (!expense)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(expense);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch expense" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const { id } = (await params) as { id: string };
    const expense = await db.expense.update({
      where: { id },
      data: { ...data, ...(data.date ? { date: new Date(data.date) } : {}) },
    });
    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    await db.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
