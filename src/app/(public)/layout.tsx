import { PublicFooter } from "@/components/public/public-footer";
import { getPublicWedding } from "@/services/wedding/public";
import { PublicHeader } from "@/components/public/public-header";
import { SubmitLock } from "@/components/shared/submit-lock";
import { getAppearance, appearanceStyle } from "@/services/wedding/appearance";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getPublicWedding();
  const appearance = await getAppearance();
  return (
    <div style={appearanceStyle(appearance.colors)} className="min-h-screen bg-background text-foreground">
      <SubmitLock />
      <PublicHeader wedding={wedding} visible={appearance.visible} />
      <main>{children}</main>
      <PublicFooter wedding={wedding} visible={appearance.visible} />
    </div>
  );
}
