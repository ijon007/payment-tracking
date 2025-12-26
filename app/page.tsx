"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/lib/store"
import { generateChartData, formatCurrency } from "@/lib/payment-utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { CurrencyDollar, TrendUp, Calendar, Wallet, ArrowSquareOut } from "@phosphor-icons/react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function Dashboard() {
  const { clients } = usePaymentStore()
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate totals - use empty array during SSR to prevent hydration mismatch
  const clientsToUse = mounted ? clients : []
  const totalRevenue = clientsToUse.reduce(
    (sum, client) => sum + client.amountPaid,
    0
  )

  const totalOutstanding = clientsToUse.reduce(
    (sum, client) => sum + client.amountDue,
    0
  )

  const totalDue = clientsToUse.reduce((sum, client) => {
    const unpaid = client.payments
      .filter((p) => !p.paidDate)
      .reduce((s, p) => s + p.amount, 0)
    return sum + unpaid
  }, 0)

  const totalRetainers = clientsToUse.reduce((sum, client) => {
    const retainers = client.payments
      .filter((p) => p.type === "retainer" && p.paidDate)
      .reduce((s, p) => s + p.amount, 0)
    return sum + retainers
  }, 0)

  // Generate chart data
  const revenueData = generateChartData(clientsToUse, "revenue", 6)
  const outstandingData = generateChartData(clientsToUse, "outstanding", 6)
  const dueData = generateChartData(clientsToUse, "due", 6)
  const retainersData = generateChartData(clientsToUse, "retainers", 6)

  const chartConfig = {
    value: {
      label: "Value",
      color: "#5e6ad2",
    },
  }

  const renderChart = (data: typeof revenueData, title: string, gradientId: string) => (
    <div className="w-full overflow-hidden -mx-10 px-0">
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <AreaChart data={data} margin={{ left: 50, right: 20, top: 10, bottom: 30 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5e6ad2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5e6ad2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            width={50}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#5e6ad2"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )

  const renderSmallChart = (data: typeof revenueData, gradientId: string) => (
    <ChartContainer config={chartConfig} className="h-[200px] w-full -mx-6">
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5e6ad2" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5e6ad2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#5e6ad2"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollar weight="fill" className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpenDialog("revenue")}
              >
                <ArrowSquareOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">
              {formatCurrency(totalRevenue)}
            </div>
            {renderSmallChart(revenueData, "gradient-revenue")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendUp weight="fill" className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Total Outstanding Balance
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpenDialog("outstanding")}
              >
                <ArrowSquareOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">
              {formatCurrency(totalOutstanding)}
            </div>
            {renderSmallChart(outstandingData, "gradient-outstanding")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar weight="fill" className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpenDialog("due")}
              >
                <ArrowSquareOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">
              {formatCurrency(totalDue)}
            </div>
            {renderSmallChart(dueData, "gradient-due")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet weight="fill" className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  Total Retainers
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpenDialog("retainers")}
              >
                <ArrowSquareOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-4">
              {formatCurrency(totalRetainers)}
            </div>
            {renderSmallChart(retainersData, "gradient-retainers")}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary" />
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsToUse.filter((c) => c.status === "paid").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients with all payments completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-secondary" />
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsToUse.filter((c) => c.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients with pending payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-destructive" />
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientsToUse.filter((c) => c.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clients with overdue payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openDialog === "revenue"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Total Revenue</DialogTitle>
          </DialogHeader>
          {renderChart(revenueData, "Total Revenue", "gradient-revenue-dialog")}
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "outstanding"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Total Outstanding Balance</DialogTitle>
          </DialogHeader>
          {renderChart(outstandingData, "Total Outstanding Balance", "gradient-outstanding-dialog")}
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "due"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Total Due</DialogTitle>
          </DialogHeader>
          {renderChart(dueData, "Total Due", "gradient-due-dialog")}
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === "retainers"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Total Retainers</DialogTitle>
          </DialogHeader>
          {renderChart(retainersData, "Total Retainers", "gradient-retainers-dialog")}
        </DialogContent>
      </Dialog>
    </div>
  )
}
