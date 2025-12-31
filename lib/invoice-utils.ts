import type { Currency } from "./currency-utils";
import type { DateFormat } from "./settings-store";

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: "draft" | "sent" | "paid";
  companyName: string;
  companyAddress?: string;
  companyEmail: string;
  companyPhone?: string;
  logoUrl?: string;
  notes?: string;
  paymentDetails?: string;
  shareToken?: string;
  // Contract linking
  contractId?: string; // Links invoice to contract (undefined = standalone)
  paymentPlanItemId?: string; // Links to specific installment/milestone/custom payment ID
  // Invoice customization settings
  dateFormat?: DateFormat;
  invoiceSize?: "A4" | "Letter" | "Legal";
  salesTaxEnabled?: boolean;
  salesTaxPercent?: number;
  vatEnabled?: boolean;
  vatPercent?: number;
  currency?: Currency;
  discountEnabled?: boolean;
  showQrCode?: boolean;
}

/**
 * Generate invoice number (e.g., INV-0001)
 */
export function generateInvoiceNumber(): string {
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${random}`;
}

/**
 * Generate a secure share token for invoices
 */
export function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Convert payment to invoice item
 */
export function paymentToInvoiceItem(
  payment: { amount: number; type: string; installmentNumber?: number },
  description?: string
): InvoiceItem {
  const defaultDescription =
    payment.type === "retainer"
      ? "Retainer Payment"
      : `Installment ${payment.installmentNumber || ""}`;

  return {
    description: description || defaultDescription,
    quantity: 1,
    price: payment.amount,
    amount: payment.amount,
  };
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  options?: {
    salesTaxPercent?: number;
    vatPercent?: number;
    discountAmount?: number;
  }
): { 
  subtotal: number; 
  salesTax: number; 
  vat: number;
  discount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discount = options?.discountAmount || 0;
  const subtotalAfterDiscount = subtotal - discount;
  const salesTax = options?.salesTaxPercent 
    ? (subtotalAfterDiscount * options.salesTaxPercent) / 100 
    : 0;
  const vat = options?.vatPercent 
    ? (subtotalAfterDiscount * options.vatPercent) / 100 
    : 0;
  const total = subtotalAfterDiscount + salesTax + vat;

  return { subtotal, salesTax, vat, discount, total };
}
