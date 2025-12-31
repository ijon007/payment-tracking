import { PublicContractView } from "@/components/contracts/public-contract-view";

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <PublicContractView token={token} />;
}

