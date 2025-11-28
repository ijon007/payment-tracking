"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Client, Payment } from "./payment-utils"
import type { InvoiceTemplate, Invoice } from "./invoice-utils"
import {
  calculatePaymentPlan,
  calculateClientStatus,
  PAYMENT_PLAN_TEMPLATES,
} from "./payment-utils"
import { generateInvoiceNumber, calculateInvoiceTotals } from "./invoice-utils"

const STORAGE_KEY = "payment-tracker-clients"
const INVOICE_TEMPLATES_STORAGE_KEY = "payment-tracker-invoice-templates"
const INVOICES_STORAGE_KEY = "payment-tracker-invoices"

// Helper to serialize/deserialize dates
function serializeClients(clients: Client[]): string {
  return JSON.stringify(clients, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

function deserializeClients(json: string): Client[] {
  const parsed = JSON.parse(json)
  return parsed.map((client: any) => ({
    ...client,
    payments: client.payments.map((payment: any) => ({
      ...payment,
      dueDate: new Date(payment.dueDate),
      paidDate: payment.paidDate ? new Date(payment.paidDate) : null,
    })),
  }))
}

// Helper to serialize/deserialize invoice templates
function serializeInvoiceTemplates(templates: InvoiceTemplate[]): string {
  return JSON.stringify(templates, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

function deserializeInvoiceTemplates(json: string): InvoiceTemplate[] {
  const parsed = JSON.parse(json)
  return parsed.map((template: any) => ({
    ...template,
    createdAt: new Date(template.createdAt),
    updatedAt: new Date(template.updatedAt),
  }))
}

// Helper to serialize/deserialize invoices
function serializeInvoices(invoices: Invoice[]): string {
  return JSON.stringify(invoices, (key, value) => {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() }
    }
    return value
  })
}

function deserializeInvoices(json: string): Invoice[] {
  const parsed = JSON.parse(json)
  return parsed.map((invoice: any) => ({
    ...invoice,
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
  }))
}

type PaymentStoreContextType = {
  clients: Client[]
  addClient: (client: Omit<Client, "id" | "status" | "amountPaid" | "amountDue" | "payments"> & { paymentPlanId: string }) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  addPayment: (clientId: string, paymentId: string, paidDate: Date) => void
  getClient: (id: string) => Client | undefined
  invoiceTemplates: InvoiceTemplate[]
  invoices: Invoice[]
  addInvoiceTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "updatedAt">) => void
  updateInvoiceTemplate: (id: string, updates: Partial<InvoiceTemplate>) => void
  deleteInvoiceTemplate: (id: string) => void
  getInvoiceTemplate: (id: string) => InvoiceTemplate | undefined
  generateInvoice: (data: {
    templateId: string
    clientId: string
    items: Invoice["items"]
    dueDate: Date
    tax?: number
  }) => Invoice
  getInvoice: (id: string) => Invoice | undefined
}

const PaymentStoreContext = createContext<PaymentStoreContextType | undefined>(
  undefined
)

export function PaymentStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Load clients from localStorage on mount
  const [clients, setClients] = useState<Client[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return deserializeClients(stored)
      }
    } catch (error) {
      console.error("Failed to load clients from localStorage:", error)
    }
    return []
  })

  // Load invoice templates from localStorage on mount
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(INVOICE_TEMPLATES_STORAGE_KEY)
      if (stored) {
        return deserializeInvoiceTemplates(stored)
      }
    } catch (error) {
      console.error("Failed to load invoice templates from localStorage:", error)
    }
    return []
  })

  // Load invoices from localStorage on mount
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(INVOICES_STORAGE_KEY)
      if (stored) {
        return deserializeInvoices(stored)
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage:", error)
    }
    return []
  })

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, serializeClients(clients))
      } catch (error) {
        console.error("Failed to save clients to localStorage:", error)
      }
    }
  }, [clients])

  // Save invoice templates to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(INVOICE_TEMPLATES_STORAGE_KEY, serializeInvoiceTemplates(invoiceTemplates))
      } catch (error) {
        console.error("Failed to save invoice templates to localStorage:", error)
      }
    }
  }, [invoiceTemplates])

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(INVOICES_STORAGE_KEY, serializeInvoices(invoices))
      } catch (error) {
        console.error("Failed to save invoices to localStorage:", error)
      }
    }
  }, [invoices])

  const addClient = useCallback(
    (
      clientData: Omit<
        Client,
        "id" | "status" | "amountPaid" | "amountDue" | "payments"
      > & { paymentPlanId: string }
    ) => {
      const template = PAYMENT_PLAN_TEMPLATES.find(
        (t) => t.id === clientData.paymentPlanId
      )

      if (!template) {
        throw new Error("Payment plan template not found")
      }

      // Generate client ID first
      const clientId = `client-${Date.now()}`

      // Generate payment installments
      const paymentData = calculatePaymentPlan(
        clientData.agreedPrice,
        template
      )

      // Create payment objects with IDs
      const payments: Payment[] = paymentData.map((p, index) => ({
        ...p,
        id: `payment-${clientId}-${index}`,
        clientId,
        paidDate: null,
      }))

      // Calculate initial amounts
      const amountPaid = 0
      const amountDue = clientData.agreedPrice

      // Create client
      const client: Client = {
        ...clientData,
        id: clientId,
        amountPaid,
        amountDue,
        status: "pending",
        payments,
      }

      // Recalculate status
      client.status = calculateClientStatus(client)

      setClients((prev) => [...prev, client])
    },
    []
  )

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === id) {
          const updated = { ...client, ...updates }
          // Recalculate status and amounts
          updated.status = calculateClientStatus(updated)
          updated.amountPaid = updated.payments
            .filter((p) => p.paidDate)
            .reduce((sum, p) => sum + p.amount, 0)
          updated.amountDue = updated.agreedPrice - updated.amountPaid
          return updated
        }
        return client
      })
    )
  }, [])

  const addPayment = useCallback(
    (clientId: string, paymentId: string, paidDate: Date) => {
      setClients((prev) =>
        prev.map((client) => {
          if (client.id === clientId) {
            const updatedPayments = client.payments.map((payment) => {
              if (payment.id === paymentId) {
                return { ...payment, paidDate }
              }
              return payment
            })

            const updatedClient = {
              ...client,
              payments: updatedPayments,
            }

            // Recalculate amounts
            updatedClient.amountPaid = updatedPayments
              .filter((p) => p.paidDate)
              .reduce((sum, p) => sum + p.amount, 0)
            updatedClient.amountDue =
              updatedClient.agreedPrice - updatedClient.amountPaid

            // Recalculate status
            updatedClient.status = calculateClientStatus(updatedClient)

            return updatedClient
          }
          return client
        })
      )
    },
    []
  )

  const getClient = useCallback(
    (id: string) => {
      return clients.find((c) => c.id === id)
    },
    [clients]
  )

  const addInvoiceTemplate = useCallback(
    (templateData: Omit<InvoiceTemplate, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date()
      const template: InvoiceTemplate = {
        ...templateData,
        id: `template-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      setInvoiceTemplates((prev) => [...prev, template])
    },
    []
  )

  const updateInvoiceTemplate = useCallback(
    (id: string, updates: Partial<InvoiceTemplate>) => {
      setInvoiceTemplates((prev) =>
        prev.map((template) =>
          template.id === id
            ? { ...template, ...updates, updatedAt: new Date() }
            : template
        )
      )
    },
    []
  )

  const deleteInvoiceTemplate = useCallback((id: string) => {
    setInvoiceTemplates((prev) => prev.filter((template) => template.id !== id))
  }, [])

  const getInvoiceTemplate = useCallback(
    (id: string) => {
      return invoiceTemplates.find((t) => t.id === id)
    },
    [invoiceTemplates]
  )

  const generateInvoice = useCallback(
    (data: {
      templateId: string
      clientId: string
      items: Invoice["items"]
      dueDate: Date
      tax?: number
    }): Invoice => {
      const { subtotal, tax, total } = calculateInvoiceTotals(data.items, data.tax)
      const invoice: Invoice = {
        id: `invoice-${Date.now()}`,
        templateId: data.templateId,
        clientId: data.clientId,
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date(),
        dueDate: data.dueDate,
        items: data.items,
        subtotal,
        tax: data.tax ? tax : undefined,
        total,
        status: "draft",
      }
      setInvoices((prev) => [...prev, invoice])
      return invoice
    },
    []
  )

  const getInvoice = useCallback(
    (id: string) => {
      return invoices.find((i) => i.id === id)
    },
    [invoices]
  )

  return (
    <PaymentStoreContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        addPayment,
        getClient,
        invoiceTemplates,
        invoices,
        addInvoiceTemplate,
        updateInvoiceTemplate,
        deleteInvoiceTemplate,
        getInvoiceTemplate,
        generateInvoice,
        getInvoice,
      }}
    >
      {children}
    </PaymentStoreContext.Provider>
  )
}

export function usePaymentStore() {
  const context = useContext(PaymentStoreContext)
  if (context === undefined) {
    throw new Error("usePaymentStore must be used within PaymentStoreProvider")
  }
  return context
}

