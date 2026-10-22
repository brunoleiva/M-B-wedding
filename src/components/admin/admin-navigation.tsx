"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  secondary?: boolean;
};

type NavGroup = {
  label: string;
  items: readonly NavItem[];
};

const groups: readonly NavGroup[] = [
  {
    label: "Painel",
    items: [
      { label: "VisÃ£o geral", href: "/admin" },
    ],
  },
  {
    label: "ConteÃºdo do site",
    items: [
      { label: "Textos e histÃ³ria", href: "/admin/conteudo" },
      { label: "CerimÃ´nia e cronograma", href: "/admin/casamento" },
      { label: "Galeria de fotos", href: "/admin/galeria" },
      { label: "Padrinhos e pessoas especiais", href: "/admin/informacoes#pessoas", secondary: true },
      { label: "Traje e transporte", href: "/admin/informacoes#traje", secondary: true },
      { label: "Perguntas e respostas", href: "/admin/informacoes#faq", secondary: true },
      { label: "Hospedagem", href: "/admin/informacoes#hospedagem", secondary: true },
    ],
  },
  {
    label: "Convidados e interaÃ§Ã£o",
    items: [
      { label: "Lista de convidados", href: "/admin/convidados" },
      { label: "ConfirmaÃ§Ãµes (RSVP)", href: "/admin/rsvp" },
      { label: "Recados", href: "/admin/recados" },
    ],
  },
  {
    label: "Presentes",
    items: [
      { label: "Lista e pagamentos", href: "/admin/presentes" },
    ],
  },
  {
    label: "AdministraÃ§Ã£o",
    items: [
      { label: "ConfiguraÃ§Ãµes", href: "/admin/configuracoes" },
      { label: "AparÃªncia e seÃ§Ãµes", href: "/admin/aparencia" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  const [baseHref] = href.split("#");
  return pathname === baseHref || (baseHref !== "/admin" && pathname.startsWith(`${baseHref}/`));
}

function NavigationLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6" aria-label="NavegaÃ§Ã£o administrativa">
      {groups.map((group) => (
        <section key={group.label} className="border-b border-white/12 pb-5 last:border-b-0 last:pb-0">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.30em] text-white/55">
            {group.label}
          </p>
          <div className="mt-3 space-y-1.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const baseClass = item.secondary
                ? "ml-2 flex min-h-10 items-center rounded-lg border-l-2 px-3 py-2 text-sm transition-colors"
                : "flex min-h-11 items-center rounded-xl px-3 py-3 text-base font-semibold transition-colors";
              const stateClass = item.secondary
                ? active
                  ? "border-[#c8d5a0] bg-white/10 text-white"
                  : "border-white/15 text-white/78 hover:border-white/30 hover:bg-white/6 hover:text-white"
                : active
                  ? "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
                  : "text-white/90 hover:bg-white/7 hover:text-white";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring ${baseClass} ${stateClass}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function AdminDesktopNavigation() {
  return <NavigationLinks />;
}

export function AdminMobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="relative lg:hidden"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-mobile-nav"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-line bg-white px-4 py-2 text-base font-bold text-foreground"
      >
        <span aria-hidden="true">{open ? "âœ•" : "â˜°"}</span> Menu
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 cursor-default bg-black/45"
            onClick={() => setOpen(false)}
          />
          <div
            id="admin-mobile-nav"
            className="absolute left-0 top-full z-50 mt-3 max-h-[min(72vh,640px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/20 bg-[#24261f] p-4 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/55">AdministraÃ§Ã£o</p>
                <p className="mt-1 text-base font-semibold text-white">NavegaÃ§Ã£o do painel</p>
              </div>
              <button
                type="button"
                className="focus-ring min-h-11 rounded-lg px-3 font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Fechar
              </button>
            </div>
            <NavigationLinks close={() => setOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}