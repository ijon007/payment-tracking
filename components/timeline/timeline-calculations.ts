import type { Client, Payment } from "@/lib/payment-utils";

export type PaymentWithStatus = Payment & {
  status: "paid" | "pending" | "overdue";
  clientName: string;
  clientId: string;
};

export function calculatePaymentStatuses(
  clients: Client[]
): PaymentWithStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const payments: PaymentWithStatus[] = [];

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

  // Sort by due date
  return payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function calculateDateRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start 1 month back, end 5 months forward (6 months total)
  const start = new Date(today);
  start.setMonth(start.getMonth() - 1);
  start.setDate(1); // First day of the month

  const end = new Date(today);
  end.setMonth(end.getMonth() + 5);
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
