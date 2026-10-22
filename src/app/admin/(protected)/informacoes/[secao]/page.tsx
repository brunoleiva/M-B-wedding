import { notFound } from "next/navigation";
import InfoAdmin from "../page";

const allowed = ["pessoas", "traje", "faq", "hospedagem"] as const;

export default async function InformationSectionPage({
  params, searchParams,
}: {
  params: Promise<{ secao: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { secao } = await params;
  if (!allowed.some(item => item === secao)) notFound();
  return InfoAdmin({ searchParams: Promise.resolve({ ...(await searchParams), view: secao }) });
}
