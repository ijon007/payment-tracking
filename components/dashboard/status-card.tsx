"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  count: number;
  description: string;
  colorClass: string;
}

export function StatusCard({
  title,
  count,
  description,
  colorClass,
}: StatusCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className={`size-3 rounded-full ${colorClass}`} />
          <CardTitle className="font-medium text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{count}</div>
        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}
