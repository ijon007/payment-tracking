import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PaymentPlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Plans</h1>
          <p className="text-muted-foreground">
            Manage payment plans and templates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Payment Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
          <CardDescription>
            View and manage all payment plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No payment plans created yet. Create your first plan to get started.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

