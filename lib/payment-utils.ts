export type PaymentPlanTemplate = {
  id: string
  name: string
  type: "30/70" | "30/35/35"
  retainerPercent: number
}

export type Payment = {
  id: string
  clientId: string
  amount: number
  dueDate: Date
  paidDate: Date | null
  type: "retainer" | "installment"
  installmentNumber?: number
}

export type Client = {
  id: string
  name: string
  notionPageLink: string
  agreedPrice: number
  amountPaid: number
  amountDue: number
  status: "paid" | "pending" | "overdue"
  paymentPlanId: string | null
  payments: Payment[]
}

// Hardcoded payment plan templates
export const PAYMENT_PLAN_TEMPLATES: PaymentPlanTemplate[] = [
  {
    id: "30-70-retainer",
    name: "30/70 + 10% Retainer",
    type: "30/70",
    retainerPercent: 10,
  },
  {
    id: "30-35-35-retainer",
    name: "30/35/35 + 10% Retainer",
    type: "30/35/35",
    retainerPercent: 10,
  },
]

/**
 * Calculate payment installments based on price and template
 * 30/70: 10% retainer, then 30% and 70% of remaining 90%
 * 30/35/35: 10% retainer, then 30%, 35%, 35% of remaining 90%
 */
export function calculatePaymentPlan(
  price: number,
  template: PaymentPlanTemplate
): Omit<Payment, "id" | "clientId" | "paidDate">[] {
  const retainerAmount = (price * template.retainerPercent) / 100
  const remainingAmount = price - retainerAmount

  const payments: Omit<Payment, "id" | "clientId" | "paidDate">[] = []

  // Add retainer payment (due immediately)
  payments.push({
    amount: retainerAmount,
    dueDate: new Date(),
    type: "retainer",
  })

  // Calculate installments based on template type
  if (template.type === "30/70") {
    const firstInstallment = (remainingAmount * 30) / 100
    const secondInstallment = remainingAmount - firstInstallment

    // First installment due in 30 days
    const firstDueDate = new Date()
    firstDueDate.setDate(firstDueDate.getDate() + 30)
    payments.push({
      amount: firstInstallment,
      dueDate: firstDueDate,
      type: "installment",
      installmentNumber: 1,
    })

    // Second installment due in 60 days
    const secondDueDate = new Date()
    secondDueDate.setDate(secondDueDate.getDate() + 60)
    payments.push({
      amount: secondInstallment,
      dueDate: secondDueDate,
      type: "installment",
      installmentNumber: 2,
    })
  } else if (template.type === "30/35/35") {
    const firstInstallment = (remainingAmount * 30) / 100
    const secondInstallment = (remainingAmount * 35) / 100
    const thirdInstallment = remainingAmount - firstInstallment - secondInstallment

    // First installment due in 30 days
    const firstDueDate = new Date()
    firstDueDate.setDate(firstDueDate.getDate() + 30)
    payments.push({
      amount: firstInstallment,
      dueDate: firstDueDate,
      type: "installment",
      installmentNumber: 1,
    })

    // Second installment due in 60 days
    const secondDueDate = new Date()
    secondDueDate.setDate(secondDueDate.getDate() + 60)
    payments.push({
      amount: secondInstallment,
      dueDate: secondDueDate,
      type: "installment",
      installmentNumber: 2,
    })

    // Third installment due in 90 days
    const thirdDueDate = new Date()
    thirdDueDate.setDate(thirdDueDate.getDate() + 90)
    payments.push({
      amount: thirdInstallment,
      dueDate: thirdDueDate,
      type: "installment",
      installmentNumber: 3,
    })
  }

  return payments
}

/**
 * Calculate client status based on payments
 */
export function calculateClientStatus(client: Client): "paid" | "pending" | "overdue" {
  if (client.amountPaid >= client.agreedPrice) {
    return "paid"
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if any unpaid payments are overdue
  const hasOverdue = client.payments.some(
    (payment) =>
      !payment.paidDate &&
      payment.dueDate < today
  )

  if (hasOverdue) {
    return "overdue"
  }

  return "pending"
}

/**
 * Format number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/**
 * Generate chart data for analytics
 */
export function generateChartData(
  clients: Client[],
  metric: "revenue" | "outstanding" | "due" | "retainers",
  months: number = 6
): { month: string; value: number }[] {
  const data: { month: string; value: number }[] = []
  const today = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

    let value = 0

    switch (metric) {
      case "revenue":
        // Sum of all payments paid in this month
        value = clients.reduce((sum, client) => {
          const monthPayments = client.payments.filter((p) => {
            if (!p.paidDate) return false
            const paidDate = new Date(p.paidDate)
            return (
              paidDate.getMonth() === date.getMonth() &&
              paidDate.getFullYear() === date.getFullYear()
            )
          })
          return sum + monthPayments.reduce((s, p) => s + p.amount, 0)
        }, 0)
        break

      case "outstanding":
        // Outstanding balance at end of this month
        value = clients.reduce((sum, client) => {
          const paidByMonth = client.payments
            .filter((p) => {
              if (!p.paidDate) return false
              const paidDate = new Date(p.paidDate)
              return paidDate <= new Date(date.getFullYear(), date.getMonth() + 1, 0)
            })
            .reduce((s, p) => s + p.amount, 0)
          return sum + Math.max(0, client.agreedPrice - paidByMonth)
        }, 0)
        break

      case "due":
        // Sum of payments due in this month
        value = clients.reduce((sum, client) => {
          const dueInMonth = client.payments.filter((p) => {
            if (p.paidDate) return false
            const dueDate = new Date(p.dueDate)
            return (
              dueDate.getMonth() === date.getMonth() &&
              dueDate.getFullYear() === date.getFullYear()
            )
          })
          return sum + dueInMonth.reduce((s, p) => s + p.amount, 0)
        }, 0)
        break

      case "retainers":
        // Sum of retainer payments received in this month
        value = clients.reduce((sum, client) => {
          const monthRetainers = client.payments.filter((p) => {
            if (!p.paidDate || p.type !== "retainer") return false
            const paidDate = new Date(p.paidDate)
            return (
              paidDate.getMonth() === date.getMonth() &&
              paidDate.getFullYear() === date.getFullYear()
            )
          })
          return sum + monthRetainers.reduce((s, p) => s + p.amount, 0)
        }, 0)
        break
    }

    data.push({ month: monthName, value })
  }

  return data
}

