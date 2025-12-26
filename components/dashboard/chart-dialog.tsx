"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ChartData = Array<{ month: string; value: number }>;

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: ChartData;
  gradientId: string;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "#5e6ad2",
  },
};

function renderChart(data: ChartData, gradientId: string) {
  return (
    <div className="-mx-10 w-full overflow-hidden px-0">
      <ChartContainer className="h-[400px] w-full" config={chartConfig}>
        <AreaChart
          data={data}
          margin={{ left: 50, right: 20, top: 10, bottom: 30 }}
        >
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
            width={50}
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
    </div>
  );
}

export function ChartDialog({
  open,
  onOpenChange,
  title,
  data,
  gradientId,
}: ChartDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {renderChart(data, gradientId)}
      </DialogContent>
    </Dialog>
  );
}
