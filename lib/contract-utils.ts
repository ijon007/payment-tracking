export type ContractTemplate = {
  id: string
  name: string
  companyName: string
  companyAddress: string
  companyEmail: string
  companyPhone: string
  logoUrl?: string
  terms: string
  createdAt: Date
  updatedAt: Date
}

export type Contract = {
  id: string
  templateId: string
  clientId: string
  contractNumber: string
  issueDate: Date
  startDate: Date
  endDate: Date
  terms: string
  // Additional fields for Albanian contract template
  projectCost?: number
  paymentMethod?: string
  projectDuration?: string // e.g., "30 ditë", "2 muaj"
  projectCompletionDate?: Date
  maintenanceCost?: number
  clientAddress?: string
  clientEmail?: string
  clientPhone?: string
  companyRepresentatives?: string // e.g., "Johan Gjinko dhe Ijon Kushta"
  clientSignature?: string
  companySignature?: string
  status: "draft" | "sent" | "signed" | "active" | "expired"
}

/**
 * Generate contract number (e.g., CNT-2024-001)
 */
export function generateContractNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `CNT-${year}-${random}`
}

/**
 * Calculate contract duration in days
 */
export function calculateContractDuration(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

