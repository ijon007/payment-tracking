"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { InvoiceTemplate } from "@/lib/invoice-utils";
import { formatCurrency } from "@/lib/payment-utils";

interface TemplatePreviewProps {
  template: Partial<InvoiceTemplate>;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  // Sample data for preview
  const sampleClient = {
    name: "John Doe",
    email: "john@example.com",
  };

  const sampleItems = [
    {
      description: "Sample Service Item",
      quantity: 1,
      rate: 1000,
      amount: 1000,
    },
    {
      description: "Another Service",
      quantity: 2,
      rate: 500,
      amount: 1000,
    },
  ];

  const subtotal = sampleItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = 0;
  const total = subtotal + tax;

  // Don't show preview if required fields are missing
  if (!(template.companyName && template.companyEmail)) {
    return (
      <Card className="bg-card">
        <CardContent className="p-8">
          <div className="py-12 text-center text-muted-foreground">
            <p>Fill in the required fields to see a preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {template.logoUrl && (
                <img
                  alt={template.companyName}
                  className="mb-4 h-12"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  src={template.logoUrl}
                />
              )}
              <h2 className="font-bold text-2xl">{template.companyName}</h2>
              <div className="mt-2 space-y-1 text-muted-foreground text-sm">
                {template.companyAddress && <p>{template.companyAddress}</p>}
                <p>{template.companyEmail}</p>
                {template.companyPhone && <p>{template.companyPhone}</p>}
              </div>
            </div>
            <div className="text-right">
              <h1 className="mb-2 font-bold text-3xl">INVOICE</h1>
              <p className="text-muted-foreground text-sm">
                Invoice #: INV-2024-001
              </p>
              <p className="text-muted-foreground text-sm">
                Issue Date: {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-2 font-semibold">Bill To:</h3>
              <p className="font-medium">{sampleClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-semibold">Due Date:</h3>
              <p>
                {format(
                  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  "MMM dd, yyyy"
                )}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sampleItems.map((item, index) => (
                  <tr className="border-b" key={index}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          {template.notes && (
            <div className="border-t pt-4">
              <p className="whitespace-pre-line text-muted-foreground text-sm">
                {template.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
