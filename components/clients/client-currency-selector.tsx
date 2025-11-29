"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePaymentStore } from "@/lib/store"
import { useCurrencyConversion, CURRENCIES, convertCurrency, type Currency } from "@/lib/currency-utils"
import type { Client } from "@/lib/payment-utils"
import { formatCurrency as formatCurrencyUtil } from "@/lib/currency-utils"

interface ClientCurrencySelectorProps {
  client: Client
  onCurrencyChange?: (currency: Currency) => void
}

export function ClientCurrencySelector({
  client,
  onCurrencyChange,
}: ClientCurrencySelectorProps) {
  const { updateClient } = usePaymentStore()
  const { rates, loading } = useCurrencyConversion()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    (client.currency as Currency) || "USD"
  )
  const [convertedPrice, setConvertedPrice] = useState<number>(client.agreedPrice)

  useEffect(() => {
    const convert = async () => {
      // All amounts are stored in USD (base currency)
      // Convert from USD to selected display currency
      if (selectedCurrency !== "USD") {
        const converted = await convertCurrency(
          client.agreedPrice,
          "USD",
          selectedCurrency
        )
        setConvertedPrice(converted)
      } else {
        setConvertedPrice(client.agreedPrice)
      }
    }
    convert()
  }, [selectedCurrency, client.agreedPrice])

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
    updateClient(client.id, { currency })
    onCurrencyChange?.(currency)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency</CardTitle>
        <CardDescription>Select currency for displaying prices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Currency</label>
          <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-muted-foreground">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading exchange rates...</p>
        ) : (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agreed Price</span>
              <span className="font-medium">
                {formatCurrencyUtil(convertedPrice, selectedCurrency)}
              </span>
            </div>
            {selectedCurrency !== "USD" && (
              <p className="text-xs text-muted-foreground">
                Converted from {formatCurrencyUtil(client.agreedPrice, "USD")}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

