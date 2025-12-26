import { type Client, generateChartData } from "@/lib/payment-utils";

export function calculateTotals(clients: Client[]) {
  const totalRevenue = clients.reduce(
    (sum, client) => sum + client.amountPaid,
    0
  );

  const totalOutstanding = clients.reduce(
    (sum, client) => sum + client.amountDue,
    0
  );

  const totalDue = clients.reduce((sum, client) => {
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

  return {
    totalRevenue,
    totalOutstanding,
    totalDue,
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
