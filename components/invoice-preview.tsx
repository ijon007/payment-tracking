"use client"

import { usePaymentStore } from "@/lib/store"
import type { InvoiceTemplate, Invoice, InvoiceItem } from "@/lib/invoice-utils"
import type { Client } from "@/lib/payment-utils"
import { formatCurrency } from "@/lib/payment-utils"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

interface InvoicePreviewProps {
  invoiceId?: string
  template?: InvoiceTemplate
  client?: Client
  items?: InvoiceItem[]
  dueDate?: Date
}

export function InvoicePreview({
  invoiceId,
  template,
  client,
  items,
  dueDate,
}: InvoicePreviewProps) {
  const { getInvoice, getInvoiceTemplate, getClient } = usePaymentStore()

  let invoice: Invoice | null = null
  let invoiceTemplate: InvoiceTemplate | null = null
  let invoiceClient: Client | null = null
  let invoiceItems: InvoiceItem[] = []
  let invoiceDueDate: Date | null = null

  if (invoiceId) {
    invoice = getInvoice(invoiceId) || null
    if (invoice) {
      invoiceTemplate = getInvoiceTemplate(invoice.templateId) || null
      invoiceClient = getClient(invoice.clientId) || null
      invoiceItems = invoice.items
      invoiceDueDate = invoice.dueDate
    }
  } else if (template && client && items && dueDate) {
    invoiceTemplate = template
    invoiceClient = client
    invoiceItems = items
    invoiceDueDate = dueDate
  }

  if (!invoiceTemplate || !invoiceClient) {
    return null
  }

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = invoice?.tax || 0
  const total = invoice?.total || subtotal + tax

  return (
    <Card className="bg-card">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {invoiceTemplate.logoUrl && (
                <img
                  src={invoiceTemplate.logoUrl}
                  alt={invoiceTemplate.companyName}
                  className="h-12 mb-4"
                />
              )}
              <h2 className="text-2xl font-bold">{invoiceTemplate.companyName}</h2>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                {invoiceTemplate.companyAddress && (
                  <p>{invoiceTemplate.companyAddress}</p>
                )}
                <p>{invoiceTemplate.companyEmail}</p>
                {invoiceTemplate.companyPhone && (
                  <p>{invoiceTemplate.companyPhone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              {invoice && (
                <p className="text-sm text-muted-foreground">
                  Invoice #: {invoice.invoiceNumber}
                </p>
              )}
              {invoice && (
                <p className="text-sm text-muted-foreground">
                  Issue Date: {format(invoice.issueDate, "MMM dd, yyyy")}
                </p>
              )}
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{invoiceClient.name}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold mb-2">Due Date:</h3>
              <p>{invoiceDueDate ? format(invoiceDueDate, "MMM dd, yyyy") : "N/A"}</p>
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
                {invoiceItems.map((item, index) => (
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
          {invoiceTemplate.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {invoiceTemplate.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

