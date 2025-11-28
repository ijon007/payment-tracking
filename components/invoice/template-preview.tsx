"use client"

import type { InvoiceTemplate } from "@/lib/invoice-utils"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/payment-utils"
import { format } from "date-fns"

interface TemplatePreviewProps {
  template: Partial<InvoiceTemplate>
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  // Sample data for preview
  const sampleClient = {
    name: "John Doe",
    email: "john@example.com",
  }

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
  ]

  const subtotal = sampleItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = 0
  const total = subtotal + tax

  // Don't show preview if required fields are missing
  if (!template.companyName || !template.companyEmail) {
    return (
      <Card className="bg-card">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground py-12">
            <p>Fill in the required fields to see a preview</p>
          </div>
        </CardContent>
      </Card>
    )
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
                  src={template.logoUrl}
                  alt={template.companyName}
                  className="h-12 mb-4"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              )}
              <h2 className="text-2xl font-bold">{template.companyName}</h2>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                {template.companyAddress && (
                  <p>{template.companyAddress}</p>
                )}
                <p>{template.companyEmail}</p>
                {template.companyPhone && (
                  <p>{template.companyPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-sm text-muted-foreground">
                Invoice #: INV-2024-001
              </p>
              <p className="text-sm text-muted-foreground">
                Issue Date: {format(new Date(), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{sampleClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Due Date:</h3>
              <p>{format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-t border-b">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold">Rate</th>
                  <th className="text-right py-3 px-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sampleItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="text-right py-3 px-4">{item.quantity}</td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
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
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          {template.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {template.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

