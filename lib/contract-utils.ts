import type { Currency } from "./currency-utils";
import type { DateFormat } from "./settings-store";

export interface ContractTemplate {
  id: string;
  name: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  logoUrl?: string;
  terms: string;
  createdAt: Date;
  updatedAt: Date;
  pdfPath?: string; // Path to PDF file (for dummy/default templates)
  pdfData?: string; // Base64 encoded PDF data (for uploaded templates)
}

export type PaymentStructure = "installments" | "milestones" | "custom" | "simple";

export interface Installment {
  id: string;
  percentage: number; // e.g., 30, 40, 30
  amount?: number; // Calculated from projectCost
  dueDate?: Date;
  description?: string;
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  amount?: number; // Calculated from projectCost
  dueDate?: Date;
  description: string;
}

export interface CustomPayment {
  id: string;
  amount: number;
  dueDate?: Date;
  description: string;
}

export interface PaymentPlan {
  structure: PaymentStructure;
  installments?: Installment[]; // For installments
  milestones?: Milestone[]; // For milestones
  customPayments?: CustomPayment[]; // For custom
}

export interface ContractSettings {
  currency: Currency; // REQUIRED - base currency
  dateFormat: DateFormat;
  contractSize: "A4" | "Letter" | "Legal";
  
  // Payment structure
  paymentStructure: PaymentStructure;
  
  // Discount module
  discountEnabled: boolean;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  
  // Tax module (optional for now)
  taxEnabled: boolean;
  taxType?: "vat" | "sales-tax";
  taxPercent?: number;
}

export interface Contract {
  id: string;
  templateId: string;
  clientId: string;
  contractNumber: string;
  issueDate: Date;
  startDate: Date;
  endDate: Date;
  terms: string;
  // Additional fields for Albanian contract template
  projectCost?: number;
  paymentMethod?: string;
  projectDuration?: string; // e.g., "30 ditë", "2 muaj"
  projectCompletionDate?: Date;
  maintenanceCost?: number;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  companyRepresentatives?: string; // e.g., "Johan Gjinko dhe Ijon Kushta"
  clientSignature?: string;
  companySignature?: string;
  status: "created" | "sent" | "signed" | "active" | "expired";
  shareToken?: string;
  
  // New fields for settings and modular payment system
  settings?: ContractSettings;
  currency?: Currency; // Top-level for easy access
  paymentPlan?: PaymentPlan;
  discountAmount?: number; // Calculated
  taxAmount?: number; // Calculated
}

/**
 * Generate contract number (e.g., CNT-2024-001)
 */
export function generateContractNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `CNT-${year}-${random}`;
}

/**
 * Calculate contract duration in days
 */
export function calculateContractDuration(
  startDate: Date,
  endDate: Date
): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
