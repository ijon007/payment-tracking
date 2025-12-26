"use client";

import {
  Calendar as CalendarIcon,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarNavigation({
  currentDate,
  onDateChange,
  onPreviousMonth,
  onNextMonth,
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        aria-label="Previous month"
        onClick={onPreviousMonth}
        size="icon"
        variant="outline"
      >
        <CaretLeft className="size-4" weight="fill" />
      </Button>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              className="min-w-[200px] cursor-pointer justify-start"
              variant="outline"
            >
              <CalendarIcon className="mr-2 size-4" weight="fill" />
              {format(currentDate, "MMMM yyyy")}
            </Button>
          }
        />
        <PopoverContent align="center" className="w-auto p-0">
          <Calendar
            className="[--cell-size:2rem]"
            classNames={{
              today:
                "bg-red-800 text-white rounded-md data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
            }}
            initialFocus
            mode="single"
            onSelect={onDateChange}
            required
            selected={currentDate}
          />
        </PopoverContent>
      </Popover>

      <Button
        aria-label="Next month"
        onClick={onNextMonth}
        size="icon"
        variant="outline"
      >
        <CaretRight className="size-4" weight="fill" />
      </Button>
    </div>
  );
}
