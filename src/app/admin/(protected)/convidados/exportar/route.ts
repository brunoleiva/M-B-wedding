import { NextResponse } from "next/server";
import { getAdminContext } from "@/services/admin/dashboard";
import { loadGuests } from "@/services/rsvp/admin";
import { kindLabel,statusLabel } from "@/services/rsvp/types";

export const dynamic="force-dynamic";
// Quote cells and neutralize formula prefixes before opening the CSV in Excel.
function csvCell(value:unknown){
 const raw=String(value??"");const safe=/^[\s]*[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replace(/"/g,'""')+'"';
}
export async function GET(){
 const ctx=await getAdminContext();
 if(!ctx)return new NextResponse("Não autorizado",{status:401});
 try{
  const {groups,guests}=await loadGuests(ctx.weddingId);
  const byId=new Map(groups.map(g=>[g.id,g]));
  const head=["Grupo / família","Convidado","Tipo","Status RSVP","Respondido em","Restrições alimentares","Observações","Acompanhantes permitidos"];
  const rows=guests.filter(g=>byId.has(g.guest_group_id)).map(g=>{
   const family=byId.get(g.guest_group_id)!;
   return [family.display_name,g.full_name,kindLabel(g.kind),statusLabel(g.rsvp_status),g.responded_at?new Date(g.responded_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}):"",g.dietary_restrictions??"",g.guest_note??"",family.max_extra_guests];
  });
  const csv="\uFEFF"+[head,...rows].map(row=>row.map(csvCell).join(";")).join("\r\n");
  return new NextResponse(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=convidados-maysa-bruno.csv","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch{return new NextResponse("Erro ao gerar exportação",{status:500});}
}
