"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateDateRange,
  calculatePaymentStatuses,
  createClientColorMap,
} from "@/components/timeline/timeline-calculations";
import { calculateTimelineConfig } from "@/components/timeline/timeline-config";
import { TimelineGrid } from "@/components/timeline/timeline-grid";
import { TimelineHeader } from "@/components/timeline/timeline-header";
import { TimelinePaymentBar } from "@/components/timeline/timeline-payment-bar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function TimelinePage() {
  const { clients } = usePaymentStore();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render date-dependent content on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Flatten all payments from all clients into a single array
  const allPayments = useMemo(() => {
    if (!mounted) {
      return [];
    }
    return calculatePaymentStatuses(clients);
  }, [clients, mounted]);

  // Create client color mapping
  const clientColorMap = useMemo(() => {
    return createClientColorMap(clients);
  }, [clients]);

  // Calculate date range - always 12 months from today
  const dateRange = useMemo(() => {
    if (!mounted) {
      // Return a stable default for SSR
      const defaultStart = new Date();
      defaultStart.setMonth(defaultStart.getMonth() - 1);
      defaultStart.setDate(1);
      const defaultEnd = new Date();
      defaultEnd.setMonth(defaultEnd.getMonth() + 11);
      defaultEnd.setMonth(defaultEnd.getMonth() + 1);
      defaultEnd.setDate(0);
      return { start: defaultStart, end: defaultEnd };
    }
    return calculateDateRange();
  }, [mounted]);

  // Calculate timeline dimensions and date-to-pixel conversion
  const timelineConfig = useMemo(() => {
    return calculateTimelineConfig(dateRange);
  }, [dateRange]);

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] w-[calc(100%+2rem)] flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex shrink-0 items-center gap-2 border-border border-b px-4 py-2">
        <SidebarTrigger className="-ml-1" />
        <h1 className="font-semibold">Payment Timeline</h1>
      </div>

      {/* Scrollable Gantt Area */}
      <div className="w-full flex-1 overflow-auto">
        <div className="relative h-full w-full">
          {/* Timeline Header - Fixed when scrolling vertically */}
          <TimelineHeader config={timelineConfig} />

          {/* Single Unified Timeline - All Payments */}
          <div
            className="relative"
            style={{
              width: `${timelineConfig.timelineWidth}px`,
              minWidth: "100%",
              minHeight: "calc(100vh - 150px)",
            }}
          >
            <TimelineGrid config={timelineConfig} />

            {/* Render all payments on the timeline */}
            {allPayments.map((payment, index) => {
              const clientColor =
                clientColorMap.get(payment.clientId) || "hsl(217, 91%, 60%)";
              return (
                <TimelinePaymentBar
                  allPayments={allPayments}
                  clientColor={clientColor}
                  config={timelineConfig}
                  index={index}
                  key={payment.id}
                  payment={payment}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
