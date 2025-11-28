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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePaymentStore } from "@/lib/store"
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils"
import { cn } from "@/lib/utils"

export function ClientDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [agreedPrice, setAgreedPrice] = useState("")
  const [notionPageLink, setNotionPageLink] = useState("")
  const [paymentPlanId, setPaymentPlanId] = useState<string>("")
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
    })

    // Reset form
    setName("")
    setAgreedPrice("")
    setNotionPageLink("")
    setPaymentPlanId("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>
      <DialogContent className="w-1/3 max-h-[90vh] overflow-y-auto gap-5 scrollbar-hide">
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
                        isSelected && "border-ring border"
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

