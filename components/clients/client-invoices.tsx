"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePaymentStore } from "@/lib/store"
import { formatCurrency as formatCurrencyUtil, convertCurrency, type Currency } from "@/lib/currency-utils"
import type { Client } from "@/lib/payment-utils"
import { format } from "date-fns"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface ClientInvoicesProps {
  client: Client
  displayCurrency: Currency
}

export function ClientInvoices({ client, displayCurrency }: ClientInvoicesProps) {
  const { invoices } = usePaymentStore()
  const clientInvoices = invoices.filter((i) => i.clientId === client.id)
  const [convertedTotals, setConvertedTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    const convertTotals = async () => {
      // All amounts are stored in USD (base currency)
      // Convert from USD to display currency
      const converted: Record<string, number> = {}
      for (const invoice of clientInvoices) {
        if (displayCurrency !== "USD") {
          converted[invoice.id] = await convertCurrency(
            invoice.total,
            "USD",
            displayCurrency
          )
        } else {
          converted[invoice.id] = invoice.total
        }
      }
      setConvertedTotals(converted)
    }
    convertTotals()
  }, [clientInvoices, displayCurrency])

  const getStatusBadgeVariant = (
    status: "draft" | "sent" | "paid"
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "draft":
      default:
        return "outline"
    }
  }

  if (clientInvoices.length === 0) {
    return (
      <Card id="invoices">
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>All invoices generated for this client</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No invoices found for this client.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="invoices">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>All invoices generated for this client</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{format(invoice.issueDate, "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(invoice.dueDate, "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {formatCurrencyUtil(
                    convertedTotals[invoice.id] ?? invoice.total,
                    displayCurrency
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(invoice.status)}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/invoices?invoice=${invoice.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

