import { PublicInvoiceView } from "@/components/invoice/public-invoice-view";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <PublicInvoiceView token={token} />;
}

