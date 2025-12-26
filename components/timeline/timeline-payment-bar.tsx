"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/payment-utils";
import type { PaymentWithStatus } from "./timeline-calculations";
import type { TimelineConfig } from "./timeline-config";

interface TimelinePaymentBarProps {
  payment: PaymentWithStatus;
  index: number;
  allPayments: PaymentWithStatus[];
  config: TimelineConfig;
  clientColor: string;
}

export function TimelinePaymentBar({
  payment,
  index,
  allPayments,
  config,
  clientColor,
}: TimelinePaymentBarProps) {
  const position = config.dateToPixel(payment.dueDate);
  const barHeight = 24;

  // Find the next payment from the same client
  const nextPayment = allPayments.find(
    (p) =>
      p.clientId === payment.clientId &&
      p.id !== payment.id &&
      p.dueDate > payment.dueDate
  );

  // Calculate bar width based on time until next payment
  let barWidth: number;
  if (nextPayment) {
    // Extend to the next payment's due date
    const nextPosition = config.dateToPixel(nextPayment.dueDate);
    barWidth = Math.max(60, nextPosition - position); // Minimum 60px width
  } else {
    // Last payment for this client - extend 30 days forward or to end of timeline
    const daysToExtend = 30;
    const extendedWidth = daysToExtend * config.pixelsPerDay;
    const maxWidth = config.timelineWidth - position;
    barWidth = Math.max(60, Math.min(extendedWidth, maxWidth));
  }

  // Stagger payments vertically to fill the height
  // Distribute payments across multiple rows to fill available space
  const totalPayments = allPayments.length;
  const maxRows = Math.max(20, Math.ceil(totalPayments / 2)); // At least 20 rows
  const verticalSpacing = 50; // Fixed spacing that fills height well
  const baseTop = 20;
  const rowIndex = index % maxRows;
  const topOffset = baseTop + rowIndex * verticalSpacing;

  // Better coloring based on status with improved contrast
  let bgOpacity = 0.7;
  let borderOpacity = 1;
  let borderWidth = "1.5px";
  let textColor = "text-foreground";

  if (payment.status === "paid") {
    bgOpacity = 0.5;
    borderOpacity = 0.7;
    borderWidth = "1px";
  } else if (payment.status === "overdue") {
    bgOpacity = 0.85;
    borderOpacity = 1;
    borderWidth = "2px";
    textColor = "text-foreground";
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className="absolute flex cursor-pointer items-center justify-center rounded-md border px-2 text-xs shadow-sm transition-opacity"
            style={{
              left: `${position}px`,
              top: `${topOffset}px`,
              width: `${barWidth}px`,
              height: `${barHeight}px`,
              backgroundColor: `color-mix(in srgb, ${clientColor} ${bgOpacity * 100}%, transparent)`,
              borderColor: `color-mix(in srgb, ${clientColor} ${borderOpacity * 100}%, transparent)`,
              borderWidth,
            }}
          >
            <span className={`truncate font-semibold text-[11px] ${textColor}`}>
              {formatCurrency(payment.amount)}
            </span>
          </div>
        }
      />
      <TooltipContent
        className="w-80 border border-zinc-700 bg-zinc-900 text-foreground shadow-lg"
        hideArrow
        side="bottom"
      >
        <div className="space-y-2.5 py-1.5">
          <div className="font-semibold text-base text-white">
            {payment.clientName}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Amount:</span>
              <span className="font-medium text-white">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Due:</span>
              <span className="text-white">
                {payment.dueDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Status:</span>
              <Badge
                className="text-xs"
                variant={
                  payment.status === "paid"
                    ? "default"
                    : payment.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {payment.status.charAt(0).toUpperCase() +
                  payment.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="border-zinc-700 border-t pt-1.5">
            <div className="text-xs text-zinc-400">
              {payment.type === "retainer"
                ? "Retainer"
                : `Installment #${payment.installmentNumber}`}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
