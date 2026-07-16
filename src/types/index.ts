export type UnitType = "BEDSITTER" | "ONE_BEDROOM" | "TWO_BEDROOM";
export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID" | "OVERDUE";
export type PaymentMethod = "MPESA" | "CASH" | "BANK_TRANSFER" | "CHEQUE";
export type Role = "ADMIN" | "MANAGER" | "VIEWER";
export type ExpenseCategory =
  | "MAINTENANCE"
  | "REPAIRS"
  | "UTILITIES"
  | "CLEANING"
  | "SECURITY"
  | "INSURANCE"
  | "OTHER";

export interface DashboardStats {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalTenants: number;
  monthlyRevenue: number;
  monthlyTarget: number;
  collectionRate: number;
  totalArrears: number;
  paidInvoices: number;
  unpaidInvoices: number;
}

export interface UnitWithTenant {
  id: string;
  unitNumber: string;
  type: UnitType;
  rentAmount: number;
  isOccupied: boolean;
  hasWifi: boolean;
  wifiAmount: number;
  floor: { number: number; label: string };
  tenants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
  }>;
}

export interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  month: number;
  year: number;
  rentAmount: number;
  waterAmount: number;
  wifiAmount: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  unit: { unitNumber: string; type: UnitType };
  tenant: { firstName: string; lastName: string; phone: string };
  payments: Array<{
    id: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    paidAt: string;
  }>;
}
