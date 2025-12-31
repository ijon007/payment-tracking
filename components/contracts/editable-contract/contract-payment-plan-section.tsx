"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PaymentPlan, ContractSettings } from "@/lib/contract-utils";
import { calculatePaymentPlan } from "@/lib/contract-settings";
import { formatDateForContract, formatCurrencyDisplay } from "./contract-utils";
import type { Currency } from "@/lib/currency-utils";

interface ContractPaymentPlanSectionProps {
  paymentPlan?: PaymentPlan;
  settings?: ContractSettings;
  projectCost?: number;
  currency: Currency;
  onPaymentPlanChange?: (plan: PaymentPlan) => void;
}

export function ContractPaymentPlanSection({
  paymentPlan,
  settings,
  projectCost,
  currency,
  onPaymentPlanChange,
}: ContractPaymentPlanSectionProps) {
  const structure = paymentPlan?.structure || settings?.paymentStructure || "simple";

  const updateInstallment = (
    id: string,
    field: "percentage" | "description" | "dueDate",
    value: number | string | Date | undefined
  ) => {
    if (!paymentPlan?.installments || !projectCost) return;
    const updated = {
      ...paymentPlan,
      installments: paymentPlan.installments.map((inst) =>
        inst.id === id ? { ...inst, [field]: value } : inst
      ),
    };
    const recalculated = calculatePaymentPlan(projectCost, updated);
    onPaymentPlanChange?.(recalculated);
  };

  const updateMilestone = (
    id: string,
    field: "name" | "percentage" | "description" | "dueDate",
    value: number | string | Date | undefined
  ) => {
    if (!paymentPlan?.milestones || !projectCost) return;
    const updated = {
      ...paymentPlan,
      milestones: paymentPlan.milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      ),
    };
    const recalculated = calculatePaymentPlan(projectCost, updated);
    onPaymentPlanChange?.(recalculated);
  };

  const updateCustomPayment = (
    id: string,
    field: "amount" | "description" | "dueDate",
    value: number | string | Date | undefined
  ) => {
    if (!paymentPlan?.customPayments) return;
    const updated = {
      ...paymentPlan,
      customPayments: paymentPlan.customPayments.map((payment) =>
        payment.id === id ? { ...payment, [field]: value } : payment
      ),
    };
    onPaymentPlanChange?.(updated);
  };

  const addInstallment = () => {
    if (!paymentPlan || !projectCost) return;
    const newId = Date.now().toString();
    const updated = {
      ...paymentPlan,
      installments: [
        ...(paymentPlan.installments || []),
        { id: newId, percentage: 0 },
      ],
    };
    const recalculated = calculatePaymentPlan(projectCost, updated);
    onPaymentPlanChange?.(recalculated);
  };

  const removeInstallment = (id: string) => {
    if (!paymentPlan?.installments || paymentPlan.installments.length <= 1) return;
    const updated = {
      ...paymentPlan,
      installments: paymentPlan.installments.filter((inst) => inst.id !== id),
    };
    if (projectCost) {
      const recalculated = calculatePaymentPlan(projectCost, updated);
      onPaymentPlanChange?.(recalculated);
    } else {
      onPaymentPlanChange?.(updated);
    }
  };

  const addMilestone = () => {
    if (!paymentPlan) return;
    const newId = Date.now().toString();
    const updated = {
      ...paymentPlan,
      milestones: [
        ...(paymentPlan.milestones || []),
        { id: newId, name: "", percentage: 0, description: "" },
      ],
    };
    if (projectCost) {
      const recalculated = calculatePaymentPlan(projectCost, updated);
      onPaymentPlanChange?.(recalculated);
    } else {
      onPaymentPlanChange?.(updated);
    }
  };

  const removeMilestone = (id: string) => {
    if (!paymentPlan?.milestones) return;
    const updated = {
      ...paymentPlan,
      milestones: paymentPlan.milestones.filter((milestone) => milestone.id !== id),
    };
    if (projectCost) {
      const recalculated = calculatePaymentPlan(projectCost, updated);
      onPaymentPlanChange?.(recalculated);
    } else {
      onPaymentPlanChange?.(updated);
    }
  };

  const addCustomPayment = () => {
    if (!paymentPlan) return;
    const newId = Date.now().toString();
    const updated = {
      ...paymentPlan,
      customPayments: [
        ...(paymentPlan.customPayments || []),
        { id: newId, amount: 0, description: "" },
      ],
    };
    onPaymentPlanChange?.(updated);
  };

  const removeCustomPayment = (id: string) => {
    if (!paymentPlan?.customPayments) return;
    const updated = {
      ...paymentPlan,
      customPayments: paymentPlan.customPayments.filter((payment) => payment.id !== id),
    };
    onPaymentPlanChange?.(updated);
  };

  if (structure === "simple") {
    return (
      <>
        <p>- Pagesa do të kryhet në dy faza:</p>
        <ul className="ml-6 list-disc space-y-1">
          <li>
            30% parapagim në momentin e nënshkrimit të kontratës (nisja e punës).
          </li>
          <li>70% pagesë përfundimtare pas dorëzimit të website-it.</li>
        </ul>
      </>
    );
  }

  if (structure === "installments") {
    if (!paymentPlan?.installments) {
      const initialPlan: PaymentPlan = {
        structure: "installments",
        installments: [
          { id: Date.now().toString(), percentage: 30 },
          { id: (Date.now() + 1).toString(), percentage: 70 },
        ],
      };
      if (projectCost) {
        const recalculated = calculatePaymentPlan(projectCost, initialPlan);
        onPaymentPlanChange?.(recalculated);
      } else {
        onPaymentPlanChange?.(initialPlan);
      }
      return null;
    }

    return (
      <>
        <p>
          - Pagesa do të kryhet në {paymentPlan.installments.length} faza:
          {" "}
          <Button
            className="inline h-auto border-b border-dashed border-foreground bg-transparent p-0 px-1 font-normal text-foreground hover:bg-transparent hover:text-foreground"
            variant="ghost"
            onClick={addInstallment}
            type="button"
          >
            <Plus className="size-3" />
          </Button>
        </p>
        <ul className="ml-6 list-disc space-y-1">
          {paymentPlan.installments.map((inst, index) => (
            <li key={inst.id} className="flex items-start gap-2">
              <span className="flex-1">
                <Input
                  className={cn(
                    "inline-block h-auto w-16 border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
                    inst.percentage > 0
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={inst.percentage || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0;
                    updateInstallment(inst.id, "percentage", value);
                  }}
                  placeholder="%"
                />
                % ({formatCurrencyDisplay(inst.amount || 0, currency)})
                {" "}
                -{" "}
                <Input
                  className={cn(
                    "inline-block h-auto w-48 border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
                    inst.description
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  value={inst.description || ""}
                  onChange={(e) =>
                    updateInstallment(inst.id, "description", e.target.value)
                  }
                  placeholder="description (optional)"
                />
                {" "}
                - Afati:{" "}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        className={cn(
                          "inline h-auto border-b bg-transparent p-0 font-normal transition-colors hover:bg-transparent",
                          inst.dueDate
                            ? "border-solid border-foreground text-foreground hover:text-foreground"
                            : "border-dashed border-muted text-muted-foreground hover:text-muted-foreground"
                        )}
                        variant="ghost"
                      >
                        {inst.dueDate
                          ? formatDateForContract(inst.dueDate)
                          : "___ / ___ / ___"}
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      className="p-2"
                      initialFocus
                      mode="single"
                      onSelect={(date) =>
                        updateInstallment(inst.id, "dueDate", date)
                      }
                      selected={inst.dueDate}
                    />
                  </PopoverContent>
                </Popover>
                {index === 0 && " parapagim në momentin e nënshkrimit të kontratës"}
                {index === (paymentPlan.installments?.length ?? 0) - 1 &&
                  " pagesë përfundimtare"}
              </span>
              {(paymentPlan.installments?.length ?? 0) > 1 && (
                <Button
                  className="h-auto p-0 text-muted-foreground hover:text-destructive"
                  variant="ghost"
                  onClick={() => removeInstallment(inst.id)}
                  type="button"
                >
                  <Trash className="size-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (structure === "milestones") {
    if (!paymentPlan?.milestones) {
      const initialPlan: PaymentPlan = {
        structure: "milestones",
        milestones: [],
      };
      onPaymentPlanChange?.(initialPlan);
      return null;
    }

    return (
      <>
        <p>
          - Pagesa do të kryhet sipas arritjes së milestone-ave:
          {" "}
          <Button
            className="inline h-auto border-b border-dashed border-foreground bg-transparent p-0 px-1 font-normal text-foreground hover:bg-transparent hover:text-foreground"
            variant="ghost"
            onClick={addMilestone}
            type="button"
          >
            <Plus className="size-3" />
          </Button>
        </p>
        <ul className="ml-6 list-disc space-y-1">
          {paymentPlan.milestones.map((milestone) => (
            <li key={milestone.id} className="flex items-start gap-2">
              <span className="flex-1">
                <strong>
                  <Input
                    className={cn(
                      "inline-block h-auto w-32 border-b bg-transparent p-0 font-bold focus-visible:ring-0 transition-colors",
                      milestone.name
                        ? "border-solid border-foreground"
                        : "border-dashed border-muted text-muted-foreground"
                    )}
                    value={milestone.name || ""}
                    onChange={(e) =>
                      updateMilestone(milestone.id, "name", e.target.value)
                    }
                    placeholder="name"
                  />
                </strong>
                :{" "}
                <Input
                  className={cn(
                    "inline-block h-auto w-16 border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
                    milestone.percentage > 0
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={milestone.percentage || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0;
                    updateMilestone(milestone.id, "percentage", value);
                  }}
                  placeholder="%"
                />
                % ({formatCurrencyDisplay(milestone.amount || 0, currency)}) -{" "}
                <Input
                  className={cn(
                    "inline-block h-auto w-48 border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
                    milestone.description
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  value={milestone.description || ""}
                  onChange={(e) =>
                    updateMilestone(milestone.id, "description", e.target.value)
                  }
                  placeholder="description"
                />
                {" "}
                (Afati:{" "}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        className={cn(
                          "inline h-auto border-b bg-transparent p-0 font-normal transition-colors hover:bg-transparent",
                          milestone.dueDate
                            ? "border-solid border-foreground text-foreground hover:text-foreground"
                            : "border-dashed border-muted text-muted-foreground hover:text-muted-foreground"
                        )}
                        variant="ghost"
                      >
                        {milestone.dueDate
                          ? formatDateForContract(milestone.dueDate)
                          : "___ / ___ / ___"}
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      className="p-2"
                      initialFocus
                      mode="single"
                      onSelect={(date) =>
                        updateMilestone(milestone.id, "dueDate", date)
                      }
                      selected={milestone.dueDate}
                    />
                  </PopoverContent>
                </Popover>
                )
              </span>
              <Button
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
                variant="ghost"
                onClick={() => removeMilestone(milestone.id)}
                type="button"
              >
                <Trash className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (structure === "custom") {
    if (!paymentPlan?.customPayments) {
      const initialPlan: PaymentPlan = {
        structure: "custom",
        customPayments: [],
      };
      onPaymentPlanChange?.(initialPlan);
      return null;
    }

    return (
      <>
        <p>
          - Pagesat e personalizuara:
          {" "}
          <Button
            className="inline h-auto border-b border-dashed border-foreground bg-transparent p-0 px-1 font-normal text-foreground hover:bg-transparent hover:text-foreground"
            variant="ghost"
            onClick={addCustomPayment}
            type="button"
          >
            <Plus className="size-3" />
          </Button>
        </p>
        <ul className="ml-6 list-disc space-y-1">
          {paymentPlan.customPayments.map((payment) => (
            <li key={payment.id} className="flex items-start gap-2">
              <span className="flex-1">
                <Input
                  className={cn(
                    "inline-block h-auto w-32 border-b bg-transparent p-0 text-center font-medium focus-visible:ring-0 transition-colors",
                    payment.amount > 0
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  type="number"
                  min="0"
                  step="0.01"
                  value={payment.amount || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value) || 0;
                    updateCustomPayment(payment.id, "amount", value);
                  }}
                  placeholder="amount"
                />{" "}
                ({formatCurrencyDisplay(payment.amount || 0, currency)}) -{" "}
                <Input
                  className={cn(
                    "inline-block h-auto w-48 border-b bg-transparent p-0 text-center focus-visible:ring-0 transition-colors",
                    payment.description
                      ? "border-solid border-foreground"
                      : "border-dashed border-muted text-muted-foreground"
                  )}
                  value={payment.description || ""}
                  onChange={(e) =>
                    updateCustomPayment(payment.id, "description", e.target.value)
                  }
                  placeholder="description"
                />
                {" "}
                (Afati:{" "}
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        className={cn(
                          "inline h-auto border-b bg-transparent p-0 font-normal transition-colors hover:bg-transparent",
                          payment.dueDate
                            ? "border-solid border-foreground text-foreground hover:text-foreground"
                            : "border-dashed border-muted text-muted-foreground hover:text-muted-foreground"
                        )}
                        variant="ghost"
                      >
                        {payment.dueDate
                          ? formatDateForContract(payment.dueDate)
                          : "___ / ___ / ___"}
                      </Button>
                    }
                  />
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      className="p-2"
                      initialFocus
                      mode="single"
                      onSelect={(date) =>
                        updateCustomPayment(payment.id, "dueDate", date)
                      }
                      selected={payment.dueDate}
                    />
                  </PopoverContent>
                </Popover>
                )
              </span>
              <Button
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
                variant="ghost"
                onClick={() => removeCustomPayment(payment.id)}
                type="button"
              >
                <Trash className="size-3" />
              </Button>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return null;
}

