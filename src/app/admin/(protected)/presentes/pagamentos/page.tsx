import Link from "next/link";
import {getAdminGifts} from "@/services/gifts/admin";
import {getFinancialGiftPayments} from "@/services/gifts/financial-admin";
import {formatGiftAmount} from "@/services/gifts/types";
import {PaymentQuickActions} from "./quick-actions";
import {financialStatus,filterFinancialPayments,readFinancialFilters} from "@/services/gifts/finance";

type Params={status?:string;error?:string;saved?:string;removed?:string;q?:string;from?:string;to?:string;page?:string};
const base="/admin/presentes/pagamentos";
export default async function PaymentsPage({searchParams}:{searchParams:Promise<Params>}){
 const [payments,listing,query]=await Promise.all([getFinancialGiftPayments(),getAdminGifts(),searchParams]);
 const filters=readFinancialFilters(query);
 const names=new Map(listing.gifts.map(g=>[g.id,g.title]));
 const filtered=filterFinancialPayments(payments,filters,id=>names.get(id)||"Presente arquivado");
 const size=40,totalPages=Math.max(1,Math.ceil(filtered.length/size));
 const current=Math.min(Number(filters.page),totalPages);
 const visible=filtered.slice((current-1)*size,current*size);
 const active=payments.filter(p=>!p.deleted_at);
 const received=payments.filter(p=>p.status==="confirmed").reduce((sum,p)=>sum+p.amount_cents,0);
 const pending=active.filter(p=>financialStatus(p)==="pending_confirmation").reduce((sum,p)=>sum+p.amount_cents,0);
 const expired=active.filter(p=>financialStatus(p)==="expired").length;
 const makeUrl=(page:number)=>`${base}?${new URLSearchParams({...filters,page:String(page)}).toString()}`;
 return <div className="space-y-6">
  <Link href="/admin/presentes" className="admin-btn admin-btn--back">← Voltar aos presentes</Link>
  <header><h1 className="font-editorial text-4xl">Painel financeiro Pix</h1><p className="mt-2 text-muted">Valores registrados pelo sistema. Confirme cada recebimento no extrato bancário.</p></header>
  {query.error&&<p role="alert" className="rounded-xl border border-red-300 p-4 text-red-700">Não foi possível concluir a operação ({query.error}). Confira os logs da Vercel.</p>}
  {(query.saved||query.removed)&&<p role="status" className="rounded-xl border border-green-300 p-4 text-green-800">{query.removed?"Registro arquivado. O histórico financeiro foi mantido.":"Pagamento atualizado."}</p>}
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {[["Recebido (inclui arquivados)",formatGiftAmount(received)],["Pendente no prazo",formatGiftAmount(pending)],["Reservas expiradas",String(expired)],["Registros arquivados",String(payments.length-active.length)]].map(([label,value])=><div className="card-soft p-5" key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
  </div>
  <p className="text-xs text-muted">Arquivar é apenas organizar o painel: não significa estornar o Pix. O total recebido representa pagamentos confirmados administrativamente, inclusive os arquivados.</p>
  <form action={base} method="get" className="card-soft grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
   <label className="text-sm font-semibold xl:col-span-2">Convidado, presente ou referência<input name="q" type="search" defaultValue={filters.q} maxLength={120} placeholder="Pesquisar" className="guest-input mt-1 w-full"/></label>
   <label className="text-sm font-semibold">Situação<select name="status" defaultValue={filters.status} className="guest-input mt-1 w-full"><option value="">Todos</option><option value="pending_confirmation">Pendente</option><option value="expired">Reserva expirada</option><option value="confirmed">Confirmado</option><option value="rejected">Rejeitado</option><option value="archived">Arquivados</option></select></label>
   <label className="text-sm font-semibold">Data inicial<input name="from" type="date" defaultValue={filters.from} className="guest-input mt-1 w-full"/></label>
   <label className="text-sm font-semibold">Data final<input name="to" type="date" defaultValue={filters.to} className="guest-input mt-1 w-full"/></label>
   <div className="flex flex-wrap gap-2 sm:col-span-2 xl:col-span-5"><button type="submit" className="admin-btn admin-btn--primary">Filtrar</button><Link href={base} className="admin-btn admin-btn--secondary">Limpar</Link><Link href={`${base}/exportar?${new URLSearchParams({...filters,page:"1"}).toString()}`} className="admin-btn admin-btn--secondary">Exportar CSV filtrado</Link></div>
  </form>
  <p className="text-sm text-muted">{filtered.length} registro(s) encontrado(s). Página {current} de {totalPages}.</p>
  <div className="card-soft overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line">{["Convidado / referência","Presente","Mensagem","Valor","Situação","Criado em","Ações"].map(s=><th key={s} scope="col" className="p-4">{s}</th>)}</tr></thead><tbody>{visible.map(p=><tr className="border-b border-line" key={p.id}><td className="p-4 font-semibold">{p.guest_name}<span className="mt-1 block font-mono text-xs text-muted">{p.checkout_token?`MB-${p.checkout_token.slice(0,8).toUpperCase()}`:`ID-${p.id.slice(0,8).toUpperCase()}`}</span></td><td className="p-4">{names.get(p.gift_id??"")??"Presente arquivado"}</td><td className="max-w-64 whitespace-pre-wrap break-words p-4 text-muted">{p.message||"—"}</td><td className="whitespace-nowrap p-4">{formatGiftAmount(p.amount_cents)}</td><td className="p-4">{p.deleted_at?<span className="font-semibold text-muted">Arquivado · {financialStatus(p)==="confirmed"?"Confirmado":financialStatus(p)==="rejected"?"Rejeitado":"Pendente"}</span>:financialStatus(p)==="expired"?<span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-900">Reserva expirada</span>:financialStatus(p)==="confirmed"?"Confirmado":financialStatus(p)==="rejected"?"Rejeitado":"Pendente"}</td><td className="whitespace-nowrap p-4">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td><td className="p-4">{p.deleted_at?<span className="text-xs text-muted">Somente histórico</span>:<div className="flex items-center gap-2"><Link className="admin-btn admin-btn--secondary" href={`${base}/${p.id}`}>Conferir</Link><PaymentQuickActions id={p.id} status={p.status}/></div>}</td></tr>)}</tbody></table>{!visible.length&&<p className="p-6 text-muted">Nenhum registro encontrado.</p>}</div>
  <div className="flex items-center justify-between gap-3">{current>1?<Link className="admin-btn admin-btn--secondary" href={makeUrl(current-1)}>← Anterior</Link>:<span/>}{current<totalPages?<Link className="admin-btn admin-btn--secondary" href={makeUrl(current+1)}>Próxima →</Link>:<span/>}</div>
 </div>;
}
