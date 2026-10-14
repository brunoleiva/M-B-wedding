import Link from "next/link";
import {getAdminGiftPayments,getAdminGifts} from "@/services/gifts/admin";
import {formatGiftAmount} from "@/services/gifts/types";
export default async function PaymentsPage({searchParams}:{searchParams:Promise<{status?:string;error?:string}>}){
 const [payments,listing,query]=await Promise.all([getAdminGiftPayments(),getAdminGifts(),searchParams]);
 const confirmed=payments.filter(p=>p.status==="confirmed");
 const pending=payments.filter(p=>p.status==="pending_confirmation");
 const visible=payments.filter(p=>!query.status||p.status===query.status);
 return <div className="space-y-6"><Link href="/admin/presentes" className="admin-btn admin-btn--back">← Voltar aos presentes</Link>
  <h1 className="font-editorial text-4xl">Pagamentos Pix</h1><p className="text-muted">Confira os recebimentos no banco antes de confirmá-los aqui.</p>
  {query.error&&<p role="alert" className="text-red-700">Não foi possível concluir a operação.</p>}
  <div className="grid gap-3 sm:grid-cols-3">{[["Recebido",formatGiftAmount(confirmed.reduce((a,p)=>a+p.amount_cents,0))],["Pendente",formatGiftAmount(pending.reduce((a,p)=>a+p.amount_cents,0))],["Contribuições",String(payments.length)]].map(([label,value])=><div className="card-soft p-5" key={label}><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
  <nav className="flex flex-wrap gap-2">{[["Todos",""],["Pendentes","pending_confirmation"],["Confirmados","confirmed"],["Rejeitados","rejected"]].map(([label,value])=><Link key={label} className="admin-btn admin-btn--secondary" href={value?`/admin/presentes/pagamentos?status=${value}`:"/admin/presentes/pagamentos"}>{label}</Link>)}</nav>
  <Link className="admin-btn admin-btn--secondary" href="/admin/presentes/pagamentos/exportar">Baixar CSV completo</Link>
  <div className="card-soft overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line">{["Convidado","Presente","Valor","Situação","Data",""].map(s=><th className="p-4" key={s}>{s}</th>)}</tr></thead><tbody>{visible.map(p=><tr key={p.id} className="border-b border-line"><td className="p-4 font-semibold">{p.guest_name}</td><td className="p-4">{listing.gifts.find(g=>g.id===p.gift_id)?.title??"—"}</td><td className="p-4">{formatGiftAmount(p.amount_cents)}</td><td className="p-4">{p.status==="confirmed"?"Confirmado":p.status==="rejected"?"Rejeitado":"Pendente"}</td><td className="p-4">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td><td className="p-4"><Link className="admin-btn admin-btn--secondary" href={`/admin/presentes/pagamentos/${p.id}`}>Conferir</Link></td></tr>)}</tbody></table>{!visible.length&&<p className="p-6 text-muted">Nenhuma contribuição encontrada.</p>}</div></div>;
}
