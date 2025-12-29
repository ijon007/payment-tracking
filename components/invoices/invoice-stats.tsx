"use client";

import { useEffect, useMemo, useState } from "react";
import type { Invoice } from "@/lib/invoice-utils";
import { Currency, formatCurrency } from "@/lib/currency-utils";
import { useSettings } from "@/lib/settings-store";
import { usePaymentStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function calculateInvoiceStats(invoices: Invoice[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sent includes both "sent" and "draft" statuses (drafts are invoices that have been created)
  const sentInvoices = invoices.filter(
    (inv) => inv.status === "sent" || inv.status === "draft"
  );
  const overdueInvoices = invoices.filter((inv) => {
    // Overdue includes sent invoices past due date, or drafts past due date
    if (inv.status !== "sent" && inv.status !== "draft") return false;
    const dueDate = new Date(inv.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  const sentAmount = sentInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Calculate payment score
  // Score is based on paid invoices vs total invoices (excluding drafts)
  const nonDraftInvoices = invoices.filter((inv) => inv.status !== "draft");
  const totalNonDraft = nonDraftInvoices.length;
  const paidCount = paidInvoices.length;

  let paymentScore = 0;
  let scoreLabel = "Poor";
  let scoreDescription = "Some payments need attention";

  if (totalNonDraft > 0) {
    paymentScore = Math.round((paidCount / totalNonDraft) * 100);
    
    if (paymentScore >= 90) {
      scoreLabel = "Excellent";
      scoreDescription = "Outstanding payment performance";
    } else if (paymentScore >= 75) {
      scoreLabel = "Good";
      scoreDescription = "Seamless payments, right on schedule";
    } else if (paymentScore >= 50) {
      scoreLabel = "Fair";
      scoreDescription = "Some payments need attention";
    } else {
      scoreLabel = "Poor";
      scoreDescription = "Multiple payments require follow-up";
    }
  } else {
    scoreLabel = "N/A";
    scoreDescription = "No invoices to calculate score";
  }

  return {
    sent: {
      amount: sentAmount,
      count: sentInvoices.length,
    },
    overdue: {
      amount: overdueAmount,
      count: overdueInvoices.length,
    },
    paid: {
      amount: paidAmount,
      count: paidInvoices.length,
    },
    paymentScore: {
      score: paymentScore,
      label: scoreLabel,
      description: scoreDescription,
    },
  };
}

interface StatCardProps {
  title: string;
  amount: number;
  count: number;
  currency: string;
  className?: string;
}

function StatCard({ title, amount, count, currency, className }: StatCardProps) {
  return (
    <Card className={cn("py-3", className)}>
      <CardContent className="px-4 py-0">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-2xl">
            {formatCurrency(amount, currency as Currency)}
          </div>
          <div className="text-sm font-medium">
            {title}
          </div>
          <div className="text-muted-foreground text-xs">
            {count} {count === 1 ? "invoice" : "invoices"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface PaymentScoreCardProps {
  label: string;
  score: number;
  description: string;
  className?: string;
}

function PaymentScoreCard({
  label,
  score,
  description,
  className,
}: PaymentScoreCardProps) {
  // Calculate the number of filled segments (out of 12)
  const segments = 12;
  const filledSegments = Math.round((score / 100) * segments);

  return (
    <Card className={cn("py-3", className)}>
      <CardContent className="px-4 py-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="font-bold text-2xl">{label}</div>
            <div className="mt-1 text-sm font-normal">Payment score</div>
            <div className="mt-0.5 text-muted-foreground text-xs">{description}</div>
          </div>
          <div className="flex gap-1 pt-1">
            {Array.from({ length: segments }).map((_, index) => {
              const isFilled = index < filledSegments;
              return (
                <div
                  key={index}
                  className={cn(
                    "h-8 w-1 rounded-sm transition-colors",
                    isFilled
                      ? index < filledSegments - 2
                        ? "bg-green-500"
                        : "bg-green-600"
                      : "bg-muted"
                  )}
                />
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InvoiceStats() {
  const { invoices } = usePaymentStore();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    return calculateInvoiceStats(invoices);
  }, [invoices]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sent"
          amount={0}
          count={0}
          currency={settings.baseCurrency}
        />
        <StatCard
          title="Overdue"
          amount={0}
          count={0}
          currency={settings.baseCurrency}
        />
        <StatCard
          title="Paid"
          amount={0}
          count={0}
          currency={settings.baseCurrency}
        />
        <PaymentScoreCard
          label="N/A"
          score={0}
          description="Loading..."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Sent"
        amount={stats.sent.amount}
        count={stats.sent.count}
        currency={settings.baseCurrency}
      />
      <StatCard
        title="Overdue"
        amount={stats.overdue.amount}
        count={stats.overdue.count}
        currency={settings.baseCurrency}
      />
      <StatCard
        title="Paid"
        amount={stats.paid.amount}
        count={stats.paid.count}
        currency={settings.baseCurrency}
      />
      <PaymentScoreCard
        label={stats.paymentScore.label}
        score={stats.paymentScore.score}
        description={stats.paymentScore.description}
      />
    </div>
  );
}

