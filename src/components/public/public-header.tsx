import Link from "next/link";
import type { PublicWedding } from "@/services/wedding/public";
import { sections, type Appearance } from "@/services/wedding/appearance";

export function PublicHeader({ wedding, visible }: { wedding: PublicWedding; visible: Appearance["visible"] }) {
  const navigation=[{label:"Home",href:"/"},...sections.filter(s=>visible[s.key]).map(s=>({label:s.title,href:s.href}))];
  return <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#211a16]/80 text-white backdrop-blur-xl">
    <div className="page-shell flex h-[4.5rem] items-center justify-between gap-4">
      <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Página inicial">
        <span className="font-editorial grid size-10 place-items-center rounded-full border border-white/35 text-sm">{wedding.initials}</span>
        <span className="hidden text-xs font-semibold tracking-[0.18em] uppercase sm:inline">{wedding.firstName} & {wedding.secondName}</span>
      </Link>
      <nav className="hidden items-center gap-5 lg:flex" aria-label="Navegação principal">{navigation.map(s=><Link key={s.href} href={s.href} className="focus-ring rounded text-xs text-white/85 hover:text-white">{s.label}</Link>)}</nav>
      <details className="relative lg:hidden"><summary className="focus-ring cursor-pointer list-none rounded-full border border-white/35 px-4 py-2.5 text-xs font-bold uppercase">Menu</summary>
        <nav className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#211a16] p-3 shadow-2xl" aria-label="Navegação mobile">{navigation.map(s=><Link key={s.href} href={s.href} className="focus-ring block rounded-xl px-3 py-3 text-sm hover:bg-white/10">{s.label}</Link>)}</nav>
      </details>
    </div>
  </header>;
}
