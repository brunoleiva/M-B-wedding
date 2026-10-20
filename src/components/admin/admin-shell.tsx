import Link from "next/link";
import { Suspense } from "react";
import { SaveSuccessModal } from "./save-success-modal";
import { logoutAction } from "@/app/admin/actions";
import { AdminDesktopNavigation, AdminMobileNavigation } from "./admin-navigation";

export function AdminShell({ children, email, initials }: { children: React.ReactNode; email: string; initials: string }) {
  return (
    <div className="min-h-screen bg-[#f4f1ec] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <a href="#admin-main-content" className="sr-only focus:not-sr-only focus-ring fixed left-4 top-4 z-[100] rounded-xl bg-white px-5 py-3 font-semibold text-foreground">Pular para o conteúdo</a>
      <aside className="hidden min-h-screen border-r border-line bg-[#24261f] p-6 text-white lg:block">
        <Link href="/" className="font-editorial inline-flex min-h-16 min-w-16 items-center justify-center rounded-full border-2 border-white bg-white/15 px-3 text-3xl font-bold tracking-[-0.045em] text-white shadow-md">{initials}</Link>
        <p className="mt-4 text-base font-semibold text-white/90">Administração do casamento</p>
        <div className="sticky top-6 mt-10"><AdminDesktopNavigation /></div>
      </aside>
      <div className="min-w-0">
        <header className="flex min-h-[4.5rem] items-center justify-between border-b border-line bg-surface px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <AdminMobileNavigation />
            <div>
              <p className="text-sm font-semibold text-muted">Painel administrativo</p>
              <p className="mt-1 hidden text-sm font-semibold sm:block">{email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button className="focus-ring rounded-full border border-line px-4 py-2.5 text-sm font-bold transition hover:bg-background">Sair</button>
          </form>
        </header>
        <main id="admin-main-content" tabIndex={-1} className="min-w-0 p-4 sm:p-7 lg:p-10">{children}</main>
        <Suspense fallback={null}><SaveSuccessModal /></Suspense>
      </div>
    </div>
  );
}
