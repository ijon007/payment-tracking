import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contract",
  description: "View contract",
};

export default function ContractPublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

