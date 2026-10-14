import {NextResponse} from "next/server";
import {getAdminContext} from "@/services/admin/dashboard";
import {getAdminGiftPayments,getAdminGifts} from "@/services/gifts/admin";
export async function GET(){
  const admin=await getAdminContext();if(!admin)return new NextResponse("Não autorizado",{status:401});
  const [payments,{gifts}]=await Promise.all([getAdminGiftPayments(),getAdminGifts()]);
  const field=(v:string|number)=>`"${String(v).replaceAll('"','""')}"`;
  const rows=["Convidado;Presente;Valor (R$);Status;Data",...payments.map(p=>[
    p.guest_name,gifts.find(g=>g.id===p.gift_id)?.title??"",
    (p.amount_cents/100).toFixed(2).replace(".",","),p.status,new Date(p.created_at).toLocaleString("pt-BR")
  ].map(field).join(";"))];
  return new NextResponse("\ufeff"+rows.join("\r\n"),{headers:{
    "Content-Type":"text/csv; charset=utf-8",
    "Content-Disposition":"attachment; filename=pagamentos-presentes.csv",
    "Cache-Control":"private, no-store",
  }});
}
