import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice",
  description: "View invoice",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

