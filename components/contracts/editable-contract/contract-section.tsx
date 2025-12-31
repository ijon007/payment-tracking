"use client";

import { ReactNode } from "react";

interface ContractSectionProps {
  title: string;
  children: ReactNode;
}

export function ContractSection({ title, children }: ContractSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-base">{title}</h2>
      {children}
    </div>
  );
}

