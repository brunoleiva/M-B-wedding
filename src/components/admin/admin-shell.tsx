import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

const items = [
  ["Visão geral", "/admin"],
  ["Conteúdo", "/admin/conteudo"],
  ["Convidados", "/admin/convidados"],
  ["RSVP", "/admin/rsvp"],
  ["Presentes", "/admin/presentes"],
  ["Galeria", "/admin/galeria"],
  ["Configurações", "/admin/configuracoes"],
] as const;

function AdminNav() {
  return (
    <nav className="space-y-1" aria-label="Navegação administrativa">
      {items.map(([label, href]) => (
        <Link key={href} href={href} className="focus-ring block rounded-xl px-3 py-2.5 text-sm text-white/72 transition hover:bg-white/10 hover:text-white">
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminShell({ children, email, initials }: { children: React.ReactNode; email: string; initials: string }) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden min-h-screen border-r border-line bg-[#24261f] p-6 text-white lg:block">
        <Link href="/" className="font-editorial text-2xl">{initials}</Link>
        <p className="mt-2 text-xs text-white/50">Administração do casamento</p>
        <div className="mt-10"><AdminNav /></div>
      </aside>
      <div>
        <header className="flex min-h-[4.5rem] items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <details className="relative lg:hidden">
              <summary className="focus-ring cursor-pointer list-none rounded-full border border-line px-3 py-2 text-xs font-bold uppercase">Menu</summary>
              <div className="absolute left-0 z-40 mt-3 w-64 rounded-2xl bg-[#24261f] p-3 text-white shadow-2xl"><AdminNav /></div>
            </details>
            <div>
              <p className="text-xs font-semibold text-muted">Painel administrativo</p>
              <p className="mt-1 hidden text-sm font-semibold sm:block">{email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="focus-ring rounded-full border border-line px-4 py-2 text-xs font-bold transition hover:bg-background">Sair</button>
          </form>
        </header>
        <main className="p-5 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
