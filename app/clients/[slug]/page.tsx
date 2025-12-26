"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePaymentStore } from "@/lib/store"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Envelope, FileText,   Signature } from "@phosphor-icons/react"
import { ClientNavbar } from "@/components/clients/client-navbar"
import { ClientGeneralInfo } from "@/components/clients/client-general-info"
import { ClientCurrencySelector } from "@/components/clients/client-currency-selector"
import { ClientContracts } from "@/components/clients/client-contracts"
import { ClientInvoices } from "@/components/clients/client-invoices"
import { ClientDealInfo } from "@/components/clients/client-deal-info"
import { EmailDialog } from "@/components/email/email-dialog"
import { InvoiceGenerator } from "@/components/invoice/invoice-generator"
import { ContractGenerator } from "@/components/contracts/contract-generator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Currency } from "@/lib/currency-utils"

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getClient } = usePaymentStore()
  const [mounted, setMounted] = useState(false)
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD")
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [contractDialogOpen, setContractDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clientId = params.slug as string
  const client = mounted ? getClient(clientId) : undefined

  useEffect(() => {
    if (mounted && client) {
      setDisplayCurrency((client.currency as Currency) || "USD")
    }
  }, [mounted, client])

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/clients")}>Go to Clients</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-50 w-full bg-background">
        <div className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center justify-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-bold">{client.name}</h1>
          </div>
          
        </div>

        <div className="flex flex-row justify-between items-center border-b">
          <ClientNavbar />
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="default"
                  size="icon"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Envelope className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="bottom">
                <p>Email</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="secondary"
                  className="bg-green-900 text-white hover:bg-green-900/90"
                  size="icon"
                  onClick={() => setInvoiceDialogOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="bottom">
                <p>Send Invoice</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setContractDialogOpen(true)}
                >
                  <Signature className="h-4 w-4" />
                </Button>} />
              <TooltipContent side="bottom">
                <p>Generate Contract</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="space-y-6 pb-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ClientGeneralInfo client={client} />
          <ClientCurrencySelector
            client={client}
            onCurrencyChange={(currency) => setDisplayCurrency(currency)}
          />
        </div>

        <ClientContracts client={client} displayCurrency={displayCurrency} />

        <ClientInvoices client={client} displayCurrency={displayCurrency} />

        <ClientDealInfo client={client} />
      </div>

      {emailDialogOpen && (
        <EmailDialog
          clientId={clientId}
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
        />
      )}

      {invoiceDialogOpen && (
        <InvoiceGenerator
          clientId={clientId}
          open={invoiceDialogOpen}
          onOpenChange={setInvoiceDialogOpen}
        />
      )}

      {contractDialogOpen && (
        <ContractGenerator
          clientId={clientId}
          open={contractDialogOpen}
          onOpenChange={setContractDialogOpen}
        />
      )}
    </div>
  )
}

