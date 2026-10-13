import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { saveWeddingSettings } from "./actions";

type Props = { searchParams: Promise<{saved?:string;error?:string}> };
export default async function SettingsPage({ searchParams }: Props) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  const client = await createSupabaseServerClient();
  if (!client) return <p>Configure as variáveis do Supabase para editar o casamento.</p>;
  const [{data:wedding}, {data:venues}] = await Promise.all([
    client.from("weddings").select("first_name,second_name,event_at,timezone,city,hero_subtitle,hero_image_path").eq("id",context.weddingId).single(),
    client.from("venues").select("name,address,description").eq("wedding_id",context.weddingId).order("created_at").limit(1),
  ]);
  if (!wedding) return <p>Casamento não encontrado. Confira o vínculo do administrador.</p>;
  const venue = venues?.[0];
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone:wedding.timezone, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" }).formatToParts(new Date(wedding.event_at));
  const pick = (type:string) => parts.find(p => p.type === type)?.value ?? "";
  const date = `${pick("year")}-${pick("month")}-${pick("day")}`;
  const time = `${pick("hour")}:${pick("minute")}`;
  const params = await searchParams;
  const field = (name:string,label:string,value:string,extra?:{type?:string;required?:boolean}) => <label className="grid gap-2 text-sm font-semibold" key={name}>{label}<input className="min-h-12 rounded-xl border border-line bg-white px-4 text-foreground" name={name} defaultValue={value} type={extra?.type || "text"} required={extra?.required !== false} maxLength={1000}/></label>;
  return <div className="max-w-4xl space-y-8">
    <div><p className="eyebrow">Configurações</p><h1 className="font-editorial mt-2 text-5xl">Nosso casamento</h1><p className="mt-3 text-muted">Edite as informações exibidas aos convidados. As alterações serão publicadas após salvar.</p></div>
    {params.saved && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Informações salvas com sucesso.</p>}
    {params.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">Não foi possível salvar ({params.error}). Revise os campos e tente novamente.</p>}
    <form action={saveWeddingSettings} encType="multipart/form-data" className="card-soft space-y-8 p-6 sm:p-9">
      <fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 font-editorial text-3xl">O casal</legend>
        {field("firstName","Primeiro nome",wedding.first_name)}{field("secondName","Segundo nome",wedding.second_name)}
      </fieldset>
      <fieldset className="grid gap-5 md:grid-cols-2"><legend className="mb-5 font-editorial text-3xl">O grande dia</legend>
        {field("date","Data",date,{type:"date"})}{field("time","Horário",time,{type:"time"})}
        {field("city","Cidade",wedding.city)}{field("timezone","Fuso horário (IANA)",wedding.timezone)}
      </fieldset>
      <fieldset className="grid gap-5"><legend className="mb-5 font-editorial text-3xl">Capa</legend>
        <label className="grid gap-2 text-sm font-semibold">Mensagem principal<textarea name="heroMessage" required maxLength={400} defaultValue={wedding.hero_subtitle || ""} className="min-h-28 rounded-xl border border-line bg-white p-4 text-foreground"/></label>
        <label className="grid gap-2 text-sm font-semibold">Nova foto de capa (JPG, PNG ou WEBP, até 5 MB)<input type="file" name="heroImage" accept="image/jpeg,image/png,image/webp" className="rounded-xl border border-line bg-white p-3 text-foreground"/></label>
        <p className="text-sm text-muted">Imagem atual: {wedding.hero_image_path || "não definida"}. Deixe o campo vazio para manter a imagem.</p>
      </fieldset>
      <fieldset className="grid gap-5"><legend className="mb-5 font-editorial text-3xl">Cerimônia e recepção</legend>
        <p className="text-sm text-muted">Ainda não definiram o local? Deixe os três campos abaixo vazios e salve normalmente. Para divulgar o local, informe nome e endereço.</p>
        {field("venueName","Nome do local (opcional)",venue?.name || "",{required:false})}
        {field("venueAddress","Endereço (opcional)",venue?.address || "",{required:false})}
        <label className="grid gap-2 text-sm font-semibold">Descrição<textarea name="venueDescription" maxLength={1000} defaultValue={venue?.description || ""} className="min-h-28 rounded-xl border border-line bg-white p-4 text-foreground"/></label>
      </fieldset>
      <button type="submit" className="focus-ring min-h-12 rounded-full bg-foreground px-7 font-semibold text-white hover:opacity-85">Salvar informações</button>
    </form>
  </div>;
}
