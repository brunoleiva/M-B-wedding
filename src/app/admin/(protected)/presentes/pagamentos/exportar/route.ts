import {NextRequest,NextResponse} from "next/server";
import {getAdminContext} from "@/services/admin/dashboard";
import {getAdminGifts} from "@/services/gifts/admin";
import {getFinancialGiftPayments} from "@/services/gifts/financial-admin";
import {filterFinancialPayments,financialStatus,readFinancialFilters} from "@/services/gifts/finance";
const field=(v:string|number)=>`"${String(v).replaceAll('"','""')}"`;
// Impede interpretação de conteúdo fornecido pelo convidado como fórmula de planilha.
const safe=(v:string)=>/^[\s]*[=+@-]/.test(v)?`'${v}`:v;
export async function GET(request:NextRequest){
  const admin=await getAdminContext();if(!admin)return new NextResponse("Não autorizado",{status:401});
  const [payments,{gifts}]=await Promise.all([getFinancialGiftPayments(),getAdminGifts()]);
  const raw=Object.fromEntries(request.nextUrl.searchParams.entries());
  const filters=readFinancialFilters(raw);
  const names=new Map(gifts.map(g=>[g.id,g.title]));
  const selected=filterFinancialPayments(payments,filters,id=>names.get(id)||"Presente arquivado");
  const rows=["Referência;Convidado;Presente;Mensagem;Valor (R$);Status financeiro;Situação da reserva;Arquivado;Criado em;Confirmado em;Nota administrativa",...selected.map(p=>[
    p.checkout_token?`MB-${p.checkout_token.slice(0,8).toUpperCase()}`:`ID-${p.id.slice(0,8).toUpperCase()}`,
    safe(p.guest_name),safe(names.get(p.gift_id??"")??"Presente arquivado"),safe(p.message??""),
    (p.amount_cents/100).toFixed(2).replace(".",","),p.status,
    financialStatus(p)==="expired"?"Reserva expirada":"—",p.deleted_at?"Sim":"Não",
    new Date(p.created_at).toLocaleString("pt-BR"),p.confirmed_at?new Date(p.confirmed_at).toLocaleString("pt-BR"):"",
    safe(p.admin_note??"")
  ].map(field).join(";"))];
  return new NextResponse("\ufeff"+rows.join("\r\n"),{headers:{
    "Content-Type":"text/csv; charset=utf-8",
    "Content-Disposition":"attachment; filename=pagamentos-presentes.csv",
    "Cache-Control":"private, no-store",
  }});
}
