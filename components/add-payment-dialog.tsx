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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyDollar } from "@phosphor-icons/react"
import { usePaymentStore } from "@/lib/store"
import { formatCurrency } from "@/lib/payment-utils"

export function AddPaymentDialog({ 
  clientId,
  trigger
}: { 
  clientId: string
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("")
  const { getClient, addPayment } = usePaymentStore()

  const client = getClient(clientId)
  if (!client) return null

  const unpaidPayments = client.payments.filter((p) => !p.paidDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPaymentId) {
      return
    }

    addPayment(clientId, selectedPaymentId, new Date())
    setSelectedPaymentId("")
    setOpen(false)
  }

  if (unpaidPayments.length === 0) {
    return null
  }

  const triggerElement = (
    <Button variant="ghost" size="sm" className="w-full justify-start">
      <CurrencyDollar className="mr-2 h-4 w-4" />
      Add Payment
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerElement} />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Mark a payment installment as paid for {client.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payment">Select Payment</Label>
              <Select
                value={selectedPaymentId || null}
                onValueChange={(value) => setSelectedPaymentId(value || "")}
                required
              >
                <SelectTrigger id="payment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unpaidPayments.map((payment) => (
                    <SelectItem key={payment.id} value={payment.id}>
                      {payment.type === "retainer"
                        ? `Retainer - ${formatCurrency(payment.amount)}`
                        : `Installment ${payment.installmentNumber} - ${formatCurrency(payment.amount)}`}
                      {" "}
                      (Due: {new Date(payment.dueDate).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedPaymentId}>
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

