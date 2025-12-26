"use client";

import { ArrowSquareOut } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/payment-utils";

type ChartData = Array<{ month: string; value: number }>;

interface MetricCardProps {
  title: string;
  value: number;
  chartData: ChartData;
  gradientId: string;
  icon: ReactNode;
  onOpenDialog: () => void;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "#5e6ad2",
  },
};

function renderSmallChart(data: ChartData, gradientId: string) {
  return (
    <ChartContainer className="-mx-6 h-[200px] w-full" config={chartConfig}>
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#5e6ad2" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5e6ad2" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          dataKey="month"
          tickLine={false}
          tickMargin={8}
        />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          tickLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          content={<ChartTooltipContent indicator="dot" />}
          cursor={false}
        />
        <Area
          dataKey="value"
          dot={false}
          fill={`url(#${gradientId})`}
          stroke="#5e6ad2"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}

export function MetricCard({
  title,
  value,
  chartData,
  gradientId,
  icon,
  onOpenDialog,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="font-medium text-sm">{title}</CardTitle>
          </div>
          <Button
            className="h-6 w-6"
            onClick={onOpenDialog}
            size="icon"
            variant="ghost"
          >
            <ArrowSquareOut className="size-3" weight="bold" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 font-bold text-2xl">{formatCurrency(value)}</div>
        {renderSmallChart(chartData, gradientId)}
      </CardContent>
    </Card>
  );
}
