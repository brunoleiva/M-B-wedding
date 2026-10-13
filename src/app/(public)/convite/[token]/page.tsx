import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppearance } from "@/services/wedding/appearance";
import { submitInvite } from "./actions";
import type { GuestStatus } from "@/services/rsvp/types";

export const metadata={title:"Convite privado",robots:{index:false,follow:false,googleBot:{index:false,follow:false}}};
type InviteGuest={id:string;name:string;status:GuestStatus;kind:string;dietary:string|null;note:string|null};
export default async function Invitation({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{saved?:string;error?:string}>}){
 const {token}=await params;const query=await searchParams;
 if(!/^[a-f0-9]{48}$/.test(token))notFound();
 if(!(await getAppearance()).visible.rsvp)notFound();
 const db=await createSupabaseServerClient();if(!db)notFound();
 const {data,error}=await db.rpc("invitation_details",{invite_token:token});
 if(error||!data||typeof data!=="object"||!('guests' in data)||!Array.isArray(data.guests))notFound();
 const family=String(data.family??"Seu convite");const guests=data.guests as InviteGuest[];
 return <section className="section-space public-inner-page"><div className="page-shell max-w-3xl"><p className="eyebrow">Convite exclusivo</p><h1 className="font-editorial text-5xl">{family}</h1><p className="mt-4 text-muted">Estamos muito felizes em convidar vocês para celebrar com Maysa & Bruno. Confirme a presença de cada pessoa abaixo.</p>
 {query.saved&&<p role="status" className="mt-6 rounded-xl bg-green-50 p-4 font-semibold text-green-900">Presenças registradas com sucesso! ❤️</p>}
 {query.error&&<p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">Não foi possível confirmar. Revise todas as respostas e tente novamente.</p>}
 <form action={submitInvite} className="card-soft mt-8 space-y-6 p-6 sm:p-9"><input type="hidden" name="token" value={token}/>{guests.map(g=><fieldset key={g.id} className="space-y-3 border-b border-line pb-6"><legend className="text-lg font-semibold">{g.name}</legend><div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="radio" name={`status_${g.id}`} value="attending" defaultChecked={g.status==="attending"} required/> Irei</label><label className="flex items-center gap-2"><input type="radio" name={`status_${g.id}`} value="not_attending" defaultChecked={g.status==="not_attending"} required/> Não irei</label></div><label className="block text-sm">Restrição alimentar (opcional)<input name={`dietary_${g.id}`} maxLength={500} defaultValue={g.dietary??""} className="mt-2 w-full rounded-xl border border-line p-3"/></label><label className="block text-sm">Observação (opcional)<input name={`note_${g.id}`} maxLength={1000} defaultValue={g.note??""} className="mt-2 w-full rounded-xl border border-line p-3"/></label></fieldset>)}{guests.length>0?<button className="focus-ring w-full rounded-full bg-brand px-6 py-4 font-bold text-white transition hover:brightness-110 active:scale-[.98]">Confirmar respostas</button>:<p>Este convite ainda não possui pessoas cadastradas.</p>}</form><p className="mt-5 text-sm text-muted">Este link é pessoal. Não o compartilhe publicamente.</p></div></section>;
}
