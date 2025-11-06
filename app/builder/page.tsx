import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Plan Builder</h1>
        <p className="text-muted-foreground">
          Create custom payment plans with auto-calculated due dates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Custom Payment Plan</CardTitle>
          <CardDescription>
            Build a payment plan tailored to your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input id="plan-name" placeholder="Enter plan name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input id="total-amount" type="number" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input id="start-date" type="date" />
          </div>
          <Button className="w-full">Create Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}

