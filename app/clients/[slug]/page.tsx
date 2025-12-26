"use client";

import {
  ArrowLeft,
  Envelope,
  FileText,
  Signature,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientContracts } from "@/components/clients/client-contracts";
import { ClientCurrencySelector } from "@/components/clients/client-currency-selector";
import { ClientDealInfo } from "@/components/clients/client-deal-info";
import { ClientGeneralInfo } from "@/components/clients/client-general-info";
import { ClientInvoices } from "@/components/clients/client-invoices";
import { ClientNavbar } from "@/components/clients/client-navbar";
import { ContractGenerator } from "@/components/contracts/contract-generator";
import { EmailDialog } from "@/components/email/email-dialog";
import { InvoiceGenerator } from "@/components/invoice/invoice-generator";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Currency } from "@/lib/currency-utils";
import { usePaymentStore } from "@/lib/store";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getClient } = usePaymentStore();
  const [mounted, setMounted] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>("USD");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clientId = params.slug as string;
  const client = mounted ? getClient(clientId) : undefined;

  useEffect(() => {
    if (mounted && client) {
      setDisplayCurrency((client.currency as Currency) || "USD");
    }
  }, [mounted, client]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-bold text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Button onClick={() => router.back()} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="py-12 text-center">
          <h2 className="mb-2 font-bold text-2xl">Client Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/clients")}>Go to Clients</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-50 w-full bg-background">
        <div className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center justify-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="font-semibold">{client.name}</h1>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between border-b">
          <ClientNavbar />
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() => setEmailDialogOpen(true)}
                    size="icon"
                    variant="default"
                  >
                    <Envelope className="h-4 w-4" weight="fill" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>Email</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    className="bg-green-900 text-white hover:bg-green-900/90"
                    onClick={() => setInvoiceDialogOpen(true)}
                    size="icon"
                    variant="secondary"
                  >
                    <FileText className="h-4 w-4" weight="fill" />
                  </Button>
                }
              />
              <TooltipContent side="bottom">
                <p>Send Invoice</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() => setContractDialogOpen(true)}
                    size="icon"
                    variant="secondary"
                  >
                    <Signature className="h-4 w-4" weight="fill" />
                  </Button>
                }
              />
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
          onOpenChange={setEmailDialogOpen}
          open={emailDialogOpen}
        />
      )}

      {invoiceDialogOpen && (
        <InvoiceGenerator
          clientId={clientId}
          onOpenChange={setInvoiceDialogOpen}
          open={invoiceDialogOpen}
        />
      )}

      {contractDialogOpen && (
        <ContractGenerator
          clientId={clientId}
          onOpenChange={setContractDialogOpen}
          open={contractDialogOpen}
        />
      )}
    </div>
  );
}
