import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const expenseSchema = z.object({
  category: z.enum(["MAINTENANCE", "REPAIRS", "UTILITIES", "CLEANING", "SECURITY", "INSURANCE", "OTHER"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string(),
  receipt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const expenses = await db.expense.findMany({
      where: {
        ...(category ? { category: category as any } : {}),
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = expenseSchema.parse(body);
    const expense = await db.expense.create({ data: { ...data, date: new Date(data.date) } });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
