"use client";

import { CaretDown, MagnifyingGlassIcon, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import type { Contract } from "@/lib/contract-utils";
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

export interface ContractFilters {
  search: string;
  status: "all" | "created" | "sent" | "signed" | "active" | "expired";
  endDate: "all" | "expired" | "today" | "this-week" | "this-month" | "next-month";
  createdDate: "all" | "today" | "this-week" | "this-month" | "last-month";
}

interface ContractFiltersProps {
  contracts: Contract[];
  onFilterChange: (filteredContracts: Contract[]) => void;
}

function getDateRange(filter: ContractFilters["endDate"] | ContractFilters["createdDate"]) {
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
    case "expired": {
      return { start: null, end: new Date(today.getTime() - 1) };
    }
    default:
      return { start: null, end: null };
  }
}

export function ContractFilters({ contracts, onFilterChange }: ContractFiltersProps) {
  const { getClient } = usePaymentStore();
  const [filters, setFilters] = useState<ContractFilters>({
    search: "",
    status: "all",
    endDate: "all",
    createdDate: "all",
  });

  const filteredContracts = useMemo(() => {
    let result = [...contracts];

    // Search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((contract) => {
        const client = getClient(contract.clientId);
        const clientName = client?.name || "";
        return (
          (contract.contractNumber || "").toLowerCase().includes(searchLower) ||
          clientName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((contract) => {
        // Handle legacy "draft" status - treat it as "created"
        // @ts-expect-error - legacy contracts may have "draft" status
        const contractStatus = contract.status === "draft" ? "created" : contract.status;
        return contractStatus === filters.status;
      });
    }

    // End date filter
    if (filters.endDate !== "all") {
      const { start, end } = getDateRange(filters.endDate);
      result = result.filter((contract) => {
        const endDate = new Date(contract.endDate);
        if (filters.endDate === "expired") {
          return endDate < end!;
        }
        if (start && end) {
          return endDate >= start && endDate <= end;
        }
        return true;
      });
    }

    // Created date filter
    if (filters.createdDate !== "all") {
      const { start, end } = getDateRange(filters.createdDate);
      if (start && end) {
        result = result.filter((contract) => {
          const createdDate = new Date(contract.issueDate);
          return createdDate >= start && createdDate <= end;
        });
      }
    }

    return result;
  }, [contracts, filters, getClient]);

  useEffect(() => {
    onFilterChange(filteredContracts);
  }, [filteredContracts, onFilterChange]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.endDate !== "all" ||
    filters.createdDate !== "all";

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      endDate: "all",
      createdDate: "all",
    });
  };

  const getStatusLabel = (status: ContractFilters["status"]) => {
    if (status === "all") return "All Status";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: ContractFilters["status"]) => {
    switch (status) {
      case "all":
        return "bg-muted-foreground";
      case "active":
      case "signed":
        return "bg-green-500";
      case "sent":
        return "bg-blue-500";
      case "created":
        return "bg-gray-500";
      case "expired":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getEndDateLabel = (endDate: ContractFilters["endDate"]) => {
    const labels: Record<ContractFilters["endDate"], string> = {
      all: "All End Dates",
      expired: "Expired",
      today: "Today",
      "this-week": "This Week",
      "this-month": "This Month",
      "next-month": "Next Month",
    };
    return labels[endDate];
  };

  const getCreatedDateLabel = (createdDate: ContractFilters["createdDate"]) => {
    const labels: Record<ContractFilters["createdDate"], string> = {
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
          placeholder="Search contracts..."
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
              onClick={() => setFilters((prev) => ({ ...prev, status: "created" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("created"))} />
                <span>Created</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "sent" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("sent"))} />
                <span>Sent</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "signed" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("signed"))} />
                <span>Signed</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "active" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("active"))} />
                <span>Active</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, status: "expired" }))}
            >
              <div className="flex items-center gap-2">
                <div className={cn("size-3 rounded-full", getStatusColor("expired"))} />
                <span>Expired</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="w-[140px] justify-between">
                <span>{getEndDateLabel(filters.endDate)}</span>
                <CaretDown className="h-4 w-4 opacity-50" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "all" }))}
            >
              All End Dates
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "expired" }))}
            >
              Expired
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "today" }))}
            >
              Today
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "this-week" }))}
            >
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "this-month" }))}
            >
              This Month
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilters((prev) => ({ ...prev, endDate: "next-month" }))}
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

