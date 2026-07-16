import { PrismaClient } from "../src/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import {
  Role,
  UnitType,
  InvoiceStatus,
} from "../src/app/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding Uncle Sam's Apartment database...");

  // ── Admin User ───────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "unglesam@gmail.com" },
    update: {},
    create: {
      name: "Uncle Sam",
      email: "unglesam@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN, // ✅ changed
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Floors ───────────────────────────────────────────────────────────────
  const floors = await Promise.all([
    prisma.floor.upsert({
      where: { number: 1 },
      update: {},
      create: { number: 1, label: "1st Floor" },
    }),
    prisma.floor.upsert({
      where: { number: 2 },
      update: {},
      create: { number: 2, label: "2nd Floor" },
    }),
    prisma.floor.upsert({
      where: { number: 3 },
      update: {},
      create: { number: 3, label: "3rd Floor" },
    }),
  ]);
  console.log("✅ Floors created:", floors.map((f) => f.label).join(", "));

  // ── Units ────────────────────────────────────────────────────────────────
  const unitDefs = [
    // 1st Floor — 6 units
    {
      unitNumber: "1F-1",
      floorId: floors[0].id,
      type: UnitType.BEDSITTER,
      rentAmount: 7000,
      hasWifi: true,
      wifiAmount: 1000,
    },
    {
      unitNumber: "1F-2",
      floorId: floors[0].id,
      type: UnitType.BEDSITTER,
      rentAmount: 7000,
      hasWifi: true,
      wifiAmount: 1000,
    },
    {
      unitNumber: "1F-3",
      floorId: floors[0].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 10000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "1F-4",
      floorId: floors[0].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 10000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "1F-5",
      floorId: floors[0].id,
      type: UnitType.TWO_BEDROOM,
      rentAmount: 15000,
      hasWifi: true,
      wifiAmount: 2000,
    },
    {
      unitNumber: "1F-6",
      floorId: floors[0].id,
      type: UnitType.BEDSITTER,
      rentAmount: 7000,
      hasWifi: false,
      wifiAmount: 0,
    },
    // 2nd Floor — 6 units
    {
      unitNumber: "2F-1",
      floorId: floors[1].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 11000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "2F-2",
      floorId: floors[1].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 11000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "2F-3",
      floorId: floors[1].id,
      type: UnitType.BEDSITTER,
      rentAmount: 7500,
      hasWifi: true,
      wifiAmount: 1000,
    },
    {
      unitNumber: "2F-4",
      floorId: floors[1].id,
      type: UnitType.TWO_BEDROOM,
      rentAmount: 16000,
      hasWifi: true,
      wifiAmount: 2000,
    },
    {
      unitNumber: "2F-5",
      floorId: floors[1].id,
      type: UnitType.BEDSITTER,
      rentAmount: 7500,
      hasWifi: false,
      wifiAmount: 0,
    },
    {
      unitNumber: "2F-6",
      floorId: floors[1].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 11000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    // 3rd Floor — 4 units
    {
      unitNumber: "3F-1",
      floorId: floors[2].id,
      type: UnitType.TWO_BEDROOM,
      rentAmount: 17000,
      hasWifi: true,
      wifiAmount: 2000,
    },
    {
      unitNumber: "3F-2",
      floorId: floors[2].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 12000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "3F-3",
      floorId: floors[2].id,
      type: UnitType.ONE_BEDROOM,
      rentAmount: 12000,
      hasWifi: true,
      wifiAmount: 1500,
    },
    {
      unitNumber: "3F-4",
      floorId: floors[2].id,
      type: UnitType.BEDSITTER,
      rentAmount: 8000,
      hasWifi: true,
      wifiAmount: 1000,
    },
  ];

  const units: any[] = [];
  for (const def of unitDefs) {
    const unit = await prisma.unit.upsert({
      where: { unitNumber: def.unitNumber },
      update: {},
      create: { ...def, isOccupied: false },
    });
    units.push(unit);
  }
  console.log(`✅ ${units.length} units created`);

  // ── Tenants (for first 10 units) ─────────────────────────────────────────
  const tenantDefs = [
    {
      firstName: "James",
      lastName: "Mwangi",
      phone: "0712345678",
      unitIdx: 0,
      moveInDate: "2024-01-15",
    },
    {
      firstName: "Grace",
      lastName: "Achieng",
      phone: "0723456789",
      unitIdx: 1,
      moveInDate: "2024-02-01",
    },
    {
      firstName: "Peter",
      lastName: "Kamau",
      phone: "0734567890",
      unitIdx: 2,
      moveInDate: "2024-01-01",
    },
    {
      firstName: "Alice",
      lastName: "Njeri",
      phone: "0745678901",
      unitIdx: 3,
      moveInDate: "2024-03-10",
    },
    {
      firstName: "Samuel",
      lastName: "Ochieng",
      phone: "0756789012",
      unitIdx: 4,
      moveInDate: "2024-01-20",
    },
    {
      firstName: "Mary",
      lastName: "Wanjiku",
      phone: "0767890123",
      unitIdx: 6,
      moveInDate: "2024-04-01",
    },
    {
      firstName: "David",
      lastName: "Mutua",
      phone: "0778901234",
      unitIdx: 7,
      moveInDate: "2024-02-15",
    },
    {
      firstName: "Faith",
      lastName: "Chebet",
      phone: "0789012345",
      unitIdx: 8,
      moveInDate: "2024-05-01",
    },
    {
      firstName: "John",
      lastName: "Kiprotich",
      phone: "0790123456",
      unitIdx: 9,
      moveInDate: "2024-03-01",
    },
    {
      firstName: "Lydia",
      lastName: "Otieno",
      phone: "0701234567",
      unitIdx: 11,
      moveInDate: "2024-06-01",
    },
  ];

  const tenants: any[] = [];
  for (const def of tenantDefs) {
    const targetUnit = units[def.unitIdx];
    const tenant = await prisma.tenant.upsert({
      where: { id: `seed-tenant-${def.unitIdx}` },
      update: {},
      create: {
        id: `seed-tenant-${def.unitIdx}`,
        firstName: def.firstName,
        lastName: def.lastName,
        phone: def.phone,
        unitId: targetUnit.id,
        moveInDate: new Date(def.moveInDate),
        isActive: true,
      },
    });
    await prisma.unit.update({
      where: { id: targetUnit.id },
      data: { isOccupied: true },
    });
    tenants.push({ ...tenant, unit: targetUnit });
  }
  console.log(`✅ ${tenants.length} tenants created`);

  // ── Sample invoices for current month ────────────────────────────────────
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const dueDate = new Date(year, month - 1, 10); // 10th of the month

  let invoiceCount = 0;
  for (let i = 0; i < tenants.length; i++) {
    const t = tenants[i];
    const unit = t.unit;
    const existing = await prisma.invoice.findUnique({
      where: { unitId_month_year: { unitId: unit.id, month, year } },
    });
    if (existing) continue;

    const invoiceNumber = `USA-${year}${String(month).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`;
    const isPaid = i < 5;

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        unitId: unit.id,
        tenantId: t.id,
        month,
        year,
        rentAmount: unit.rentAmount,
        waterAmount: Math.floor(Math.random() * 500) + 200,
        wifiAmount: unit.hasWifi ? unit.wifiAmount : 0,
        totalAmount:
          unit.rentAmount +
          (Math.floor(Math.random() * 500) + 200) +
          (unit.hasWifi ? unit.wifiAmount : 0),
        paidAmount: isPaid ? unit.rentAmount : 0,
        balanceDue: isPaid ? 0 : unit.rentAmount,
        dueDate,
        status: isPaid ? InvoiceStatus.PAID : InvoiceStatus.UNPAID, // ✅ changed
      },
    });
    invoiceCount++;
  }
  console.log(`✅ ${invoiceCount} invoices created`);

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────────");
  console.log("Login: unglesam@gmail.com");
  console.log("Password: admin123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
