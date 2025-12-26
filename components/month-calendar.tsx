"use client";

import {
  CheckCircle,
  CreditCard,
  FileText,
  WarningCircle,
} from "@phosphor-icons/react";
import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/payment-utils";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  type:
    | "payment"
    | "contract-start"
    | "contract-expiration"
    | "project-completion";
  date: Date;
  clientName: string;
  clientId: string;
  amount?: number;
  contractNumber?: string;
  paymentId?: string;
  contractId?: string;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  className?: string;
}

export function MonthCalendar({
  year,
  month,
  events,
  className,
}: MonthCalendarProps) {
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Weekday labels
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Group events by date (YYYY-MM-DD format)
  const eventsByDate = React.useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, "0")}-${String(event.date.getDate()).padStart(2, "0")}`;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)?.push(event);
    });
    return grouped;
  }, [events]);

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Calculate rows needed (always 6 rows to ensure consistent height)
  const rows = 6;
  const totalCells = rows * 7;
  const emptyCellsNeeded = totalCells - calendarDays.length;
  for (let i = 0; i < emptyCellsNeeded; i++) {
    calendarDays.push(null);
  }

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "payment":
        return "bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300";
      case "contract-start":
        return "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300";
      case "contract-expiration":
        return "bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-300";
      case "project-completion":
        return "bg-purple-500/20 border-purple-500/50 text-purple-700 dark:text-purple-300";
    }
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "payment":
        return CreditCard;
      case "contract-start":
        return FileText;
      case "contract-expiration":
        return WarningCircle;
      case "project-completion":
        return CheckCircle;
    }
  };

  const getEventLabel = (event: CalendarEvent) => {
    switch (event.type) {
      case "payment":
        return formatCurrency(event.amount || 0);
      case "contract-start":
        return "Start";
      case "contract-expiration":
        return "Expires";
      case "project-completion":
        return "Complete";
    }
  };

  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) {
      return false;
    }
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {/* Weekday headers */}
      <div className="grid shrink-0 grid-cols-7 gap-px border-border border-b">
        {weekdays.map((day) => (
          <div
            className="bg-muted/30 p-2 text-center font-medium text-muted-foreground text-xs"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-px overflow-hidden rounded-b-md border border-border">
        {calendarDays.map((date, index) => {
          const dateKey = date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            : null;
          const dayEvents = dateKey ? eventsByDate.get(dateKey) || [] : [];
          const isCurrentMonth = date !== null && date.getMonth() === month;
          const isTodayDate = isToday(date);

          return (
            <div
              className={cn(
                "flex h-full flex-col border-border border-r border-b bg-background last:border-r-0",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isTodayDate && "text-red-700"
              )}
              key={index}
            >
              {/* Day number */}
              <div
                className={cn(
                  "p-1.5 font-medium text-xs",
                  isTodayDate && "font-bold"
                )}
              >
                {date ? date.getDate() : ""}
              </div>

              {/* Events */}
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden p-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const Icon = getEventIcon(event.type);
                  return (
                    <Tooltip key={event.id}>
                      <TooltipTrigger
                        render={
                          <div
                            className={cn(
                              "flex cursor-pointer items-center gap-1 truncate rounded border px-1 py-0.5 text-[10px]",
                              getEventColor(event.type)
                            )}
                          >
                            <Icon className="size-4 shrink-0" weight="fill" />
                            <span className="truncate">
                              {getEventLabel(event)}
                            </span>
                          </div>
                        }
                      />
                      <TooltipContent
                        className="0 w-64 border border-white/6 bg-zinc-900 text-foreground"
                        hideArrow
                        side="top"
                      >
                        <div className="space-y-1.5">
                          <div className="font-semibold">
                            {event.clientName}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span>
                                {event.type === "payment" && "Payment Due"}
                                {event.type === "contract-start" &&
                                  "Contract Start"}
                                {event.type === "contract-expiration" &&
                                  "Contract Expiration"}
                                {event.type === "project-completion" &&
                                  "Project Completion"}
                              </span>
                            </div>
                            {event.amount && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Amount:
                                </span>
                                <span className="font-medium">
                                  {formatCurrency(event.amount)}
                                </span>
                              </div>
                            )}
                            {event.contractNumber && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Contract:
                                </span>
                                <span>{event.contractNumber}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Date:
                              </span>
                              <span>
                                {event.date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="px-1 py-0.5 text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
