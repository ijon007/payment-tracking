import type { Contract, ContractTemplate, Installment, Milestone, CustomPayment } from "./contract-utils";
import type { Invoice, InvoiceItem } from "./invoice-utils";
import { calculateInvoiceTotals } from "./invoice-utils";
import type { Client } from "./payment-utils";
import { calculatePaymentPlan } from "./contract-settings";

interface CompanyInfo {
  companyName: string;
  companyAddress?: string;
  companyEmail: string;
  companyPhone?: string;
  logoUrl?: string;
}

/**
 * Generate invoices from contract payment plan
 * Each payment plan item (installment/milestone/custom) becomes one invoice
 */
export function generateInvoicesFromContract(
  contract: Contract,
  client: Client,
  template: ContractTemplate,
  generateInvoiceFn: (data: {
    clientId: string;
    items: InvoiceItem[];
    dueDate: Date;
    companyName: string;
    companyAddress?: string;
    companyEmail: string;
    companyPhone?: string;
    logoUrl?: string;
    notes?: string;
    paymentDetails?: string;
    dateFormat?: Invoice["dateFormat"];
    invoiceSize?: Invoice["invoiceSize"];
    salesTaxEnabled?: boolean;
    salesTaxPercent?: number;
    vatEnabled?: boolean;
    vatPercent?: number;
    currency?: Invoice["currency"];
    discountEnabled?: boolean;
    showQrCode?: boolean;
    contractId?: string;
    paymentPlanItemId?: string;
  }) => Invoice
): Invoice[] {
  const invoices: Invoice[] = [];
  
  if (!contract.paymentPlan) {
    return invoices;
  }

  const paymentPlan = contract.paymentPlan;
  const projectCost = contract.projectCost || 0;
  
  // Recalculate payment plan amounts if needed
  const calculatedPlan = projectCost > 0 
    ? calculatePaymentPlan(projectCost, paymentPlan)
    : paymentPlan;

  // Company info from template
  const companyInfo: CompanyInfo = {
    companyName: template.companyName,
    companyAddress: template.companyAddress,
    companyEmail: template.companyEmail,
    companyPhone: template.companyPhone,
    logoUrl: template.logoUrl,
  };

  // Get contract settings for invoice defaults
  const settings = contract.settings;
  const currency = contract.currency || settings?.currency || "USD";
  const dateFormat = settings?.dateFormat || "dd/MM/yyyy";
  
  // Determine tax settings
  const taxEnabled = settings?.taxEnabled || false;
  const taxType = settings?.taxType;
  const taxPercent = settings?.taxPercent;
  const salesTaxEnabled = taxEnabled && taxType === "sales-tax";
  const vatEnabled = taxEnabled && taxType === "vat";
  const salesTaxPercent = salesTaxEnabled ? taxPercent : undefined;
  const vatPercent = vatEnabled ? taxPercent : undefined;

  // Determine discount settings
  const discountEnabled = settings?.discountEnabled || false;
  // Note: Discount is applied at contract level, not per invoice

  // Generate invoices based on payment plan structure
  if (calculatedPlan.structure === "installments" && calculatedPlan.installments) {
    calculatedPlan.installments.forEach((installment: Installment, index: number) => {
      if (!installment.amount || installment.amount <= 0) {
        return;
      }

      // Determine due date
      let dueDate: Date;
      if (installment.dueDate) {
        dueDate = new Date(installment.dueDate);
      } else {
        // Default: spread installments evenly across contract duration
        const contractDuration = contract.endDate.getTime() - contract.startDate.getTime();
        const daysPerInstallment = contractDuration / calculatedPlan.installments.length;
        dueDate = new Date(contract.startDate);
        dueDate.setTime(dueDate.getTime() + (daysPerInstallment * (index + 1)));
      }

      // Create invoice item
      const items: InvoiceItem[] = [{
        description: installment.description || `Installment ${index + 1}`,
        quantity: 1,
        price: installment.amount,
        amount: installment.amount,
      }];

      // Generate invoice
      const invoice = generateInvoiceFn({
        clientId: contract.clientId,
        items,
        dueDate,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        logoUrl: companyInfo.logoUrl,
        notes: `Payment for ${contract.contractNumber}`,
        dateFormat,
        invoiceSize: settings?.contractSize || "A4",
        salesTaxEnabled,
        salesTaxPercent,
        vatEnabled,
        vatPercent,
        currency,
        discountEnabled: false, // Discount applied at contract level
        showQrCode: false,
        contractId: contract.id,
        paymentPlanItemId: installment.id,
      });

      invoices.push(invoice);
    });
  } else if (calculatedPlan.structure === "milestones" && calculatedPlan.milestones) {
    calculatedPlan.milestones.forEach((milestone: Milestone) => {
      if (!milestone.amount || milestone.amount <= 0) {
        return;
      }

      // Determine due date
      let dueDate: Date;
      if (milestone.dueDate) {
        dueDate = new Date(milestone.dueDate);
      } else {
        // Default to contract start date
        dueDate = new Date(contract.startDate);
      }

      // Create invoice item
      const items: InvoiceItem[] = [{
        description: milestone.description || milestone.name,
        quantity: 1,
        price: milestone.amount,
        amount: milestone.amount,
      }];

      // Generate invoice
      const invoice = generateInvoiceFn({
        clientId: contract.clientId,
        items,
        dueDate,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        logoUrl: companyInfo.logoUrl,
        notes: `Payment for milestone: ${milestone.name} - ${contract.contractNumber}`,
        dateFormat,
        invoiceSize: settings?.contractSize || "A4",
        salesTaxEnabled,
        salesTaxPercent,
        vatEnabled,
        vatPercent,
        currency,
        discountEnabled: false,
        showQrCode: false,
        contractId: contract.id,
        paymentPlanItemId: milestone.id,
      });

      invoices.push(invoice);
    });
  } else if (calculatedPlan.structure === "custom" && calculatedPlan.customPayments) {
    calculatedPlan.customPayments.forEach((customPayment: CustomPayment) => {
      if (!customPayment.amount || customPayment.amount <= 0) {
        return;
      }

      // Determine due date
      let dueDate: Date;
      if (customPayment.dueDate) {
        dueDate = new Date(customPayment.dueDate);
      } else {
        // Default to contract start date
        dueDate = new Date(contract.startDate);
      }

      // Create invoice item
      const items: InvoiceItem[] = [{
        description: customPayment.description,
        quantity: 1,
        price: customPayment.amount,
        amount: customPayment.amount,
      }];

      // Generate invoice
      const invoice = generateInvoiceFn({
        clientId: contract.clientId,
        items,
        dueDate,
        companyName: companyInfo.companyName,
        companyAddress: companyInfo.companyAddress,
        companyEmail: companyInfo.companyEmail,
        companyPhone: companyInfo.companyPhone,
        logoUrl: companyInfo.logoUrl,
        notes: `Payment for ${contract.contractNumber}`,
        dateFormat,
        invoiceSize: settings?.contractSize || "A4",
        salesTaxEnabled,
        salesTaxPercent,
        vatEnabled,
        vatPercent,
        currency,
        discountEnabled: false,
        showQrCode: false,
        contractId: contract.id,
        paymentPlanItemId: customPayment.id,
      });

      invoices.push(invoice);
    });
  }

  return invoices;
}

