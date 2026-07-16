import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  role: z.enum(["ADMIN", "MANAGER", "VIEWER"]).optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { id } = (await params) as { id: string };
    const user = await db.user.findUnique({ where: { id } });
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;

    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "Current password required" },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(
        data.currentPassword,
        user.password || "",
      );
      if (!valid)
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      updateData.password = await bcrypt.hash(data.newPassword, 12);
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
