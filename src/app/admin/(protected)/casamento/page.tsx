import Link from "next/link";
import { getAdminContext } from "@/services/admin/dashboard";
import { getEventDetails } from "@/services/wedding/event-details";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveVenue, removeVenue, saveSchedule, removeSchedule } from "./actions";

const input = "mt-1 block w-full rounded-xl border border-line bg-white p-3 text-foreground";
const label = "block text-sm font-semibold";
const defaultDate = (iso: string | null, timezone: string) => iso ? new Intl.DateTimeFormat("sv-SE", { timeZone: timezone, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" }).format(new Date(iso)).replace(" ","T") : "";
const kinds = [{value:"ceremony",label:"Cerimônia"},{value:"reception",label:"Recepção"},{value:"both",label:"Cerimônia e recepção no mesmo local"}];

export default async function WeddingAdmin({searchParams}:{searchParams:Promise<{error?:string;saved?:string;removed?:string}>}) {
  const ctx = await getAdminContext();
  const { venues, schedule } = ctx ? await getEventDetails(ctx.weddingId, false) : {venues:[],schedule:[]};
  const db = await createSupabaseServerClient();
  const { data: wedding } = ctx && db ? await db.from("weddings").select("timezone").eq("id",ctx.weddingId).maybeSingle() : {data:null};
  const timezone = wedding?.timezone ?? "America/Sao_Paulo";
  const params = await searchParams;
  return <div className="max-w-5xl space-y-10">
    <header><p className="eyebrow">Conteúdo do casamento</p><h1 className="font-editorial mt-2 text-5xl">Cerimônia e cronograma</h1><p className="mt-3 text-muted">Cadastre somente o que já foi definido. Itens não publicados ficam ocultos para convidados. Fuso horário: {timezone}.</p><Link href="/casamento" className="mt-3 inline-block underline">Visualizar página pública</Link></header>
    {params.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">Não foi possível salvar. {params.error === "venue_fields" ? "Confira os campos obrigatórios do local, data e links HTTPS." : params.error === "schedule_fields" ? "Confira o título, a data e a ordem do cronograma." : "Verifique a conexão ou permissões com o Supabase."}</p>}
    {(params.saved || params.removed) && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">Alterações registradas com sucesso.</p>}
    <section className="space-y-5" aria-labelledby="venues-heading"><h2 id="venues-heading" className="font-editorial text-4xl">Locais</h2><p className="text-sm text-muted">Você pode cadastrar cerimônia e recepção separadamente ou usar a opção “mesmo local”. Não é preciso cadastrar nenhum local por enquanto.</p>
      {[...venues, null].map((venue, index)=><div className="card-soft p-6" key={venue?.id ?? "new"}><h3 className="mb-4 text-xl font-semibold">{venue ? `Editar: ${venue.name}` : "Adicionar local"}</h3><form action={saveVenue} className="grid gap-4 sm:grid-cols-2">
        {venue && <input type="hidden" name="id" value={venue.id}/>}
        <label className={label}>Tipo de local<select name="kind" className={input} defaultValue={venue?.kind ?? "both"}>{kinds.map(k=><option key={k.value} value={k.value}>{k.label}</option>)}</select></label>
        <label className={label}>Nome do local *<input name="name" required maxLength={160} className={input} defaultValue={venue?.name ?? ""}/></label>
        <label className={label+" sm:col-span-2"}>Endereço *<input name="address" required maxLength={500} className={input} defaultValue={venue?.address ?? ""}/></label>
        <label className={label+" sm:col-span-2"}>Descrição<textarea name="description" maxLength={3000} rows={3} className={input} defaultValue={venue?.description ?? ""}/></label>
        <label className={label}>Data e horário do local (opcional)<input type="datetime-local" name="starts_at" className={input} defaultValue={defaultDate(venue?.starts_at ?? null,timezone)}/></label>
        <label className={label}>Google Maps (HTTPS)<input type="url" name="google_maps_url" placeholder="https://maps.google.com/..." className={input} defaultValue={venue?.google_maps_url ?? ""}/></label>
        <label className={label}>Waze (HTTPS)<input type="url" name="waze_url" placeholder="https://waze.com/ul?..." className={input} defaultValue={venue?.waze_url ?? ""}/></label>
        <label className="flex items-center gap-2 self-end text-sm"><input type="checkbox" name="published" defaultChecked={venue?.is_published ?? false}/> Visível para convidados</label>
        <button type="submit" className="admin-btn admin-btn--primary sm:col-span-2">{venue ? "Salvar local" : "Adicionar local"}</button>
      </form>{venue && <form action={removeVenue} className="mt-3"><input type="hidden" name="id" value={venue.id}/><button type="submit" className="admin-btn admin-btn--danger">Excluir local definitivamente</button></form>}</div>)}</section>
    <section className="space-y-5" aria-labelledby="schedule-heading"><h2 id="schedule-heading" className="font-editorial text-4xl">Cronograma</h2><p className="text-sm text-muted">Os horários são exibidos na ordem cronológica. Você pode ocultar eventos específicos.</p>
      {[...schedule, null].map(item=><div className="card-soft p-6" key={item?.id ?? "new"}><h3 className="mb-4 text-xl font-semibold">{item ? `Editar: ${item.title}` : "Adicionar horário"}</h3><form action={saveSchedule} className="grid gap-4 sm:grid-cols-2">
        {item && <input type="hidden" name="id" value={item.id}/>}
        <label className={label}>Título *<input required name="title" maxLength={150} className={input} defaultValue={item?.title ?? ""}/></label>
        <label className={label}>Data e hora *<input required type="datetime-local" name="starts_at" className={input} defaultValue={defaultDate(item?.starts_at ?? null,timezone)}/></label>
        <label className={label+" sm:col-span-2"}>Descrição<textarea name="description" rows={2} maxLength={2000} className={input} defaultValue={item?.description ?? ""}/></label>
        <label className={label}>Ordem (desempate)<input name="sort_order" type="number" min="0" max="100000" defaultValue={item?.sort_order ?? 0} className={input}/></label>
        <label className="flex items-center gap-2 self-end text-sm"><input name="published" type="checkbox" defaultChecked={item?.is_public ?? false}/> Visível para convidados</label>
        <button type="submit" className="admin-btn admin-btn--primary sm:col-span-2">{item ? "Salvar horário" : "Adicionar horário"}</button>
      </form>{item && <form action={removeSchedule} className="mt-3"><input name="id" type="hidden" value={item.id}/><button className="admin-btn admin-btn--danger">Excluir horário definitivamente</button></form>}</div>)}</section>
  </div>;
}
