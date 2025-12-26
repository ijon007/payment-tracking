"use client";

import { CaretDown } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, type Currency } from "@/lib/currency-utils";
import { PAYMENT_PLAN_TEMPLATES } from "@/lib/payment-utils";
import { usePaymentStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ClientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [notionPageLink, setNotionPageLink] = useState("");
  const [paymentPlanId, setPaymentPlanId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [retainerDetails, setRetainerDetails] = useState("");
  const [initialRequests, setInitialRequests] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const { addClient } = usePaymentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!(name && agreedPrice && paymentPlanId)) {
      return;
    }

    const price = Number.parseFloat(agreedPrice);
    if (Number.isNaN(price) || price <= 0) {
      return;
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
    });

    // Reset form
    setName("");
    setAgreedPrice("");
    setNotionPageLink("");
    setPaymentPlanId("");
    setEmail("");
    setPhone("");
    setAddress("");
    setServiceType("");
    setRetainerDetails("");
    setInitialRequests("");
    setCurrency("USD");
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button>Add Client</Button>} />
      <DialogContent className="flex max-h-[70vh] w-2/5 flex-col gap-5 p-0">
        <form className="flex flex-1 flex-col overflow-hidden" onSubmit={handleSubmit}>
          <DialogHeader className="sr-only">
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client and assign a payment plan.
            </DialogDescription>
          </DialogHeader>
          <div className="scrollbar-hide grid flex-1 gap-5 overflow-y-auto p-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Client Name</Label>
              <Input
                id="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                required
                value={name}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Agreed Price</Label>
              <Input
                id="price"
                min="0"
                onChange={(e) => setAgreedPrice(e.target.value)}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={agreedPrice}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notion">Notion Page Link</Label>
              <Input
                id="notion"
                onChange={(e) => setNotionPageLink(e.target.value)}
                placeholder="https://notion.so/..."
                type="url"
                value={notionPageLink}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                type="email"
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
                value={phone}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Country"
                value={address}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g., Web Development, Design, Consulting"
                value={serviceType}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="retainerDetails">Retainer Details</Label>
              <Textarea
                id="retainerDetails"
                onChange={(e) => setRetainerDetails(e.target.value)}
                placeholder="Retainer payment details and terms"
                rows={3}
                value={retainerDetails}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="initialRequests">Initial Client Requests</Label>
              <Textarea
                id="initialRequests"
                onChange={(e) => setInitialRequests(e.target.value)}
                placeholder="Initial project requirements and client requests"
                rows={4}
                value={initialRequests}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  id="currency"
                  render={
                    <Button className="w-full justify-between" variant="outline">
                      {(() => {
                        const selected = CURRENCIES.find((c) => c.code === currency);
                        return selected ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selected.symbol}</span>
                            <span>{selected.name}</span>
                            <span className="text-muted-foreground">
                              ({selected.code})
                            </span>
                          </div>
                        ) : (
                          "Select currency"
                        );
                      })()}
                      <CaretDown className="h-4 w-4 opacity-50" />
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-full">
                  {CURRENCIES.map((curr) => (
                    <DropdownMenuItem
                      key={curr.code}
                      onClick={() => setCurrency(curr.code as Currency)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr.symbol}</span>
                        <span>{curr.name}</span>
                        <span className="text-muted-foreground">
                          ({curr.code})
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="grid gap-2">
              <Label>Payment Plan</Label>
              <div className="grid gap-2">
                {PAYMENT_PLAN_TEMPLATES.map((template) => {
                  const isSelected = paymentPlanId === template.id;
                  const description =
                    template.type === "30/70"
                      ? "10% retainer upfront, then 30% and 70% of remaining balance"
                      : "10% retainer upfront, then 30%, 35%, and 35% of remaining balance";

                  return (
                    <Card
                      className={cn(
                        "cursor-pointer border-border transition-all hover:border-ring",
                        isSelected && "border border-primary"
                      )}
                      key={template.id}
                      onClick={() => setPaymentPlanId(template.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="font-medium text-sm">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
              {!paymentPlanId && (
                <p className="mt-1 text-destructive text-xs">
                  Please select a payment plan
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 border-t bg-background p-2">
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Add Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
