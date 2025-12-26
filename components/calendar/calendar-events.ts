import type { CalendarEvent } from "@/components/month-calendar";
import type { Contract } from "@/lib/contract-utils";
import type { Client } from "@/lib/payment-utils";

export function collectCalendarEvents(
  clients: Client[],
  contracts: Contract[],
  getClient: (id: string) => Client | undefined
): CalendarEvent[] {
  const allEvents: CalendarEvent[] = [];

  // Payment due dates (only unpaid)
  clients.forEach((client) => {
    client.payments.forEach((payment) => {
      if (!payment.paidDate) {
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        allEvents.push({
          id: payment.id,
          type: "payment",
          date: dueDate,
          clientName: client.name,
          clientId: client.id,
          amount: payment.amount,
          paymentId: payment.id,
        });
      }
    });
  });

  // Contract start dates
  contracts.forEach((contract) => {
    const client = getClient(contract.clientId);
    if (client) {
      const startDate = new Date(contract.startDate);
      startDate.setHours(0, 0, 0, 0);

      allEvents.push({
        id: `contract-start-${contract.id}`,
        type: "contract-start",
        date: startDate,
        clientName: client.name,
        clientId: contract.clientId,
        contractNumber: contract.contractNumber,
        contractId: contract.id,
      });
    }
  });

  // Contract expiration dates
  contracts.forEach((contract) => {
    const client = getClient(contract.clientId);
    if (client) {
      const endDate = new Date(contract.endDate);
      endDate.setHours(0, 0, 0, 0);

      allEvents.push({
        id: `contract-expiration-${contract.id}`,
        type: "contract-expiration",
        date: endDate,
        clientName: client.name,
        clientId: contract.clientId,
        contractNumber: contract.contractNumber,
        contractId: contract.id,
      });
    }
  });

  // Project completion dates
  contracts.forEach((contract) => {
    if (contract.projectCompletionDate) {
      const client = getClient(contract.clientId);
      if (client) {
        const completionDate = new Date(contract.projectCompletionDate);
        completionDate.setHours(0, 0, 0, 0);

        allEvents.push({
          id: `project-completion-${contract.id}`,
          type: "project-completion",
          date: completionDate,
          clientName: client.name,
          clientId: contract.clientId,
          contractNumber: contract.contractNumber,
          contractId: contract.id,
        });
      }
    }
  });

  return allEvents;
}
