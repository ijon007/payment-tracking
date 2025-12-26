"use client";

import { Calendar as CalendarIcon, Download } from "@phosphor-icons/react";
import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePaymentStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ContractPDF } from "./contract-pdf";
import { ContractPreview } from "./contract-preview";

interface ContractGeneratorProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  } = usePaymentStore();

  const client = getClient(clientId);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [projectCost, setProjectCost] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [projectDuration, setProjectDuration] = useState<string>("");
  const [maintenanceCost, setMaintenanceCost] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [companyRepresentatives, setCompanyRepresentatives] = useState<string>(
    "Johan Gjinko dhe Ijon Kushta"
  );
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (open && contractTemplates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(contractTemplates[0].id);
    }
  }, [open, contractTemplates, selectedTemplateId]);

  useEffect(() => {
    if (!startDate) {
      setStartDate(new Date());
    }
  }, [startDate]);

  useEffect(() => {
    if (!endDate && startDate) {
      const defaultEndDate = new Date(startDate);
      defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
      setEndDate(defaultEndDate);
    }
  }, [endDate, startDate]);

  const handleGenerate = () => {
    if (!(selectedTemplateId && startDate && endDate && client)) {
      return;
    }

    const template = getContractTemplate(selectedTemplateId);
    if (!template) {
      return;
    }

    // Calculate project duration in days
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const durationText =
      durationDays < 30
        ? `${durationDays} ditë`
        : durationDays < 365
          ? `${Math.round(durationDays / 30)} muaj`
          : `${Math.round(durationDays / 365)} vite`;

    const contract = generateContract({
      templateId: selectedTemplateId,
      clientId,
      startDate,
      endDate,
      terms: template.terms,
      projectCost: projectCost
        ? Number.parseFloat(projectCost.replace(/,/g, ""))
        : undefined,
      paymentMethod: paymentMethod || undefined,
      projectDuration: projectDuration || durationText,
      maintenanceCost: maintenanceCost
        ? Number.parseFloat(maintenanceCost.replace(/,/g, ""))
        : undefined,
      clientAddress: clientAddress || undefined,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      companyRepresentatives: companyRepresentatives || undefined,
    });

    setGeneratedContractId(contract.id);
  };

  const handleClose = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setProjectCost("");
    setPaymentMethod("");
    setProjectDuration("");
    setMaintenanceCost("");
    setClientAddress("");
    setClientEmail("");
    setClientPhone("");
    setCompanyRepresentatives("Johan Gjinko dhe Ijon Kushta");
    setGeneratedContractId(null);
    onOpenChange(false);
  };

  const handleDownloadPDF = async () => {
    if (!(generatedContractId && client)) {
      return;
    }

    const contract = getContract(generatedContractId);
    if (!contract) {
      return;
    }

    const template = getContractTemplate(contract.templateId);
    if (!template) {
      return;
    }

    try {
      const blob = await pdf(
        <ContractPDF client={client} contract={contract} template={template} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.contractNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  if (!client) {
    return null;
  }

  const selectedTemplate = selectedTemplateId
    ? getContractTemplate(selectedTemplateId)
    : null;

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="scrollbar-hide max-h-[90vh] w-2/5 gap-5 overflow-y-auto">
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
              <Button onClick={handleDownloadPDF} variant="outline">
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
                  <Label className="text-xs" htmlFor="template">
                    Contract Template
                  </Label>
                  <Select
                    onValueChange={setSelectedTemplateId}
                    value={selectedTemplateId}
                  >
                    <SelectTrigger
                      className="w-full border-border"
                      id="template"
                    >
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
                    <p className="text-muted-foreground text-xs">
                      No templates available. Create one in the Contracts page.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">Start Date</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          className={cn(
                            "w-full justify-start text-left font-normal hover:bg-white/10 hover:text-white",
                            !startDate && "text-muted-foreground"
                          )}
                          variant="outline"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      }
                    />
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        className="p-2 [--cell-size:2.5rem]"
                        initialFocus
                        mode="single"
                        onSelect={setStartDate}
                        selected={startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs">End Date</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          className={cn(
                            "w-full justify-start text-left font-normal hover:bg-white/10 hover:text-white",
                            !endDate && "text-muted-foreground"
                          )}
                          variant="outline"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? (
                            format(endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      }
                    />
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        className="p-2 [--cell-size:2.5rem]"
                        disabled={(date) =>
                          startDate ? date < startDate : false
                        }
                        initialFocus
                        mode="single"
                        onSelect={setEndDate}
                        selected={endDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-6 border-white border-t pt-4">
                <h3 className="font-semibold text-sm">Contract Details</h3>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="projectCost">
                    Project Cost (lekë)
                  </Label>
                  <Input
                    id="projectCost"
                    onChange={(e) => setProjectCost(e.target.value)}
                    placeholder="e.g., 500000"
                    type="text"
                    value={projectCost}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="paymentMethod">
                    Payment Method
                  </Label>
                  <Input
                    id="paymentMethod"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g., Transfer bankar, Cash, etj."
                    value={paymentMethod}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="projectDuration">
                    Project Duration
                  </Label>
                  <Input
                    id="projectDuration"
                    onChange={(e) => setProjectDuration(e.target.value)}
                    placeholder="e.g., 30 ditë, 2 muaj (leave empty for auto-calculation)"
                    value={projectDuration}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="maintenanceCost">
                    Maintenance Cost (lekë/muaj)
                  </Label>
                  <Input
                    id="maintenanceCost"
                    onChange={(e) => setMaintenanceCost(e.target.value)}
                    placeholder="e.g., 50000"
                    type="text"
                    value={maintenanceCost}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="companyRepresentatives">
                    Company Representatives
                  </Label>
                  <Input
                    id="companyRepresentatives"
                    onChange={(e) => setCompanyRepresentatives(e.target.value)}
                    placeholder="e.g., Johan Gjinko dhe Ijon Kushta"
                    value={companyRepresentatives}
                  />
                </div>
              </div>

              <div className="space-y-4 border-white border-t pt-4">
                <h3 className="font-semibold text-sm">
                  Client Contact Information
                </h3>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="clientAddress">
                    Client Address
                  </Label>
                  <Textarea
                    id="clientAddress"
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client's address"
                    rows={2}
                    value={clientAddress}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="clientEmail">
                    Client Email
                  </Label>
                  <Input
                    id="clientEmail"
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    type="email"
                    value={clientEmail}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs" htmlFor="clientPhone">
                    Client Phone
                  </Label>
                  <Input
                    id="clientPhone"
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+355..."
                    type="tel"
                    value={clientPhone}
                  />
                </div>
              </div>

              {selectedTemplate && startDate && endDate && (
                <div className="border-white border-t pt-4">
                  <ContractPreview
                    client={client}
                    endDate={endDate}
                    startDate={startDate}
                    template={selectedTemplate}
                    terms={selectedTemplate.terms}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose} type="button" variant="outline">
                Cancel
              </Button>
              <Button
                disabled={!(selectedTemplateId && startDate && endDate)}
                onClick={handleGenerate}
              >
                Generate Contract
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
