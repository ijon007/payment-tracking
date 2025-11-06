"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Client, Payment } from "./payment-utils"
import {
  calculatePaymentPlan,
  calculateClientStatus,
  PAYMENT_PLAN_TEMPLATES,
} from "./payment-utils"

const STORAGE_KEY = "payment-tracker-clients"

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

type PaymentStoreContextType = {
  clients: Client[]
  addClient: (client: Omit<Client, "id" | "status" | "amountPaid" | "amountDue" | "payments"> & { paymentPlanId: string }) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  addPayment: (clientId: string, paymentId: string, paidDate: Date) => void
  getClient: (id: string) => Client | undefined
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

  return (
    <PaymentStoreContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        addPayment,
        getClient,
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

