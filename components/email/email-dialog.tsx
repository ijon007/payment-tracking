"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { usePaymentStore } from "@/lib/store"
import { format } from "date-fns"
import { pdf } from "@react-pdf/renderer"
import { InvoicePDF } from "../invoice/invoice-pdf"
import { ContractPDF } from "../contracts/contract-pdf"
import { SimpleTextEditor } from "./simple-text-editor"

interface EmailDialogProps {
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmailDialog({ clientId, open, onOpenChange }: EmailDialogProps) {
  const {
    getClient,
    invoices,
    contracts,
    getInvoiceTemplate,
    getContractTemplate,
  } = usePaymentStore()

  const client = getClient(clientId)

  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([])

  // Filter invoices and contracts for this client
  const clientInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.clientId === clientId),
    [invoices, clientId]
  )

  const clientContracts = useMemo(
    () => contracts.filter((contract) => contract.clientId === clientId),
    [contracts, clientId]
  )

  // Initialize To field with client name when dialog opens
  useEffect(() => {
    if (open && client) {
      setTo(client.name)
      setSubject("")
      setBody("")
      setSelectedInvoiceIds([])
      setSelectedContractIds([])
    }
  }, [open, client])

  const handleClose = () => {
    setTo("")
    setSubject("")
    setBody("")
    setSelectedInvoiceIds([])
    setSelectedContractIds([])
    onOpenChange(false)
  }

  const handleSend = async () => {
    // Generate PDFs for selected attachments
    const attachments: { name: string; blob: Blob }[] = []

    // Generate invoice PDFs
    for (const invoiceId of selectedInvoiceIds) {
      const invoice = clientInvoices.find((i) => i.id === invoiceId)
      if (!invoice || !client) continue

      const template = getInvoiceTemplate(invoice.templateId)
      if (!template) continue

      try {
        const blob = await pdf(
          <InvoicePDF invoice={invoice} template={template} client={client} />
        ).toBlob()
        attachments.push({
          name: `${invoice.invoiceNumber}.pdf`,
          blob,
        })
      } catch (error) {
        console.error(`Failed to generate PDF for invoice ${invoiceId}:`, error)
      }
    }

    // Generate contract PDFs
    for (const contractId of selectedContractIds) {
      const contract = clientContracts.find((c) => c.id === contractId)
      if (!contract || !client) continue

      const template = getContractTemplate(contract.templateId)
      if (!template) continue

      try {
        const blob = await pdf(
          <ContractPDF contract={contract} template={template} client={client} />
        ).toBlob()
        attachments.push({
          name: `${contract.contractNumber}.pdf`,
          blob,
        })
      } catch (error) {
        console.error(`Failed to generate PDF for contract ${contractId}:`, error)
      }
    }

    // Placeholder for email sending functionality
    console.log("Email data:", {
      to,
      subject,
      body,
      attachments: attachments.map((a) => a.name),
    })

    // For now, just close the dialog
    // In the future, this would integrate with an email API
    handleClose()
  }

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleContract = (contractId: string) => {
    setSelectedContractIds((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId]
    )
  }

  if (!client) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto gap-5">
        <DialogHeader>
          <DialogTitle>Send Email to {client.name}</DialogTitle>
          <DialogDescription>
            Compose and send an email with optional attachments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="body">Message</Label>
            <SimpleTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your message here..."
            />
          </div>

          {(clientInvoices.length > 0 || clientContracts.length > 0) && (
            <div className="grid gap-3 border-t pt-4">
              <Label>Attachments</Label>

              {clientInvoices.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Invoices
                  </Label>
                  {clientInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`invoice-${invoice.id}`}
                        checked={selectedInvoiceIds.includes(invoice.id)}
                        onCheckedChange={() => toggleInvoice(invoice.id)}
                      />
                      <label
                        htmlFor={`invoice-${invoice.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          Issued: {format(invoice.issueDate, "MMM dd, yyyy")} • Due:{" "}
                          {format(invoice.dueDate, "MMM dd, yyyy")}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {clientContracts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Contracts
                  </Label>
                  {clientContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`contract-${contract.id}`}
                        checked={selectedContractIds.includes(contract.id)}
                        onCheckedChange={() => toggleContract(contract.id)}
                      />
                      <label
                        htmlFor={`contract-${contract.id}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div className="font-medium">{contract.contractNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          Issued: {format(contract.issueDate, "MMM dd, yyyy")} • Period:{" "}
                          {format(contract.startDate, "MMM dd, yyyy")} -{" "}
                          {format(contract.endDate, "MMM dd, yyyy")}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!to || !subject}>
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

