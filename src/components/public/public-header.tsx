import Link from "next/link";
import { MobileNavigation } from "@/components/public/mobile-navigation";
import type { PublicWedding } from "@/services/wedding/public";
import { sections, type Appearance } from "@/services/wedding/appearance";

export function PublicHeader({ wedding, visible }: { wedding: PublicWedding; visible: Appearance["visible"] }) {
  const navigation=[{label:"Home",href:"/"},...sections.filter(s=>visible[s.key]).map(s=>({label:s.title,href:s.href}))];
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[var(--header-bg)]/95 text-[var(--header-text)] backdrop-blur-xl">
    <div className="page-shell flex h-[5.5rem] items-center justify-between gap-3 xl:gap-6">
      <Link href="/" className="focus-ring flex min-h-14 items-center gap-3 rounded-full" aria-label={`Página inicial — ${wedding.firstName} e ${wedding.secondName}`}>
        <span className="font-editorial inline-flex size-14 min-w-14 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-2 border-current bg-white/15 px-1 text-[1.2rem] font-bold leading-none tracking-[-0.055em] text-[var(--header-text)] shadow-md sm:size-16 sm:min-w-16 sm:text-[1.35rem]">{wedding.firstName.charAt(0)}&amp;{wedding.secondName.charAt(0)}</span>
      </Link>
      <nav className="hidden items-center gap-1 lg:flex xl:gap-2" aria-label="Navegação principal">{navigation.map(s=><Link key={s.href} href={s.href} className="focus-ring rounded-lg px-2.5 py-3 text-[0.95rem] font-bold leading-snug text-[var(--header-text)] transition-colors hover:bg-white/15 hover:text-[var(--header-hover)] xl:px-3 xl:text-base">{s.label}</Link>)}</nav>
      <MobileNavigation navigation={navigation} />
    </div>
  </header>;
}
