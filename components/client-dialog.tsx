"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePaymentStore } from "@/lib/store"
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils"
import { CURRENCIES, type Currency } from "@/lib/currency-utils"
import { cn } from "@/lib/utils"

export function ClientDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [agreedPrice, setAgreedPrice] = useState("")
  const [notionPageLink, setNotionPageLink] = useState("")
  const [paymentPlanId, setPaymentPlanId] = useState<string>("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [retainerDetails, setRetainerDetails] = useState("")
  const [initialRequests, setInitialRequests] = useState("")
  const [currency, setCurrency] = useState<Currency>("USD")
  const { addClient } = usePaymentStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !agreedPrice || !paymentPlanId) {
      return
    }

    const price = parseFloat(agreedPrice)
    if (isNaN(price) || price <= 0) {
      return
    }

    addClient({
      name,
      agreedPrice: price,
      notionPageLink: notionPageLink || `https://notion.so/demo-${Date.now()}`,
      paymentPlanId,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      serviceType: serviceType || undefined,
      retainerDetails: retainerDetails || undefined,
      initialRequests: initialRequests || undefined,
      currency,
    })

    // Reset form
    setName("")
    setAgreedPrice("")
    setNotionPageLink("")
    setPaymentPlanId("")
    setEmail("")
    setPhone("")
    setAddress("")
    setServiceType("")
    setRetainerDetails("")
    setInitialRequests("")
    setCurrency("USD")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add Client</Button>} />
      <DialogContent className="w-1/2 max-h-[90vh] overflow-y-auto gap-5 scrollbar-hide">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="sr-only">
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client and assign a payment plan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Agreed Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notion">Notion Page Link</Label>
              <Input
                id="notion"
                type="url"
                value={notionPageLink}
                onChange={(e) => setNotionPageLink(e.target.value)}
                placeholder="https://notion.so/..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Country"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g., Web Development, Design, Consulting"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="retainerDetails">Retainer Details</Label>
              <Textarea
                id="retainerDetails"
                value={retainerDetails}
                onChange={(e) => setRetainerDetails(e.target.value)}
                placeholder="Retainer payment details and terms"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialRequests">Initial Client Requests</Label>
              <Textarea
                id="initialRequests"
                value={initialRequests}
                onChange={(e) => setInitialRequests(e.target.value)}
                placeholder="Initial project requirements and client requests"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr.symbol}</span>
                        <span>{curr.name}</span>
                        <span className="text-muted-foreground">({curr.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Payment Plan</Label>
              <div className="grid gap-2">
                {PAYMENT_PLAN_TEMPLATES.map((template) => {
                  const isSelected = paymentPlanId === template.id
                  const description = template.type === "30/70" 
                    ? "10% retainer upfront, then 30% and 70% of remaining balance"
                    : "10% retainer upfront, then 30%, 35%, and 35% of remaining balance"
                  
                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "cursor-pointer transition-all hover:border-ring border-border",
                        isSelected && "border-primary border"
                      )}
                      onClick={() => setPaymentPlanId(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
              {!paymentPlanId && (
                <p className="text-xs text-destructive mt-1">
                  Please select a payment plan
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

