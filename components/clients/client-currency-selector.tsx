"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCIES,
  type Currency,
  convertCurrency,
  formatCurrency as formatCurrencyUtil,
  useCurrencyConversion,
} from "@/lib/currency-utils";
import type { Client } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";

interface ClientCurrencySelectorProps {
  client: Client;
  onCurrencyChange?: (currency: Currency) => void;
}

export function ClientCurrencySelector({
  client,
  onCurrencyChange,
}: ClientCurrencySelectorProps) {
  const { updateClient } = usePaymentStore();
  const { rates, loading } = useCurrencyConversion();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (client.currency as Currency) || "USD"
  );
  const [convertedPrice, setConvertedPrice] = useState<number>(
    client.agreedPrice
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency</CardTitle>
        <CardDescription>Select currency for displaying prices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="font-medium text-sm">Display Currency</label>
          <Select
            onValueChange={(value) => handleCurrencyChange(value as Currency)}
            value={selectedCurrency}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-muted-foreground">
                      ({currency.code})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <p className="text-muted-foreground text-sm">
            Loading exchange rates...
          </p>
        ) : (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Agreed Price
              </span>
              <span className="font-medium">
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
      </CardContent>
    </Card>
  );
}
