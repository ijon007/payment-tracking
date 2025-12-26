"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePaymentStore } from "@/lib/store"
import { ContractPreview } from "./contract-preview"
import { ContractPDF } from "./contract-pdf"
import { format } from "date-fns"
import { pdf } from "@react-pdf/renderer"
import { Download, Calendar as CalendarIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ContractGeneratorProps {
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContractGenerator({
  clientId,
  open,
  onOpenChange,
}: ContractGeneratorProps) {
  const {
    getClient,
    contractTemplates,
    generateContract,
    getContractTemplate,
    getContract,
  } = usePaymentStore()

  const client = getClient(clientId)

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [projectCost, setProjectCost] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [projectDuration, setProjectDuration] = useState<string>("")
  const [maintenanceCost, setMaintenanceCost] = useState<string>("")
  const [clientAddress, setClientAddress] = useState<string>("")
  const [clientEmail, setClientEmail] = useState<string>("")
  const [clientPhone, setClientPhone] = useState<string>("")
  const [companyRepresentatives, setCompanyRepresentatives] = useState<string>("Johan Gjinko dhe Ijon Kushta")
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (open && contractTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(contractTemplates[0].id)
    }
  }, [open, contractTemplates, selectedTemplateId])

  useEffect(() => {
    if (!startDate) {
      setStartDate(new Date())
    }
  }, [startDate])

  useEffect(() => {
    if (!endDate && startDate) {
      const defaultEndDate = new Date(startDate)
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1)
      setEndDate(defaultEndDate)
    }
  }, [endDate, startDate])

  const handleGenerate = () => {
    if (!selectedTemplateId || !startDate || !endDate || !client) {
      return
    }

    const template = getContractTemplate(selectedTemplateId)
    if (!template) {
      return
    }

    // Calculate project duration in days
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const durationText = durationDays < 30 
      ? `${durationDays} ditë` 
      : durationDays < 365 
        ? `${Math.round(durationDays / 30)} muaj`
        : `${Math.round(durationDays / 365)} vite`

    const contract = generateContract({
      templateId: selectedTemplateId,
      clientId,
      startDate,
      endDate,
      terms: template.terms,
      projectCost: projectCost ? parseFloat(projectCost.replace(/,/g, "")) : undefined,
      paymentMethod: paymentMethod || undefined,
      projectDuration: projectDuration || durationText,
      maintenanceCost: maintenanceCost ? parseFloat(maintenanceCost.replace(/,/g, "")) : undefined,
      clientAddress: clientAddress || undefined,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      companyRepresentatives: companyRepresentatives || undefined,
    })

    setGeneratedContractId(contract.id)
  }

  const handleClose = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setProjectCost("")
    setPaymentMethod("")
    setProjectDuration("")
    setMaintenanceCost("")
    setClientAddress("")
    setClientEmail("")
    setClientPhone("")
    setCompanyRepresentatives("Johan Gjinko dhe Ijon Kushta")
    setGeneratedContractId(null)
    onOpenChange(false)
  }

  const handleDownloadPDF = async () => {
    if (!generatedContractId || !client) {
      return
    }

    const contract = getContract(generatedContractId)
    if (!contract) {
      return
    }

    const template = getContractTemplate(contract.templateId)
    if (!template) {
      return
    }

    try {
      const blob = await pdf(
        <ContractPDF contract={contract} template={template} client={client} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${contract.contractNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    }
  }

  if (!client) {
    return null
  }

  const selectedTemplate = selectedTemplateId
    ? getContractTemplate(selectedTemplateId)
    : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-2/5 max-h-[90vh] overflow-y-auto gap-5 scrollbar-hide">
        <DialogHeader className="mb-3">
          <DialogTitle>Generate Contract for {client.name}</DialogTitle>
          <DialogDescription className="sr-only">
            Select a template and set contract dates.
          </DialogDescription>
        </DialogHeader>

        {generatedContractId ? (
          <div className="space-y-4">
            <ContractPreview contractId={generatedContractId} />
            <DialogFooter>
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-10">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="template" className="text-xs">Contract Template</Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                  >
                    <SelectTrigger id="template" className="border-border w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {contractTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contractTemplates.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No templates available. Create one in the Contracts page.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">Start Date</Label>
                  <Popover>
                    <PopoverTrigger render={<Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal hover:bg-white/10 hover:text-white",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>} />
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="[--cell-size:2.5rem] p-2"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">End Date</Label>
                  <Popover>
                    <PopoverTrigger render={<Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal hover:bg-white/10 hover:text-white",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>} />
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="[--cell-size:2.5rem] p-2"
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="border-t border-white pt-4 space-y-6">
                <h3 className="font-semibold text-sm">Contract Details</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="projectCost" className="text-xs">Project Cost (lekë)</Label>
                  <Input
                    id="projectCost"
                    type="text"
                    value={projectCost}
                    onChange={(e) => setProjectCost(e.target.value)}
                    placeholder="e.g., 500000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod" className="text-xs">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g., Transfer bankar, Cash, etj."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="projectDuration" className="text-xs">Project Duration</Label>
                  <Input
                    id="projectDuration"
                    value={projectDuration}
                    onChange={(e) => setProjectDuration(e.target.value)}
                    placeholder="e.g., 30 ditë, 2 muaj (leave empty for auto-calculation)"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="maintenanceCost" className="text-xs">Maintenance Cost (lekë/muaj)</Label>
                  <Input
                    id="maintenanceCost"
                    type="text"
                    value={maintenanceCost}
                    onChange={(e) => setMaintenanceCost(e.target.value)}
                    placeholder="e.g., 50000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="companyRepresentatives" className="text-xs">Company Representatives</Label>
                  <Input
                    id="companyRepresentatives"
                    value={companyRepresentatives}
                    onChange={(e) => setCompanyRepresentatives(e.target.value)}
                    placeholder="e.g., Johan Gjinko dhe Ijon Kushta"
                  />
                </div>
              </div>

              <div className="border-t border-white pt-4 space-y-4">
                <h3 className="font-semibold text-sm">Client Contact Information</h3>
                
                <div className="grid gap-2">
                  <Label htmlFor="clientAddress" className="text-xs">Client Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client's address"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientEmail" className="text-xs">Client Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clientPhone" className="text-xs">Client Phone</Label>
                  <Input
                    id="clientPhone"
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+355..."
                  />
                </div>
              </div>

              {selectedTemplate && startDate && endDate && (
                <div className="border-t border-white pt-4">
                  <ContractPreview
                    template={selectedTemplate}
                    client={client}
                    startDate={startDate}
                    endDate={endDate}
                    terms={selectedTemplate.terms}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={
                  !selectedTemplateId ||
                  !startDate ||
                  !endDate
                }
              >
                Generate Contract
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

