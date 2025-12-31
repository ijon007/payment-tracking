import type { Currency } from "./currency-utils";
import { formatCurrency } from "./currency-utils";
import type {
  ContractSettings,
  PaymentPlan,
  Installment,
  Milestone,
  CustomPayment,
  PaymentStructure,
} from "./contract-utils";

/**
 * Calculate contract totals (subtotal, discount, tax, total)
 * Discount is applied first, then tax on the discounted amount
 */
export function calculateContractTotals(
  projectCost: number,
  settings?: ContractSettings
): {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
} {
  const subtotal = projectCost || 0;
  
  // Calculate discount
  let discount = 0;
  if (settings?.discountEnabled && settings.discountValue !== undefined) {
    if (settings.discountType === "percentage") {
      discount = (subtotal * settings.discountValue) / 100;
    } else {
      discount = settings.discountValue;
    }
  }
  
  // Calculate subtotal after discount
  const subtotalAfterDiscount = subtotal - discount;
  
  // Calculate tax on discounted amount
  let tax = 0;
  if (settings?.taxEnabled && settings.taxPercent !== undefined) {
    tax = (subtotalAfterDiscount * settings.taxPercent) / 100;
  }
  
  const total = subtotalAfterDiscount + tax;
  
  return { subtotal, discount, tax, total };
}

/**
 * Calculate payment plan amounts from percentages
 */
export function calculatePaymentPlan(
  projectCost: number,
  paymentPlan: PaymentPlan
): PaymentPlan {
  if (!projectCost || projectCost <= 0) {
    return paymentPlan;
  }
  
  const updatedPlan: PaymentPlan = { ...paymentPlan };
  
  if (paymentPlan.structure === "installments" && paymentPlan.installments) {
    updatedPlan.installments = paymentPlan.installments.map((installment) => ({
      ...installment,
      amount: (projectCost * installment.percentage) / 100,
    }));
  } else if (paymentPlan.structure === "milestones" && paymentPlan.milestones) {
    updatedPlan.milestones = paymentPlan.milestones.map((milestone) => ({
      ...milestone,
      amount: (projectCost * milestone.percentage) / 100,
    }));
  }
  // Custom payments already have amounts, no calculation needed
  
  return updatedPlan;
}

/**
 * Validate payment plan percentages sum to 100%
 */
export function validatePaymentPlan(
  paymentPlan: PaymentPlan
): { valid: boolean; error?: string } {
  if (paymentPlan.structure === "simple") {
    return { valid: true };
  }
  
  if (paymentPlan.structure === "installments" && paymentPlan.installments) {
    const totalPercentage = paymentPlan.installments.reduce(
      (sum, inst) => sum + inst.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return {
        valid: false,
        error: `Installment percentages must sum to 100%. Current sum: ${totalPercentage.toFixed(2)}%`,
      };
    }
  }
  
  if (paymentPlan.structure === "milestones" && paymentPlan.milestones) {
    const totalPercentage = paymentPlan.milestones.reduce(
      (sum, milestone) => sum + milestone.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return {
        valid: false,
        error: `Milestone percentages must sum to 100%. Current sum: ${totalPercentage.toFixed(2)}%`,
      };
    }
  }
  
  // Custom payments don't need percentage validation
  return { valid: true };
}

/**
 * Format currency for contract display
 */
export function formatContractCurrency(
  amount: number,
  currency: Currency = "USD"
): string {
  return formatCurrency(amount, currency);
}

/**
 * Create default payment plan for "simple" structure (30% upfront, 70% final)
 */
export function createSimplePaymentPlan(): PaymentPlan {
  return {
    structure: "simple",
  };
}

/**
 * Create default contract settings
 */
export function createDefaultContractSettings(
  currency: Currency = "USD"
): ContractSettings {
  return {
    currency,
    dateFormat: "dd/MM/yyyy",
    contractSize: "A4",
    paymentStructure: "simple",
    discountEnabled: false,
    taxEnabled: false,
  };
}

