"use client";

import { CaretDown, MagnifyingGlassIcon, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { Invoice } from "@/lib/invoice-utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePaymentStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface InvoiceFilters {
  search: string;
  status: "all" | "paid" | "unpaid";
  dueDate: "all" | "overdue" | "today" | "this-week" | "this-month" | "next-month";
  createdDate: "all" | "today" | "this-week" | "this-month" | "last-month";
}

interface InvoiceFiltersProps {
  invoices: Invoice[];
  onFilterChange: (filteredInvoices: Invoice[]) => void;
}

function getDateRange(filter: InvoiceFilters["dueDate"] | InvoiceFilters["createdDate"]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case "today": {
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start: today, end };
    }
    case "this-week": {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "this-month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "next-month": {
      const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "last-month": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "overdue": {
      return { start: null, end: new Date(today.getTime() - 1) };
    }
    default:
      return { start: null, end: null };
  }
}

export function InvoiceFilters({ invoices, onFilterChange }: InvoiceFiltersProps) {
  const { getClient } = usePaymentStore();
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: "",
    status: "all",
    dueDate: "all",
    createdDate: "all",
  });

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((invoice) => {
        const client = getClient(invoice.clientId);
        const clientName = client?.name || "";
        return (
          (invoice.invoiceNumber || "").toLowerCase().includes(searchLower) ||
          (invoice.companyName || "").toLowerCase().includes(searchLower) ||
          clientName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status !== "all") {
      if (filters.status === "paid") {
        result = result.filter((invoice) => invoice.status === "paid");
      } else if (filters.status === "unpaid") {
        result = result.filter((invoice) => invoice.status !== "paid");
      }
    }

    // Due date filter
    if (filters.dueDate !== "all") {
      const { start, end } = getDateRange(filters.dueDate);
      result = result.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        if (filters.dueDate === "overdue") {
          return dueDate < end! && invoice.status !== "paid";
        }
        if (start && end) {
          return dueDate >= start && dueDate <= end;
        }
        return true;
      });
    }

    // Created date filter
    if (filters.createdDate !== "all") {
      const { start, end } = getDateRange(filters.createdDate);
      if (start && end) {
        result = result.filter((invoice) => {
          const createdDate = new Date(invoice.issueDate);
          return createdDate >= start && createdDate <= end;
        });
      }
    }

    return result;
  }, [invoices, filters, getClient]);

  useEffect(() => {
    onFilterChange(filteredInvoices);
  }, [filteredInvoices, onFilterChange]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.dueDate !== "all" ||
    filters.createdDate !== "all";

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dueDate: "all",
      createdDate: "all",
    });
  };

  const getStatusLabel = (status: InvoiceFilters["status"]) => {
    if (status === "all") return "All Status";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: InvoiceFilters["status"]) => {
    switch (status) {
      case "all":
        return "bg-muted-foreground";
      case "paid":
        return "bg-green-500";
      case "unpaid":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getDueDateLabel = (dueDate: InvoiceFilters["dueDate"]) => {
    const labels: Record<InvoiceFilters["dueDate"], string> = {
      all: "All Due Dates",
      overdue: "Overdue",
      today: "Today",
      "this-week": "This Week",
      "this-month": "This Month",
      "next-month": "Next Month",
    };
    return labels[dueDate];
  };

  const getCreatedDateLabel = (createdDate: InvoiceFilters["createdDate"]) => {
    const labels: Record<InvoiceFilters["createdDate"], string> = {
      all: "All Dates",
      today: "Today",
      "this-week": "This Week",
      "this-month": "This Month",
      "last-month": "Last Month",
    };
    return labels[createdDate];
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlassIcon className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search invoices..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="pl-8 pr-8"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-[140px] justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn("size-3 shrink-0 rounded-full", getStatusColor(filters.status))}
                  />
                  <span className="truncate">{getStatusLabel(filters.status)}</span>
                </div>
                <CaretDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("all"))} />
                <span>All Status</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "paid" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("paid"))} />
                <span>Paid</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "unpaid" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("unpaid"))} />
                <span>Unpaid</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-[140px] justify-between">
                <span>{getDueDateLabel(filters.dueDate)}</span>
                <CaretDown className="h-4 w-4 opacity-50" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "all" }))}
            >
              All Due Dates
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "overdue" }))}
            >
              Overdue
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "today" }))}
            >
              Today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "this-week" }))}
            >
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "this-month" }))}
            >
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, dueDate: "next-month" }))}
            >
              Next Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-[140px] justify-between">
                <span>{getCreatedDateLabel(filters.createdDate)}</span>
                <CaretDown className="h-4 w-4 opacity-50" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, createdDate: "all" }))}
            >
              All Dates
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, createdDate: "today" }))}
            >
              Today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, createdDate: "this-week" }))}
            >
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, createdDate: "this-month" }))}
            >
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, createdDate: "last-month" }))}
            >
              Last Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            className="bg-primary/10 border-primary/50 text-primary hover:bg-primary/30 hover:border-primary/60"
          >
            <X className="size-4" weight="bold" />
            <span>Clear Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}

