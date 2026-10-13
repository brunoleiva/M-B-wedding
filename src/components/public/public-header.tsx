import Link from "next/link";
import { weddingConfig } from "@/config/wedding";

const navigation = [
  ["Nossa história", "/#historia"],
  ["O casamento", "/#casamento"],
  ["Presentes", "/presentes"],
  ["Informações", "/informacoes"],
] as const;

export function PublicHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#211a16]/45 text-white backdrop-blur-xl">
      <div className="page-shell flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-full" aria-label="Página inicial">
          <span className="font-editorial grid size-10 place-items-center rounded-full border border-white/35 text-sm">
            {weddingConfig.couple.initials}
          </span>
          <span className="hidden text-xs font-semibold tracking-[0.18em] uppercase sm:inline">
            {weddingConfig.couple.firstName} & {weddingConfig.couple.secondName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
          {navigation.map(([label, href]) => (
            <Link key={href} href={href} className="focus-ring rounded text-sm text-white/80 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/rsvp"
            className="focus-ring hidden rounded-full bg-white px-4 py-2.5 text-xs font-bold tracking-wide text-foreground uppercase transition hover:bg-[#f1eadf] sm:inline-flex sm:px-5"
          >
            Confirmar presença
          </Link>
          <details className="relative lg:hidden">
            <summary className="focus-ring cursor-pointer list-none rounded-full border border-white/35 px-4 py-2.5 text-xs font-bold uppercase">
              Menu
            </summary>
            <nav className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/15 bg-[#211a16]/95 p-3 shadow-2xl backdrop-blur-xl" aria-label="Navegação mobile">
              {[...navigation, ["Confirmar presença", "/rsvp"] as const].map(([label, href]) => (
                <Link key={href} href={href} className="focus-ring block rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10 hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
