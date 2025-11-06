import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
  const templates = [
    { name: "30/70/10 Split", description: "30% upfront, 70% on delivery, 10% retention" },
    { name: "50/50 Split", description: "50% upfront, 50% on completion" },
    { name: "Milestone Based", description: "Payments at project milestones" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Templates</h1>
        <p className="text-muted-foreground">
          Pre-built payment breakdown templates
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.name}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

