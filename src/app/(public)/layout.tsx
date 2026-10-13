import { PublicFooter } from "@/components/public/public-footer";
import { getPublicWedding } from "@/services/wedding/public";
import { PublicHeader } from "@/components/public/public-header";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getPublicWedding();
  return (
    <>
      <PublicHeader wedding={wedding} />
      <main>{children}</main>
      <PublicFooter wedding={wedding} />
    </>
  );
}
