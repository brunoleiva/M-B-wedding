import Link from "next/link";
import { getAdminContext } from "@/services/admin/dashboard";
import { loadGuests } from "@/services/rsvp/admin";
import { statusLabel } from "@/services/rsvp/types";
import type {GuestStatus} from "@/services/rsvp/types";
export default async function RsvpAdmin(){
 const ctx=await getAdminContext();if(!ctx)return null;
 let loaded;try{loaded=await loadGuests(ctx.weddingId)}catch{return <p role="alert">Erro ao carregar as confirmações.</p>}
 const {guests,groups}=loaded;
 const stats={attending:0,not_attending:0,pending:0};for(const g of guests)stats[g.rsvp_status]++;
 const groupIds=new Set(groups.map(x=>x.id));
 return <div className="space-y-8"><header><p className="eyebrow">RSVP</p><h1 className="font-editorial text-5xl">Confirmações</h1><p className="mt-2 text-muted">Acompanhe quem confirmou, recusou ou ainda não respondeu.</p></header><div className="grid gap-4 sm:grid-cols-4">{([ ["Total",guests.length],["Confirmados",stats.attending],["Não irão",stats.not_attending],["Aguardando",stats.pending]] as const).map(([label,value])=><div key={label} className="card-soft p-6"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-4xl font-semibold">{value}</p></div>)}</div><div className="flex flex-wrap gap-3"><Link href="/admin/convidados" className="rounded-full bg-brand px-5 py-3 font-semibold text-white hover:brightness-110">Gerenciar convidados</Link><Link href="/admin/convidados/exportar" className="rounded-full border px-5 py-3 font-semibold hover:bg-white">Exportar CSV para Excel</Link></div><div className="card-soft overflow-x-auto p-5"><h2 className="mb-3 text-xl font-semibold">Respostas</h2><table className="min-w-[560px] w-full text-left text-sm"><thead><tr><th className="p-3">Convidado</th><th className="p-3">Status</th><th className="p-3">Restrições alimentares</th></tr></thead><tbody>{guests.filter(g=>groupIds.has(g.guest_group_id)).map(g=><tr key={g.id} className="border-t"><td className="p-3">{g.full_name}</td><td className="p-3">{statusLabel(g.rsvp_status as GuestStatus)}</td><td className="p-3">{g.dietary_restrictions||"—"}</td></tr>)}</tbody></table></div></div>;
}
