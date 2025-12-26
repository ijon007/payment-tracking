"use client";

import { useEffect, useMemo, useState } from "react";
import { collectCalendarEvents } from "@/components/calendar/calendar-events";
import { CalendarNavigation } from "@/components/calendar/calendar-navigation";
import { MonthCalendar } from "@/components/month-calendar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePaymentStore } from "@/lib/store";

export default function CalendarPage() {
  const { clients, contracts, getClient } = usePaymentStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Collect all events
  const events = useMemo(() => {
    if (!mounted) {
      return [];
    }
    return collectCalendarEvents(clients, contracts, getClient);
  }, [clients, contracts, getClient, mounted]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className="absolute inset-0 -m-4 flex flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 border-border border-b px-7 py-2 pt-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">Calendar</h1>
        </div>

        {/* Navigation Controls */}
        <CalendarNavigation
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNextMonth={goToNextMonth}
          onPreviousMonth={goToPreviousMonth}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4">
        <div className="h-full w-full">
          <MonthCalendar
            events={events}
            month={currentMonth}
            year={currentYear}
          />
        </div>
      </div>
    </div>
  );
}
