import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";

const TABLE_ROW_HEIGHT = 24;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 48;

export async function GET(_: NextRequest, { params }: { params: any }) {
  const { id } = (await params) as { id: string };

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        unit: { include: { floor: true } },
        tenant: true,
        payments: { orderBy: { paidAt: "desc" } },
      },
    });

    if (!invoice)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pageContent = page;
    const { width, height } = page.getSize();
    let y = height - MARGIN;

    const companyColor = rgb(0.09, 0.11, 0.18);
    const accentColor = rgb(0.96, 0.68, 0.15);
    const lightGray = rgb(0.96, 0.97, 0.99);
    const midGray = rgb(0.45, 0.53, 0.67);

    function drawText(
      text: string,
      options: { x: number; y: number; size: number; font: any; color?: any },
    ) {
      pageContent.drawText(text, {
        ...options,
        color: options.color || companyColor,
      });
    }

    pageContent.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(0.09, 0.11, 0.18),
    });

    drawText("Uncle Sam's Apartment", {
      x: MARGIN,
      y: height - 45,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    drawText(`Invoice ${invoice.invoiceNumber}`, {
      x: MARGIN,
      y: height - 72,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    drawText(`Billing Period: ${formatMonth(invoice.month, invoice.year)}`, {
      x: MARGIN,
      y: height - 92,
      size: 9,
      font: fontRegular,
      color: rgb(0.78, 0.81, 0.89),
    });
    drawText(`Due Date: ${formatDate(invoice.dueDate)}`, {
      x: MARGIN,
      y: height - 104,
      size: 9,
      font: fontRegular,
      color: rgb(0.78, 0.81, 0.89),
    });
    const statusText = invoice.status.replace(/_/g, " ");
    const statusColor =
      invoice.status === "PAID"
        ? rgb(0.06, 0.5, 0.19)
        : invoice.status === "PARTIAL"
          ? rgb(0.77, 0.47, 0.09)
          : rgb(0.71, 0.11, 0.18);
    const statusBg =
      invoice.status === "PAID"
        ? rgb(0.87, 0.96, 0.9)
        : invoice.status === "PARTIAL"
          ? rgb(0.99, 0.94, 0.84)
          : rgb(0.99, 0.9, 0.92);

    const stampDiameter = 72;
    const stampRadius = stampDiameter / 2;
    const stampX = width - MARGIN - 180 - stampDiameter - 12;
    const stampY = height - 96;
    const stampCenterX = stampX + stampRadius;
    const stampCenterY = stampY + stampRadius;
    const stampAngle = -12;

    pageContent.drawEllipse({
      x: stampCenterX,
      y: stampCenterY,
      xScale: stampRadius,
      yScale: stampRadius,
      color: statusBg,
      borderColor: statusColor,
      borderWidth: 3,
      rotate: degrees(stampAngle),
      opacity: 0.95,
    });

    pageContent.drawEllipse({
      x: stampCenterX,
      y: stampCenterY,
      xScale: stampRadius - 12,
      yScale: stampRadius - 12,
      color: rgb(1, 1, 1),
      rotate: degrees(stampAngle),
    });

    const dashCount = 28;
    for (let i = 0; i < dashCount; i++) {
      const angle = (Math.PI * 2 * i) / dashCount + 0.08;
      const outerDash = stampRadius - 2;
      const innerDash = stampRadius - 8;
      const x1 = stampCenterX + Math.cos(angle) * outerDash;
      const y1 = stampCenterY + Math.sin(angle) * outerDash;
      const x2 = stampCenterX + Math.cos(angle) * innerDash;
      const y2 = stampCenterY + Math.sin(angle) * innerDash;
      pageContent.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness: 1.2,
        color: statusColor,
        opacity: 0.85,
      });
    }

    const stampText = statusText.toUpperCase();
    const stampSize = 12;
    const textWidth = fontBold.widthOfTextAtSize(stampText, stampSize);
    pageContent.drawText(stampText, {
      x: stampCenterX - textWidth / 2,
      y: stampCenterY - stampSize / 2 + 2,
      size: stampSize,
      font: fontBold,
      color: statusColor,
      rotate: degrees(stampAngle),
    });

    const labelText = "PAYMENT STATUS";
    const labelSize = 7;
    pageContent.drawText(labelText, {
      x: stampCenterX - fontBold.widthOfTextAtSize(labelText, labelSize) / 2,
      y: stampCenterY - stampRadius / 2 + 3,
      size: labelSize,
      font: fontBold,
      color: statusColor,
      rotate: degrees(stampAngle),
    });

    const contactX = width - MARGIN - 180;
    drawText("Contact", {
      x: contactX,
      y: height - 45,
      size: 9,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    drawText("0738 822 454", {
      x: contactX,
      y: height - 61,
      size: 9,
      font: fontRegular,
      color: rgb(0.78, 0.81, 0.89),
    });
    drawText("unglesam@gmail.com", {
      x: contactX,
      y: height - 74,
      size: 9,
      font: fontRegular,
      color: rgb(0.78, 0.81, 0.89),
    });
    drawText("Nyayo Gate B, Naivas Court, Embakasi", {
      x: contactX,
      y: height - 87,
      size: 9,
      font: fontRegular,
      color: rgb(0.78, 0.81, 0.89),
    });

    y -= 140;
    pageContent.drawLine({
      start: { x: MARGIN, y },
      end: { x: width - MARGIN, y },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.92),
    });
    y -= 28;

    const detailCardHeight = 72;
    pageContent.drawRectangle({
      x: MARGIN,
      y: y - detailCardHeight + 8,
      width: 280,
      height: detailCardHeight,
      borderColor: rgb(0.89, 0.91, 0.93),
      borderWidth: 1,
      color: lightGray,
    });
    drawText("Billed To", {
      x: MARGIN + 12,
      y: y,
      size: 9,
      font: fontBold,
      color: midGray,
    });
    drawText(`${invoice.tenant.firstName} ${invoice.tenant.lastName}`, {
      x: MARGIN + 12,
      y: y - 18,
      size: 12,
      font: fontBold,
    });
    drawText(invoice.tenant.email || "", {
      x: MARGIN + 12,
      y: y - 32,
      size: 9,
      font: fontRegular,
      color: midGray,
    });

    pageContent.drawRectangle({
      x: MARGIN + 300,
      y: y - detailCardHeight + 8,
      width: 240,
      height: detailCardHeight,
      borderColor: rgb(0.89, 0.91, 0.93),
      borderWidth: 1,
      color: lightGray,
    });
    drawText("Unit", {
      x: MARGIN + 312,
      y: y,
      size: 9,
      font: fontBold,
      color: midGray,
    });
    drawText(invoice.unit?.unitNumber || "Unit", {
      x: MARGIN + 312,
      y: y - 18,
      size: 12,
      font: fontBold,
    });
    drawText(invoice.unit?.floor?.label || "", {
      x: MARGIN + 312,
      y: y - 32,
      size: 9,
      font: fontRegular,
      color: midGray,
    });

    y -= detailCardHeight + 24;
    drawText("Invoice Summary", {
      x: MARGIN,
      y,
      size: 10,
      font: fontBold,
      color: midGray,
    });
    y -= 18;

    const tableX = MARGIN;
    const tableWidth = width - MARGIN * 2;
    const headerHeight = 28;
    const rowStartY = y;
    pageContent.drawRectangle({
      x: tableX,
      y: rowStartY - headerHeight,
      width: tableWidth,
      height: headerHeight,
      color: lightGray,
    });
    drawText("Description", {
      x: tableX + 10,
      y: rowStartY - 20,
      size: 10,
      font: fontBold,
      color: companyColor,
    });
    drawText("Amount", {
      x: tableX + tableWidth - 95,
      y: rowStartY - 20,
      size: 10,
      font: fontBold,
      color: companyColor,
    });

    const totalAmount = formatCurrency(invoice.totalAmount);
    const rows = [
      { label: "Rent", amount: formatCurrency(invoice.rentAmount) },
      ...(invoice.waterAmount > 0
        ? [{ label: "Water", amount: formatCurrency(invoice.waterAmount) }]
        : []),
      ...(invoice.wifiAmount > 0
        ? [{ label: "WiFi", amount: formatCurrency(invoice.wifiAmount) }]
        : []),
      ...(invoice.otherCharges > 0
        ? [
            {
              label: "Other Charges",
              amount: formatCurrency(invoice.otherCharges),
            },
          ]
        : []),
    ];

    let rowY = rowStartY - headerHeight - 12;
    rows.forEach((row, index) => {
      const yPosition = rowY - index * TABLE_ROW_HEIGHT;
      pageContent.drawLine({
        start: { x: tableX, y: yPosition - 6 },
        end: { x: tableX + tableWidth, y: yPosition - 6 },
        thickness: 0.5,
        color: rgb(0.89, 0.91, 0.93),
      });
      drawText(row.label, {
        x: tableX + 10,
        y: yPosition - 18,
        size: 11,
        font: fontRegular,
      });
      drawText(row.amount, {
        x: tableX + tableWidth - 95,
        y: yPosition - 18,
        size: 11,
        font: fontRegular,
      });
    });

    const summaryY =
      rowStartY - headerHeight - rows.length * TABLE_ROW_HEIGHT - 24;
    drawText("Total Amount", {
      x: tableX,
      y: summaryY,
      size: 10,
      font: fontBold,
      color: midGray,
    });
    drawText(totalAmount, {
      x: tableX + tableWidth - 95,
      y: summaryY,
      size: 13,
      font: fontBold,
      color: companyColor,
    });

    const summaryBoxY = summaryY - 50;
    pageContent.drawRectangle({
      x: tableX,
      y: summaryBoxY,
      width: tableWidth,
      height: 48,
      color: rgb(0.96, 0.97, 0.99),
    });
    drawText("Amount Due", {
      x: tableX + 10,
      y: summaryBoxY + 30,
      size: 10,
      font: fontBold,
      color: midGray,
    });
    drawText(totalAmount, {
      x: tableX + tableWidth - 95,
      y: summaryBoxY + 28,
      size: 18,
      font: fontBold,
      color: accentColor,
    });

    drawText("Visit the tenant portal for payment details.", {
      x: tableX,
      y: summaryBoxY - 24,
      size: 9,
      font: fontRegular,
      color: midGray,
    });

    const footerY = 60;
    pageContent.drawLine({
      start: { x: MARGIN, y: footerY + 24 },
      end: { x: width - MARGIN, y: footerY + 24 },
      thickness: 0.5,
      color: rgb(0.89, 0.91, 0.93),
    });
    drawText("Uncle Sam's Apartment · Nyayo Gate B, Naivas Court, Embakasi", {
      x: MARGIN,
      y: footerY + 10,
      size: 9,
      font: fontRegular,
      color: midGray,
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error.message || error) },
      { status: 500 },
    );
  }
}
