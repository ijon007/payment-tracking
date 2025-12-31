"use client";

import {
  Calendar,
  CurrencyDollar,
  TrendUp,
  Wallet,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ChartDialog } from "@/components/dashboard/chart-dialog";
import {
  calculateTotals,
  generateDashboardChartData,
} from "@/components/dashboard/dashboard-calculations";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusCard } from "@/components/dashboard/status-card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function Dashboard() {
  const { clients, invoices } = usePaymentStore();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate totals - use empty array during SSR to prevent hydration mismatch
  const clientsToUse = mounted ? clients : [];
  const invoicesToUse = mounted ? invoices : [];
  const { totalRevenue, totalOutstanding, totalDue, totalRetainers } =
    calculateTotals(clientsToUse, invoicesToUse);
  const { revenueData, outstandingData, dueData, retainersData } =
    generateDashboardChartData(clientsToUse);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          chartData={revenueData}
          gradientId="gradient-revenue"
          icon={
            <CurrencyDollar
              className="h-4 w-4 text-muted-foreground"
              weight="fill"
            />
          }
          onOpenDialog={() => setOpenDialog("revenue")}
          title="Total Revenue"
          value={totalRevenue}
        />
        <MetricCard
          chartData={outstandingData}
          gradientId="gradient-outstanding"
          icon={
            <TrendUp className="h-4 w-4 text-muted-foreground" weight="fill" />
          }
          onOpenDialog={() => setOpenDialog("outstanding")}
          title="Total Outstanding Balance"
          value={totalOutstanding}
        />
        <MetricCard
          chartData={dueData}
          gradientId="gradient-due"
          icon={
            <Calendar className="h-4 w-4 text-muted-foreground" weight="fill" />
          }
          onOpenDialog={() => setOpenDialog("due")}
          title="Total Due"
          value={totalDue}
        />
        <MetricCard
          chartData={retainersData}
          gradientId="gradient-retainers"
          icon={
            <Wallet className="h-4 w-4 text-muted-foreground" weight="fill" />
          }
          onOpenDialog={() => setOpenDialog("retainers")}
          title="Total Retainers"
          value={totalRetainers}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          colorClass="bg-primary"
          count={clientsToUse.filter((c) => c.status === "paid").length}
          description="Clients with all payments completed"
          title="Paid"
        />
        <StatusCard
          colorClass="bg-secondary"
          count={clientsToUse.filter((c) => c.status === "pending").length}
          description="Clients with pending payments"
          title="Pending"
        />
        <StatusCard
          colorClass="bg-destructive"
          count={clientsToUse.filter((c) => c.status === "overdue").length}
          description="Clients with overdue payments"
          title="Overdue"
        />
      </div>

      <ChartDialog
        data={revenueData}
        gradientId="gradient-revenue-dialog"
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "revenue"}
        title="Total Revenue"
      />
      <ChartDialog
        data={outstandingData}
        gradientId="gradient-outstanding-dialog"
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "outstanding"}
        title="Total Outstanding Balance"
      />
      <ChartDialog
        data={dueData}
        gradientId="gradient-due-dialog"
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "due"}
        title="Total Due"
      />
      <ChartDialog
        data={retainersData}
        gradientId="gradient-retainers-dialog"
        onOpenChange={(open) => !open && setOpenDialog(null)}
        open={openDialog === "retainers"}
        title="Total Retainers"
      />
    </div>
  );
}
