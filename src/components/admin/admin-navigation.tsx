"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Unicode escapes keep labels stable even if a Windows tool re-encodes this file.
const sections = [
  { title: "PAINEL", links: [["Vis\u00e3o geral", "/admin"]] },
  { title: "CONTE\u00daDO DO SITE", links: [
    ["Textos e hist\u00f3ria", "/admin/conteudo"],
    ["Cerim\u00f4nia e cronograma", "/admin/casamento"],
    ["Galeria de fotos", "/admin/galeria"],
    ["Padrinhos e pessoas especiais", "/admin/informacoes#pessoas"],
    ["Traje e transporte", "/admin/informacoes#traje"],
    ["Perguntas e respostas", "/admin/informacoes#faq"],
    ["Hospedagem", "/admin/informacoes#hospedagem"],
  ] },
  { title: "CONVIDADOS E INTERA\u00c7\u00c3O", links: [
    ["Lista de convidados", "/admin/convidados"],
    ["Confirma\u00e7\u00f5es (RSVP)", "/admin/rsvp"],
    ["Recados", "/admin/recados"],
  ] },
  { title: "PRESENTES", links: [["Lista e pagamentos", "/admin/presentes"]] },
  { title: "ADMINISTRA\u00c7\u00c3O", links: [
    ["Configura\u00e7\u00f5es", "/admin/configuracoes"],
    ["Apar\u00eancia e se\u00e7\u00f5es", "/admin/aparencia"],
  ] },
] as const;

function NavigationLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Menu administrativo" className="space-y-5">
    {sections.map(section => <section key={section.title}>
      <h2 className="mb-2 border-b border-white/15 px-3 pb-2 text-[11px] font-bold tracking-[0.16em] text-white/60">{section.title}</h2>
      <div className="space-y-1">
        {section.links.map(([label, href]) => {
          const [path] = href.split("#");
          const active = pathname === path || (path !== "/admin" && pathname.startsWith(`${path}/`));
          return <Link key={href} href={href} onClick={close} aria-current={active ? "page" : undefined}
            className={`focus-ring flex min-h-11 items-center rounded-lg border-l-[3px] px-3 py-2.5 text-sm font-medium leading-5 transition-colors ${active ? "border-[#cad4ac] bg-white/10 text-white" : "border-transparent text-white/80 hover:bg-white/5 hover:text-white"}`}>
            {label}
          </Link>;
        })}
      </div>
    </section>)}
  </nav>;
}

export function AdminDesktopNavigation() { return <NavigationLinks />; }

export function AdminMobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <div key={pathname} className="relative lg:hidden" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <button type="button" aria-expanded={open} aria-controls="admin-mobile-nav" onClick={() => setOpen(value => !value)}
      className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-line bg-white px-4 py-2 text-base font-bold text-foreground">
      {open ? "Fechar" : "Menu"}
    </button>
    {open && <>
      <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/45" onClick={() => setOpen(false)} />
      <div id="admin-mobile-nav" className="absolute left-0 top-full z-50 mt-3 max-h-[min(75vh,680px)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/20 bg-[#24261f] p-5 text-white shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><p className="font-semibold">Menu do painel</p><button type="button" className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10" onClick={() => setOpen(false)}>Fechar</button></div>
        <NavigationLinks close={() => setOpen(false)} />
      </div>
    </>}
  </div>;
}
