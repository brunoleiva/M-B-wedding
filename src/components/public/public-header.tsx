import Link from "next/link";
import { MobileNavigation } from "@/components/public/mobile-navigation";
import type { PublicWedding } from "@/services/wedding/public";
import { sections, type Appearance } from "@/services/wedding/appearance";

export function PublicHeader({ wedding, visible }: { wedding: PublicWedding; visible: Appearance["visible"] }) {
  const navigation=[{label:"Home",href:"/"},...sections.filter(s=>visible[s.key]).map(s=>({label:s.title,href:s.href}))];
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[var(--header-bg)]/95 text-[var(--header-text)] backdrop-blur-xl">
    <div className="page-shell flex h-[5rem] items-center justify-between gap-3 xl:gap-5">
      <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Página inicial">
        <span className="font-editorial flex size-13 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-2 border-current/80 bg-white/10 px-1 text-[1rem] font-bold leading-none tracking-[-0.06em] text-[var(--header-text)] shadow-sm">{wedding.firstName.charAt(0)}&amp;{wedding.secondName.charAt(0)}</span>
        
      </Link>
      <nav className="hidden items-center gap-2 lg:flex xl:gap-3" aria-label="Navegação principal">{navigation.map(s=><Link key={s.href} href={s.href} className="focus-ring rounded-lg px-2 py-2 text-[0.875rem] font-semibold leading-snug text-[var(--header-text)] transition-colors hover:bg-white/10 hover:text-[var(--header-hover)] xl:text-[0.9375rem]">{s.label}</Link>)}</nav>
      <MobileNavigation navigation={navigation} />
    </div>
  </header>;
}
