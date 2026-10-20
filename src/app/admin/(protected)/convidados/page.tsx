import Link from "next/link";
import { getAdminContext } from "@/services/admin/dashboard";
import { loadGuests } from "@/services/rsvp/admin";
import { statusLabel, kindLabel } from "@/services/rsvp/types";
import type { GuestStatus, GuestKind } from "@/services/rsvp/types";
import { StatusNotice } from "@/components/admin/guest-ui";
import { GuestQuickActions } from "./guest-quick-actions";

const statuses: GuestStatus[] = ["pending", "attending", "not_attending"];
const kinds: GuestKind[] = ["adult", "child", "companion"];
const pageSize = 25;
const pill = "rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-brand hover:bg-brand/10 focus-ring";
export default async function GuestsAdmin({ searchParams }: { searchParams: Promise<{q?: string; status?: string; kind?: string; page?: string; sort?: string; saved?: string; removed?: string; error?: string}> }) {
  const ctx = await getAdminContext(); if (!ctx) return null;
  const params = await searchParams;
  let result: Awaited<ReturnType<typeof loadGuests>>;
  try { result = await loadGuests(ctx.weddingId); } catch { return <p role="alert">Não foi possível carregar os convidados.</p>; }
  const { groups, guests } = result;
  const groupMap = new Map(groups.map(g => [g.id, g]));
  const all = guests.filter(g => groupMap.has(g.guest_group_id));
  const query = (params.q ?? "").trim().toLocaleLowerCase("pt-BR");
  const status = statuses.includes(params.status as GuestStatus) ? params.status : "";
  const kind = kinds.includes(params.kind as GuestKind) ? params.kind : "";
  const filtered = all.filter(g => (!status || g.rsvp_status === status) && (!kind || g.kind === kind) && (!query || `${g.full_name} ${groupMap.get(g.guest_group_id)?.display_name}`.toLocaleLowerCase("pt-BR").includes(query)));
  filtered.sort((a,b) => params.sort === "recent" ? (b.responded_at ?? "").localeCompare(a.responded_at ?? "") : params.sort === "family" ? (groupMap.get(a.guest_group_id)?.display_name ?? "").localeCompare(groupMap.get(b.guest_group_id)?.display_name ?? "", "pt-BR") : a.full_name.localeCompare(b.full_name,"pt-BR"));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rawPage = Number(params.page ?? "1");
  const page = Number.isSafeInteger(rawPage) ? Math.min(pages,Math.max(1,rawPage)) : 1;
  const visible = filtered.slice((page-1)*pageSize,page*pageSize);
  const hrefFor = (n: number) => { const q = new URLSearchParams(); if(params.q)q.set("q",params.q);if(status)q.set("status",status);if(kind)q.set("kind",kind);if(params.sort)q.set("sort",params.sort);q.set("page",String(n));return `/admin/convidados?${q}`; };
  const counts = { attending:0, not_attending:0, pending:0 }; all.forEach(g=>counts[g.rsvp_status]++);
  const responseRate = all.length ? Math.round((counts.attending+counts.not_attending)/all.length*100) : 0;
  return <div className="space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Organização</p><h1 className="font-editorial text-4xl sm:text-5xl">Convidados</h1><p className="mt-2 text-muted">Consulte, filtre, edite ou exclua convidados com ações rápidas.</p></div><div className="flex flex-wrap gap-2"><Link className={pill} href="/admin/convidados/familias">Famílias e convites</Link><Link className="admin-btn admin-btn--primary" href="/admin/convidados/novo">+ Novo convidado</Link></div></header>
    <StatusNotice error={params.error}/>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{([ ["Total",all.length],["Confirmados",counts.attending],["Não irão",counts.not_attending],["Aguardando",counts.pending] ] as const).map(([label,num])=><div key={label} className="card-soft p-4 sm:p-6"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{num}</p></div>)}</div>
    <p className="text-sm font-semibold text-muted">Taxa de resposta: {responseRate}% dos convidados ativos ({counts.attending+counts.not_attending} de {all.length}).</p>
    <section className="card-soft space-y-4 p-4 sm:p-6"><form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="lg:col-span-2 text-sm font-semibold">Buscar nome ou família<input className="guest-input" name="q" type="search" defaultValue={params.q??""} placeholder="Ex.: Maysa"/></label><label className="text-sm font-semibold">Presença<select className="guest-input" name="status" defaultValue={status}><option value="">Todas</option>{statuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></label><label className="text-sm font-semibold">Tipo<select className="guest-input" name="kind" defaultValue={kind}><option value="">Todos</option>{kinds.map(k=><option key={k} value={k}>{kindLabel(k)}</option>)}</select></label><label className="text-sm font-semibold">Ordenar<select className="guest-input" name="sort" defaultValue={params.sort??"name"}><option value="name">Nome A–Z</option><option value="family">Família</option><option value="recent">Resposta recente</option></select></label><div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5"><button className="admin-btn admin-btn--primary" type="submit">Aplicar filtros</button><Link href="/admin/convidados" className={pill}>Limpar</Link><Link href="/admin/convidados/exportar" className={pill}>Exportar todos (CSV)</Link><Link href="/admin/rsvp" className={pill}>Painel RSVP</Link></div></form>
    <p className="text-sm text-muted">Exibindo {visible.length ? (page-1)*pageSize+1 : 0}–{Math.min(page*pageSize,filtered.length)} de {filtered.length} convidados encontrados.</p>
    <div className="hidden overflow-x-auto rounded-xl border border-line md:block"><table className="w-full text-left text-sm"><thead className="bg-black/5"><tr>{["Nome","Família","Tipo","Presença","Última resposta",""].map(h=><th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{visible.map(g=><tr key={g.id} className="border-t border-line transition hover:bg-brand/5"><td className="p-3 font-semibold">{g.full_name}</td><td className="p-3">{groupMap.get(g.guest_group_id)?.display_name}</td><td className="p-3">{kindLabel(g.kind)}</td><td className="p-3">{statusLabel(g.rsvp_status)}</td><td className="p-3">{g.responded_at ? new Date(g.responded_at).toLocaleDateString("pt-BR") : "—"}</td><td className="p-3"><GuestQuickActions id={g.id} name={g.full_name}/></td></tr>)}</tbody></table></div>
    <div className="space-y-2 md:hidden">{visible.map(g=><div key={g.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-4"><div className="min-w-0"><span className="block break-words font-semibold">{g.full_name}</span><span className="mt-1 block text-sm text-muted">{groupMap.get(g.guest_group_id)?.display_name} · {statusLabel(g.rsvp_status)}</span></div><GuestQuickActions id={g.id} name={g.full_name}/></div>)}</div>
    {visible.length===0&&<p className="rounded-xl bg-black/5 p-6 text-center text-muted">Nenhum convidado encontrado. Ajuste os filtros ou cadastre uma pessoa.</p>}
    <nav aria-label="Paginação de convidados" className="flex items-center justify-between gap-3"><span className="text-sm text-muted">Página {page} de {pages}</span><div className="flex gap-2">{page>1?<Link className={pill} href={hrefFor(page-1)}>← Anterior</Link>:null}{page<pages?<Link className={pill} href={hrefFor(page+1)}>Próxima →</Link>:null}</div></nav>
    </section></div>;
}
