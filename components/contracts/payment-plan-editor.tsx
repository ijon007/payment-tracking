"use client";

import { Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "@phosphor-icons/react";
import type {
  PaymentPlan,
  PaymentStructure,
  Installment,
  Milestone,
  CustomPayment,
} from "@/lib/contract-utils";
import type { Currency } from "@/lib/currency-utils";
import { formatCurrency } from "@/lib/currency-utils";
import {
  calculatePaymentPlan,
  validatePaymentPlan,
} from "@/lib/contract-settings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface PaymentPlanEditorProps {
  projectCost: number | undefined;
  paymentStructure: PaymentStructure;
  paymentPlan: PaymentPlan | undefined;
  currency: Currency;
  onPaymentPlanChange: (plan: PaymentPlan) => void;
}

export function PaymentPlanEditor({
  projectCost,
  paymentStructure,
  paymentPlan,
  currency,
  onPaymentPlanChange,
}: PaymentPlanEditorProps) {
  const [localPlan, setLocalPlan] = useState<PaymentPlan>(() => {
    if (paymentPlan) {
      return paymentPlan;
    }
    if (paymentStructure === "simple") {
      return { structure: "simple" };
    }
    if (paymentStructure === "installments") {
      return {
        structure: "installments",
        installments: [
          { id: "1", percentage: 30 },
          { id: "2", percentage: 70 },
        ],
      };
    }
    if (paymentStructure === "milestones") {
      return {
        structure: "milestones",
        milestones: [],
      };
    }
    return {
      structure: "custom",
      customPayments: [],
    };
  });

  useEffect(() => {
    if (paymentStructure !== localPlan.structure) {
      // Structure changed, reset plan
      if (paymentStructure === "simple") {
        setLocalPlan({ structure: "simple" });
      } else if (paymentStructure === "installments") {
        setLocalPlan({
          structure: "installments",
          installments: [
            { id: "1", percentage: 30 },
            { id: "2", percentage: 70 },
          ],
        });
      } else if (paymentStructure === "milestones") {
        setLocalPlan({
          structure: "milestones",
          milestones: [],
        });
      } else {
        setLocalPlan({
          structure: "custom",
          customPayments: [],
        });
      }
    }
  }, [paymentStructure, localPlan.structure]);

  useEffect(() => {
    // Recalculate amounts when projectCost changes
    if (projectCost && projectCost > 0) {
      const updated = calculatePaymentPlan(projectCost, localPlan);
      setLocalPlan(updated);
      onPaymentPlanChange(updated);
    } else {
      onPaymentPlanChange(localPlan);
    }
  }, [projectCost]);

  const validation = validatePaymentPlan(localPlan);
  const totalPercentage =
    paymentStructure === "installments" && localPlan.installments
      ? localPlan.installments.reduce((sum, inst) => sum + inst.percentage, 0)
      : paymentStructure === "milestones" && localPlan.milestones
        ? localPlan.milestones.reduce((sum, m) => sum + m.percentage, 0)
        : 0;

  // Installments handlers
  const handleInstallmentChange = (
    id: string,
    field: keyof Installment,
    value: number | string | Date | undefined
  ) => {
    if (!localPlan.installments) return;
    const updated = {
      ...localPlan,
      installments: localPlan.installments.map((inst) =>
        inst.id === id ? { ...inst, [field]: value } : inst
      ),
    };
    const withAmounts = projectCost
      ? calculatePaymentPlan(projectCost, updated)
      : updated;
    setLocalPlan(withAmounts);
    onPaymentPlanChange(withAmounts);
  };

  const addInstallment = () => {
    const newId = Date.now().toString();
    const updated = {
      ...localPlan,
      installments: [
        ...(localPlan.installments || []),
        { id: newId, percentage: 0 },
      ],
    };
    setLocalPlan(updated);
    onPaymentPlanChange(updated);
  };

  const removeInstallment = (id: string) => {
    if (!localPlan.installments) return;
    const updated = {
      ...localPlan,
      installments: localPlan.installments.filter((inst) => inst.id !== id),
    };
    const withAmounts = projectCost
      ? calculatePaymentPlan(projectCost, updated)
      : updated;
    setLocalPlan(withAmounts);
    onPaymentPlanChange(withAmounts);
  };

  // Milestones handlers
  const handleMilestoneChange = (
    id: string,
    field: keyof Milestone,
    value: number | string | Date | undefined
  ) => {
    if (!localPlan.milestones) return;
    const updated = {
      ...localPlan,
      milestones: localPlan.milestones.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      ),
    };
    const withAmounts = projectCost
      ? calculatePaymentPlan(projectCost, updated)
      : updated;
    setLocalPlan(withAmounts);
    onPaymentPlanChange(withAmounts);
  };

  const addMilestone = () => {
    const newId = Date.now().toString();
    const updated = {
      ...localPlan,
      milestones: [
        ...(localPlan.milestones || []),
        { id: newId, name: "", percentage: 0, description: "" },
      ],
    };
    setLocalPlan(updated);
    onPaymentPlanChange(updated);
  };

  const removeMilestone = (id: string) => {
    if (!localPlan.milestones) return;
    const updated = {
      ...localPlan,
      milestones: localPlan.milestones.filter((m) => m.id !== id),
    };
    const withAmounts = projectCost
      ? calculatePaymentPlan(projectCost, updated)
      : updated;
    setLocalPlan(withAmounts);
    onPaymentPlanChange(withAmounts);
  };

  // Custom payments handlers
  const handleCustomPaymentChange = (
    id: string,
    field: keyof CustomPayment,
    value: number | string | Date | undefined
  ) => {
    if (!localPlan.customPayments) return;
    const updated = {
      ...localPlan,
      customPayments: localPlan.customPayments.map((cp) =>
        cp.id === id ? { ...cp, [field]: value } : cp
      ),
    };
    setLocalPlan(updated);
    onPaymentPlanChange(updated);
  };

  const addCustomPayment = () => {
    const newId = Date.now().toString();
    const updated = {
      ...localPlan,
      customPayments: [
        ...(localPlan.customPayments || []),
        { id: newId, amount: 0, description: "" },
      ],
    };
    setLocalPlan(updated);
    onPaymentPlanChange(updated);
  };

  const removeCustomPayment = (id: string) => {
    if (!localPlan.customPayments) return;
    const updated = {
      ...localPlan,
      customPayments: localPlan.customPayments.filter((cp) => cp.id !== id),
    };
    setLocalPlan(updated);
    onPaymentPlanChange(updated);
  };

  if (paymentStructure === "simple") {
    return (
      <div className="space-y-2">
        <Label>Payment Structure</Label>
        <p className="text-sm text-muted-foreground">
          Simple payment structure: 30% upfront, 70% final payment
        </p>
        {projectCost && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Upfront (30%):</span>
              <span className="font-medium">
                {formatCurrency((projectCost * 30) / 100, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Final (70%):</span>
              <span className="font-medium">
                {formatCurrency((projectCost * 70) / 100, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (paymentStructure === "installments") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Installments</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addInstallment}
          >
            <Plus className="size-4" />
            Add Installment
          </Button>
        </div>
        {!validation.valid && (
          <Alert variant="destructive">
            <WarningCircle className="size-4" />
            <AlertDescription>{validation.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          {localPlan.installments?.map((installment, index) => (
            <div
              key={installment.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={installment.percentage || ""}
                      onChange={(e) =>
                        handleInstallmentChange(
                          installment.id,
                          "percentage",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  {projectCost && installment.amount && (
                    <div className="flex-1">
                      <Label className="text-xs">Amount</Label>
                      <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                        {formatCurrency(installment.amount, currency)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !installment.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {installment.dueDate
                            ? format(installment.dueDate, "PPP")
                            : "Due date (optional)"}
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={installment.dueDate}
                        onSelect={(date) =>
                          handleInstallmentChange(
                            installment.id,
                            "dueDate",
                            date
                          )
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {localPlan.installments && localPlan.installments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInstallment(installment.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  )}
                </div>
                {installment.description !== undefined && (
                  <Input
                    placeholder="Description (optional)"
                    value={installment.description || ""}
                    onChange={(e) =>
                      handleInstallmentChange(
                        installment.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        {totalPercentage !== 100 && (
          <p className="text-sm text-muted-foreground">
            Total: {totalPercentage.toFixed(2)}% (must equal 100%)
          </p>
        )}
      </div>
    );
  }

  if (paymentStructure === "milestones") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Milestones</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addMilestone}
          >
            <Plus className="size-4" />
            Add Milestone
          </Button>
        </div>
        {!validation.valid && (
          <Alert variant="destructive">
            <WarningCircle className="size-4" />
            <AlertDescription>{validation.error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          {localPlan.milestones?.map((milestone) => (
            <div
              key={milestone.id}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Milestone Name</Label>
                  <Input
                    value={milestone.name}
                    onChange={(e) =>
                      handleMilestoneChange(milestone.id, "name", e.target.value)
                    }
                    placeholder="e.g., Design Approval"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Percentage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={milestone.percentage || ""}
                    onChange={(e) =>
                      handleMilestoneChange(
                        milestone.id,
                        "percentage",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                {projectCost && milestone.amount && (
                  <div className="w-32">
                    <Label className="text-xs">Amount</Label>
                    <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
                      {formatCurrency(milestone.amount, currency)}
                    </div>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(milestone.id)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Description"
                value={milestone.description}
                onChange={(e) =>
                  handleMilestoneChange(
                    milestone.id,
                    "description",
                    e.target.value
                  )
                }
                rows={2}
              />
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !milestone.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {milestone.dueDate
                        ? format(milestone.dueDate, "PPP")
                        : "Due date (optional)"}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={milestone.dueDate}
                    onSelect={(date) =>
                      handleMilestoneChange(milestone.id, "dueDate", date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </div>
        {totalPercentage !== 100 && localPlan.milestones && localPlan.milestones.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total: {totalPercentage.toFixed(2)}% (must equal 100%)
          </p>
        )}
      </div>
    );
  }

  // Custom payments
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Custom Payments</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addCustomPayment}
        >
          <Plus className="size-4" />
          Add Payment
        </Button>
      </div>
      <div className="space-y-3">
        {localPlan.customPayments?.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col gap-2 rounded-lg border p-3"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={payment.amount || ""}
                  onChange={(e) =>
                    handleCustomPaymentChange(
                      payment.id,
                      "amount",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={payment.description}
                  onChange={(e) =>
                    handleCustomPaymentChange(
                      payment.id,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Payment description"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCustomPayment(payment.id)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !payment.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {payment.dueDate
                      ? format(payment.dueDate, "PPP")
                      : "Due date (optional)"}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={payment.dueDate}
                  onSelect={(date) =>
                    handleCustomPaymentChange(payment.id, "dueDate", date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
      {localPlan.customPayments && localPlan.customPayments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No custom payments added yet. Click "Add Payment" to create one.
        </p>
      )}
    </div>
  );
}

