import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  unitId: z.string().min(1).optional().nullable(),
  moveOutDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function GET(_: NextRequest, { params }: { params: any }) {
  try {
    const { id } = (await params) as { id: string };
    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        unit: { include: { floor: true } },
        invoices: { orderBy: { createdAt: "desc" }, take: 12 },
        payments: { orderBy: { paidAt: "desc" }, take: 12 },
      },
    });
    if (!tenant)
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tenant" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: any }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const { id } = (await params) as { id: string };

    const tenant = await db.$transaction(async (tx) => {
      const currentTenant = await tx.tenant.findUnique({
        where: { id },
        select: { unitId: true },
      });

      const oldUnitId = currentTenant?.unitId;
      const transferredUnitId =
        data.unitId && data.unitId !== oldUnitId ? data.unitId : null;

      const t = await tx.tenant.update({
        where: { id },
        data: {
          ...data,
          moveOutDate: data.moveOutDate
            ? new Date(data.moveOutDate)
            : undefined,
        },
        include: { unit: { include: { floor: true } } },
      });

      if (transferredUnitId && data.isActive !== false) {
        await tx.unit.update({
          where: { id: transferredUnitId },
          data: { isOccupied: true },
        });
      }

      if (transferredUnitId && oldUnitId) {
        const activeTenantsCount = await tx.tenant.count({
          where: { unitId: oldUnitId, isActive: true, id: { not: id } },
        });
        if (activeTenantsCount === 0) {
          await tx.unit.update({
            where: { id: oldUnitId },
            data: { isOccupied: false },
          });
        }
      } else if (data.isActive === false && t.unitId) {
        const activeTenantsCount = await tx.tenant.count({
          where: { unitId: t.unitId, isActive: true, id: { not: id } },
        });
        if (activeTenantsCount === 0) {
          await tx.unit.update({
            where: { id: t.unitId },
            data: { isOccupied: false },
          });
        }
      }

      return t;
    });

    return NextResponse.json(tenant);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to update tenant" },
      { status: 500 },
    );
  }
}
