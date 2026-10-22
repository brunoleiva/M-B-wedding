"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const groups = [
  { title: "Painel", links: [["Visão geral", "/admin"]] },
  { title: "Conteúdo do site", links: [
    ["Textos e história", "/admin/conteudo"],
    ["Cerimônia e cronograma", "/admin/casamento"],
    ["Galeria de fotos", "/admin/galeria"],
    ["Padrinhos e pessoas especiais", "/admin/informacoes#pessoas-especiais"],
    ["Traje e transporte", "/admin/informacoes#traje-transporte"],
    ["Perguntas e respostas", "/admin/informacoes#perguntas-frequentes"],
    ["Hospedagem", "/admin/informacoes#hospedagem"],
  ] },
  { title: "Convidados e interação", links: [
    ["Lista de convidados", "/admin/convidados"],
    ["Confirmações (RSVP)", "/admin/rsvp"],
    ["Recados", "/admin/recados"],
  ] },
  { title: "Presentes", links: [["Lista e pagamentos", "/admin/presentes"]] },
  { title: "Administração", links: [
    ["Configurações", "/admin/configuracoes"],
    ["Aparência e seções", "/admin/aparencia"],
  ] },
] as const;

function NavigationLinks({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return <nav className="space-y-5" aria-label="Navegação administrativa">
    {groups.map(group => <section key={group.title} aria-label={group.title}>
      <h2 className="mb-2 border-b border-white/15 px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">{group.title}</h2>
      <div className="space-y-1">{group.links.map(([label, href]) => {
        const route = href.split("#")[0];
        const active = pathname === route || (route !== "/admin" && pathname.startsWith(`${route}/`));
        return <Link key={href} href={href} onClick={close} aria-current={active && !href.includes("#") ? "page" : undefined}
          className={`focus-ring block rounded-xl border px-3 py-2.5 text-sm font-semibold leading-5 transition-colors ${active ? "border-white/30 bg-white/15 text-white" : "border-transparent text-white/85 hover:bg-white/15 hover:text-white"}`}>
          {label}
        </Link>;
      })}</div>
    </section>)}
  </nav>;
}

export function AdminDesktopNavigation() {
  return <div className="max-h-[calc(100vh-2rem)] overflow-y-auto pr-1"><NavigationLinks /></div>;
}

export function AdminMobileNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <div key={pathname} className="relative lg:hidden" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <button type="button" aria-expanded={open} aria-controls="admin-mobile-nav"
      onClick={() => setOpen(value => !value)}
      className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-line bg-white px-4 py-2 text-base font-bold text-foreground">
      <span aria-hidden="true">{open ? "✕" : "☰"}</span> Menu
    </button>
    {open && <>
      <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 cursor-default bg-black/45" onClick={() => setOpen(false)} />
      <div id="admin-mobile-nav" className="absolute left-0 top-full z-50 mt-3 max-h-[min(72vh,640px)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/20 bg-[#24261f] p-3 text-white shadow-2xl">
        <div className="mb-2 flex items-center justify-between px-2"><span className="text-sm font-bold">Navegação</span><button type="button" className="focus-ring min-h-11 rounded-lg px-3 font-semibold" onClick={() => setOpen(false)}>Fechar</button></div>
        <NavigationLinks close={() => setOpen(false)} />
      </div>
    </>}
  </div>;
}
