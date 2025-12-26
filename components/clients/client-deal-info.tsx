"use client";

import {
  ArrowSquareOut,
  CaretDown,
  FloppyDisk,
  PencilSimple,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CURRENCIES,
  type Currency,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
  useCurrencyConversion,
} from "@/lib/currency-utils";
import type { Client } from "@/lib/payment-utils";
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ClientDealInfoProps {
  client: Client;
  onCurrencyChange?: (currency: Currency) => void;
}

export function ClientDealInfo({
  client,
  onCurrencyChange,
}: ClientDealInfoProps) {
  const { updateClient } = usePaymentStore();
  const { loading } = useCurrencyConversion();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: client.serviceType || "",
    retainerDetails: client.retainerDetails || "",
    initialRequests: client.initialRequests || "",
  });
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (client.currency as Currency) || "USD"
  );
  const [convertedPrice, setConvertedPrice] = useState<number>(
    client.agreedPrice
  );

  const paymentPlan = PAYMENT_PLAN_TEMPLATES.find(
    (p) => p.id === client.paymentPlanId
  );

  useEffect(() => {
    const convert = async () => {
      // All amounts are stored in USD (base currency)
      // Convert from USD to selected display currency
      if (selectedCurrency !== "USD") {
        const converted = await convertCurrency(
          client.agreedPrice,
          "USD",
          selectedCurrency
        );
        setConvertedPrice(converted);
      } else {
        setConvertedPrice(client.agreedPrice);
      }
    };
    convert();
  }, [selectedCurrency, client.agreedPrice]);

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    updateClient(client.id, { currency });
    onCurrencyChange?.(currency);
  };

  const selectedCurrencyData = CURRENCIES.find(
    (c) => c.code === selectedCurrency
  );

  const handleSave = () => {
    updateClient(client.id, {
      serviceType: formData.serviceType || undefined,
      retainerDetails: formData.retainerDetails || undefined,
      initialRequests: formData.initialRequests || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      serviceType: client.serviceType || "",
      retainerDetails: client.retainerDetails || "",
      initialRequests: client.initialRequests || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>
              Service details and project information
            </CardDescription>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleCancel} size="sm" variant="outline">
                <X weight="bold" className="size-3" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" variant="default">
                <FloppyDisk weight="fill" className="size-3" />
                Save
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
            >
              <PencilSimple weight="fill" className="size-3" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Information Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-wider">
              Service Information
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                {isEditing ? (
                  <Input
                    id="serviceType"
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    placeholder="e.g., Web Development, Design, Consulting"
                    value={formData.serviceType}
                  />
                ) : (
                  <p className="text-sm">{client.serviceType || "—"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="retainerDetails">Retainer Details</Label>
                {isEditing ? (
                  <Textarea
                    id="retainerDetails"
                    onChange={(e) =>
                      setFormData({ ...formData, retainerDetails: e.target.value })
                    }
                    placeholder="Retainer payment details and terms"
                    rows={3}
                    value={formData.retainerDetails}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">
                    {client.retainerDetails || "—"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialRequests">Initial Client Requests</Label>
                {isEditing ? (
                  <Textarea
                    id="initialRequests"
                    onChange={(e) =>
                      setFormData({ ...formData, initialRequests: e.target.value })
                    }
                    placeholder="Initial project requirements and client requests"
                    rows={4}
                    value={formData.initialRequests}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm">
                    {client.initialRequests || "—"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-wider">
            Payment Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Plan</Label>
              <p className="font-medium text-sm">{paymentPlan?.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <Label>Display Currency</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button className="w-full justify-between" variant="outline">
                      {selectedCurrencyData ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {selectedCurrencyData.symbol}
                          </span>
                          <span>{selectedCurrencyData.name}</span>
                          <span className="text-muted-foreground">
                            ({selectedCurrencyData.code})
                          </span>
                        </div>
                      ) : (
                        "Select currency"
                      )}
                      <CaretDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-full">
                  {CURRENCIES.map((currency) => (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code as Currency)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.symbol}</span>
                        <span>{currency.name}</span>
                        <span className="text-muted-foreground">
                          ({currency.code})
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Label>Agreed Price</Label>
                <p className="text-muted-foreground text-sm">
                  Loading exchange rates...
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Agreed Price</Label>
                <div className="flex items-center justify-start gap-2">
                  <span className="font-medium text-sm">
                    Price:{" "}
                    {formatCurrencyUtil(convertedPrice, selectedCurrency)}
                  </span>
                </div>
                {selectedCurrency !== "USD" && (
                  <p className="text-muted-foreground text-xs">
                    Converted from {formatCurrencyUtil(client.agreedPrice, "USD")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Information Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-wider">
            Project Information
          </h3>
          <div className="space-y-2">
            <Label>Notion Project Page</Label>
            <a
              className="flex items-center gap-2 text-primary text-sm hover:underline"
              href={client.notionPageLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              {client.notionPageLink}
              <ArrowSquareOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
