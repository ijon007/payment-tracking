"use client";

import {
  ArrowLeft,
  Envelope,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClientContracts } from "@/components/clients/client-contracts";
import { ClientDealInfo } from "@/components/clients/client-deal-info";
import { ClientGeneralInfo } from "@/components/clients/client-general-info";
import { ClientInvoices } from "@/components/clients/client-invoices";
import { ClientNavbar } from "@/components/clients/client-navbar";
import { EmailDialog } from "@/components/email/email-dialog";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("general-info");
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current?.closest(
      ".custom-scrollbar"
    );
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 0);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [mounted]);

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
            <ArrowLeft weight="bold" className="size-3" />
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="space-y-6">
        <div className="sticky top-0 z-50 -mx-4 w-[calc(100%+2rem)] bg-background px-4">
          <div className="flex items-center justify-between gap-4">
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
                      <Envelope weight="fill" className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  <p>Email</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TabsContent value="general-info" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-">
              <ClientGeneralInfo client={client} />
              <ClientDealInfo
                client={client}
                onCurrencyChange={(currency) => setDisplayCurrency(currency)}
              />
            </div>
          </TabsContent>

          <TabsContent value="contracts" className="mt-6">
            <ClientContracts client={client} displayCurrency={displayCurrency} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            <ClientInvoices client={client} displayCurrency={displayCurrency} />
          </TabsContent>
        </div>
      </div>

      {emailDialogOpen && (
        <EmailDialog
          clientId={clientId}
          onOpenChange={setEmailDialogOpen}
          open={emailDialogOpen}
        />
      )}
    </Tabs>
  );
}
