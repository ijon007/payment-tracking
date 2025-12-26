export interface InvoiceTemplate {
  id: string;
  name: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  logoUrl?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  templateId: string;
  clientId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: "draft" | "sent" | "paid";
}

/**
 * Generate invoice number (e.g., INV-2024-001)
 */
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${year}-${random}`;
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
    rate: payment.amount,
    amount: payment.amount,
  };
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  taxPercent?: number
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = taxPercent ? (subtotal * taxPercent) / 100 : 0;
  const total = subtotal + tax;

  return { subtotal, tax, total };
}
