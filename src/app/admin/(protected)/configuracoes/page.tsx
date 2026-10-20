import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { weddingSettingsLabels } from "@/validation/wedding-settings";

type Props = { searchParams: Promise<{saved?:string;error?:string;fields?:string}> };
export default async function SettingsPage({ searchParams }: Props) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  const client = await createSupabaseServerClient();
  if (!client) return <p>Configure as variáveis do Supabase para editar o casamento.</p>;
  const [{data:wedding}, {data:venues}] = await Promise.all([
    client.from("weddings").select("first_name,second_name,event_at,timezone,city,hero_subtitle,hero_image_path").eq("id",context.weddingId).single(),
    client.from("venues").select("name,address,description").eq("wedding_id",context.weddingId).is("deleted_at",null).order("created_at").limit(1),
  ]);
  if (!wedding) return <p>Casamento não encontrado. Confira o vínculo do administrador.</p>;
  const venue = venues?.[0];
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone:wedding.timezone, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" }).formatToParts(new Date(wedding.event_at));
  const pick = (type:string) => parts.find(p => p.type === type)?.value ?? "";
  const date = `${pick("year")}-${pick("month")}-${pick("day")}`;
  const time = `${pick("hour")}:${pick("minute")}`;
  const params = await searchParams;
  const invalidFieldLabels = params.error === "invalid_fields"
    ? (params.fields || "").split(",").filter(key => Object.hasOwn(weddingSettingsLabels, key)).map(key => weddingSettingsLabels[key as keyof typeof weddingSettingsLabels])
    : [];
  return <div className="max-w-4xl space-y-8">
    <div><p className="eyebrow">Configurações</p><h1 className="font-editorial mt-2 text-5xl">Nosso casamento</h1><p className="mt-3 text-muted">Edite as informações exibidas aos convidados. As alterações serão publicadas após salvar.</p></div>
    {params.saved && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-900">Informações salvas com sucesso.</p>}
    {params.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">Não foi possível salvar ({params.error}). {invalidFieldLabels.length ? `Verifique: ${invalidFieldLabels.join(", ")}.` : "Revise os campos e tente novamente."}</p>}
    <SettingsForm initial={{
      firstName:wedding.first_name, secondName:wedding.second_name, city:wedding.city,
      date, time, timezone:wedding.timezone, heroMessage:wedding.hero_subtitle || "",
      venueName:venue?.name || "", venueAddress:venue?.address || "", venueDescription:venue?.description || "",
    }} imagePath={wedding.hero_image_path}/>

  </div>;
}
