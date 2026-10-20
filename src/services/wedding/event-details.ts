import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Venue = {
  id: string; kind: "ceremony" | "reception" | "both"; name: string; address: string;
  description: string | null; starts_at: string | null; google_maps_url: string | null;
  waze_url: string | null; is_published: boolean;
};
export type ScheduleItem = { id: string; starts_at: string; title: string; description: string | null; sort_order: number; is_public: boolean };

export async function getEventDetails(weddingId: string, publishedOnly: boolean) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { venues: [] as Venue[], schedule: [] as ScheduleItem[] };
  let v = supabase.from("venues").select("id,kind,name,address,description,starts_at,google_maps_url,waze_url,is_published").eq("wedding_id", weddingId).is("deleted_at",null).order("created_at");
  let s = supabase.from("schedule_events").select("id,starts_at,title,description,sort_order,is_public").eq("wedding_id", weddingId).is("deleted_at",null).order("starts_at").order("sort_order");
  if (publishedOnly) { v = v.eq("is_published", true); s = s.eq("is_public", true); }
  const [vr, sr] = await Promise.all([v, s]);
  if (vr.error || sr.error) { console.error("Failed to load wedding details", vr.error?.code, sr.error?.code); }
  return { venues: (vr.data ?? []) as Venue[], schedule: (sr.data ?? []) as ScheduleItem[] };
}

export async function getPublishedEventDetails() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { venues: [] as Venue[], schedule: [] as ScheduleItem[], timezone: "America/Sao_Paulo" };
  const { data: wedding } = await supabase.from("weddings").select("id,timezone").eq("is_published", true).order("created_at").limit(1).maybeSingle();
  if (!wedding) return { venues: [] as Venue[], schedule: [] as ScheduleItem[], timezone: "America/Sao_Paulo" };
  return { ...await getEventDetails(wedding.id, true), timezone: wedding.timezone as string };
}

export function formatWeddingTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(new Date(value));
}
export function formatWeddingDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: timezone }).format(new Date(value));
}
