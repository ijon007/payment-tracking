import type { Contract } from "@/lib/contract-utils";
import type { Invoice } from "@/lib/invoice-utils";
import { calculatePaymentPlan } from "@/lib/contract-settings";
import type { Client, Payment } from "@/lib/payment-utils";

export type PaymentWithStatus = Payment & {
  status: "paid" | "pending" | "overdue";
  clientName: string;
  clientId: string;
};

export function calculatePaymentStatuses(
  clients: Client[],
  contracts: Contract[] = [],
  invoices: Invoice[] = []
): PaymentWithStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const payments: PaymentWithStatus[] = [];

  // Add client payments (legacy)
  clients.forEach((client) => {
    client.payments.forEach((payment) => {
      let status: "paid" | "pending" | "overdue";
      if (payment.paidDate) {
        status = "paid";
      } else {
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        status = dueDate < today ? "overdue" : "pending";
      }
      payments.push({
        ...payment,
        status,
        clientName: client.name,
        clientId: client.id,
      });
    });
  });

  // Add contract payment plan items
  contracts.forEach((contract) => {
    if (!contract.paymentPlan) return;
    
    const client = clients.find((c) => c.id === contract.clientId);
    if (!client) return;

    const paymentPlan = contract.paymentPlan;
    const projectCost = contract.projectCost || 0;
    
    // Recalculate payment plan amounts if needed
    const calculatedPlan = projectCost > 0 
      ? calculatePaymentPlan(projectCost, paymentPlan)
      : paymentPlan;

    // Process installments
    if (calculatedPlan.structure === "installments" && calculatedPlan.installments) {
      calculatedPlan.installments.forEach((installment) => {
        if (!installment.amount || installment.amount <= 0) return;
        
        // Find linked invoice
        const linkedInvoice = invoices.find(
          (inv) => inv.contractId === contract.id && inv.paymentPlanItemId === installment.id
        );
        
        let status: "paid" | "pending" | "overdue";
        let dueDate: Date;
        
        if (installment.dueDate) {
          dueDate = new Date(installment.dueDate);
        } else {
          // Default to contract start date
          dueDate = new Date(contract.startDate);
        }
        
        if (linkedInvoice) {
          // Status from invoice
          if (linkedInvoice.status === "paid") {
            status = "paid";
          } else {
            dueDate.setHours(0, 0, 0, 0);
            status = dueDate < today ? "overdue" : "pending";
          }
        } else {
          // No invoice yet, determine status from due date
          dueDate.setHours(0, 0, 0, 0);
          status = dueDate < today ? "overdue" : "pending";
        }
        
        payments.push({
          id: `contract-${contract.id}-installment-${installment.id}`,
          clientId: contract.clientId,
          amount: installment.amount,
          dueDate,
          paidDate: linkedInvoice?.status === "paid" ? dueDate : null,
          type: "installment",
          installmentNumber: calculatedPlan.installments.indexOf(installment) + 1,
          status,
          clientName: client.name,
        });
      });
    }

    // Process milestones
    if (calculatedPlan.structure === "milestones" && calculatedPlan.milestones) {
      calculatedPlan.milestones.forEach((milestone) => {
        if (!milestone.amount || milestone.amount <= 0) return;
        
        const linkedInvoice = invoices.find(
          (inv) => inv.contractId === contract.id && inv.paymentPlanItemId === milestone.id
        );
        
        let status: "paid" | "pending" | "overdue";
        let dueDate: Date;
        
        if (milestone.dueDate) {
          dueDate = new Date(milestone.dueDate);
        } else {
          dueDate = new Date(contract.startDate);
        }
        
        if (linkedInvoice) {
          if (linkedInvoice.status === "paid") {
            status = "paid";
          } else {
            dueDate.setHours(0, 0, 0, 0);
            status = dueDate < today ? "overdue" : "pending";
          }
        } else {
          dueDate.setHours(0, 0, 0, 0);
          status = dueDate < today ? "overdue" : "pending";
        }
        
        payments.push({
          id: `contract-${contract.id}-milestone-${milestone.id}`,
          clientId: contract.clientId,
          amount: milestone.amount,
          dueDate,
          paidDate: linkedInvoice?.status === "paid" ? dueDate : null,
          type: "installment",
          status,
          clientName: client.name,
        });
      });
    }

    // Process custom payments
    if (calculatedPlan.structure === "custom" && calculatedPlan.customPayments) {
      calculatedPlan.customPayments.forEach((customPayment) => {
        if (!customPayment.amount || customPayment.amount <= 0) return;
        
        const linkedInvoice = invoices.find(
          (inv) => inv.contractId === contract.id && inv.paymentPlanItemId === customPayment.id
        );
        
        let status: "paid" | "pending" | "overdue";
        let dueDate: Date;
        
        if (customPayment.dueDate) {
          dueDate = new Date(customPayment.dueDate);
        } else {
          dueDate = new Date(contract.startDate);
        }
        
        if (linkedInvoice) {
          if (linkedInvoice.status === "paid") {
            status = "paid";
          } else {
            dueDate.setHours(0, 0, 0, 0);
            status = dueDate < today ? "overdue" : "pending";
          }
        } else {
          dueDate.setHours(0, 0, 0, 0);
          status = dueDate < today ? "overdue" : "pending";
        }
        
        payments.push({
          id: `contract-${contract.id}-custom-${customPayment.id}`,
          clientId: contract.clientId,
          amount: customPayment.amount,
          dueDate,
          paidDate: linkedInvoice?.status === "paid" ? dueDate : null,
          type: "installment",
          status,
          clientName: client.name,
        });
      });
    }
  });

  // Sort by due date
  return payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function calculateDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start 1 month back, end 11 months forward (12 months total)
  const start = new Date(today);
  start.setMonth(start.getMonth() - 1);
  start.setDate(1); // First day of the month

  const end = new Date(today);
  end.setMonth(end.getMonth() + 11);
  // Last day of the month
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);

  return { start, end };
}

export function createClientColorMap(clients: Client[]): Map<string, string> {
  const clientColors = [
    "hsl(217, 91%, 60%)", // Blue
    "hsl(142, 76%, 36%)", // Green
    "hsl(38, 92%, 50%)", // Orange
    "hsl(340, 82%, 52%)", // Pink
    "hsl(262, 83%, 58%)", // Purple
    "hsl(0, 84%, 60%)", // Red
    "hsl(199, 89%, 48%)", // Cyan
    "hsl(280, 100%, 70%)", // Light Purple
    "hsl(47, 96%, 53%)", // Yellow
    "hsl(158, 64%, 52%)", // Teal
  ];

  const map = new Map<string, string>();
  clients.forEach((client, index) => {
    map.set(client.id, clientColors[index % clientColors.length]);
  });
  return map;
}
