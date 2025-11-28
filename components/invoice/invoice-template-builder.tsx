"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePaymentStore } from "@/lib/store"
import type { InvoiceTemplate } from "@/lib/invoice-utils"
import { useRouter } from "next/navigation"

interface InvoiceTemplateBuilderProps {
  templateId?: string
  onSave?: () => void
  onChange?: (template: Partial<InvoiceTemplate>) => void
}

export function InvoiceTemplateBuilder({
  templateId,
  onSave,
  onChange,
}: InvoiceTemplateBuilderProps) {
  const router = useRouter()
  const {
    getInvoiceTemplate,
    addInvoiceTemplate,
    updateInvoiceTemplate,
  } = usePaymentStore()

  const existingTemplate = templateId ? getInvoiceTemplate(templateId) : null

  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name)
      setCompanyName(existingTemplate.companyName)
      setCompanyAddress(existingTemplate.companyAddress)
      setCompanyEmail(existingTemplate.companyEmail)
      setCompanyPhone(existingTemplate.companyPhone)
      setLogoUrl(existingTemplate.logoUrl || "")
      setNotes(existingTemplate.notes)
    }
  }, [existingTemplate])

  // Notify parent of changes for live preview
  useEffect(() => {
    if (onChange) {
      onChange({
        name,
        companyName,
        companyAddress,
        companyEmail,
        companyPhone,
        logoUrl: logoUrl || undefined,
        notes,
      })
    }
  }, [name, companyName, companyAddress, companyEmail, companyPhone, logoUrl, notes, onChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !companyName || !companyEmail) {
      return
    }

    const templateData = {
      name,
      companyName,
      companyAddress,
      companyEmail,
      companyPhone,
      logoUrl: logoUrl || undefined,
      notes,
    }

    if (templateId && existingTemplate) {
      updateInvoiceTemplate(templateId, templateData)
    } else {
      addInvoiceTemplate(templateData)
    }

    if (onSave) {
      onSave()
    } else {
      router.push("/invoices")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Default Invoice Template"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your Company Name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyAddress">Company Address</Label>
          <Textarea
            id="companyAddress"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder="123 Street, City, State, ZIP"
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyEmail">Company Email</Label>
          <Input
            id="companyEmail"
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            placeholder="billing@company.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="companyPhone">Company Phone</Label>
          <Input
            id="companyPhone"
            type="tel"
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Footer Notes / Terms</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, notes, or additional information..."
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {existingTemplate ? "Update Template" : "Create Template"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onSave) {
              onSave()
            } else {
              router.push("/invoices")
            }
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

