"use client";

import { Calendar as CalendarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateForContract } from "./contract-utils";
import type { DateFormat } from "@/lib/settings-store";

interface InlineDatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: DateFormat;
}

export function InlineDatePicker({
  date,
  onSelect,
  placeholder = "___ / ___ / ___",
  dateFormat,
}: InlineDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "inline h-auto border-b bg-transparent px-1 py-0.5 font-normal transition-colors hover:bg-transparent focus-visible:border-foreground",
              date
                ? "border-solid border-foreground/50 text-foreground hover:text-foreground"
                : "border-dashed border-muted text-muted-foreground hover:text-muted-foreground"
            )}
            variant="ghost"
          >
            {date ? formatDateForContract(date, dateFormat) : placeholder}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          className="p-2"
          initialFocus
          mode="single"
          onSelect={onSelect}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}

