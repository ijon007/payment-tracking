import type { Invoice } from "@/lib/invoice-utils";
import { type Client, generateChartData } from "@/lib/payment-utils";

export function calculateTotals(clients: Client[], invoices: Invoice[] = []) {
  // Calculate from invoices (primary source)
  const invoiceRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const invoiceOutstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const invoiceDue = invoices
    .filter((inv) => {
      if (inv.status === "paid") return false;
      const dueDate = new Date(inv.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= thirtyDaysFromNow;
    })
    .reduce((sum, inv) => sum + inv.total, 0);

  // Also include legacy client payments for backward compatibility
  const clientRevenue = clients.reduce(
    (sum, client) => sum + client.amountPaid,
    0
  );

  const clientOutstanding = clients.reduce(
    (sum, client) => sum + client.amountDue,
    0
  );

  const clientDue = clients.reduce((sum, client) => {
    const unpaid = client.payments
      .filter((p) => !p.paidDate)
      .reduce((s, p) => s + p.amount, 0);
    return sum + unpaid;
  }, 0);

  const totalRetainers = clients.reduce((sum, client) => {
    const retainers = client.payments
      .filter((p) => p.type === "retainer" && p.paidDate)
      .reduce((s, p) => s + p.amount, 0);
    return sum + retainers;
  }, 0);

  // Combine invoice and client data (prioritize invoices, but include client payments for legacy data)
  return {
    totalRevenue: invoiceRevenue + clientRevenue,
    totalOutstanding: invoiceOutstanding + clientOutstanding,
    totalDue: invoiceDue + clientDue,
    totalRetainers,
  };
}

export function generateDashboardChartData(clients: Client[]) {
  return {
    revenueData: generateChartData(clients, "revenue", 6),
    outstandingData: generateChartData(clients, "outstanding", 6),
    dueData: generateChartData(clients, "due", 6),
    retainersData: generateChartData(clients, "retainers", 6),
  };
}
