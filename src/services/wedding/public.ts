import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weddingConfig } from "@/config/wedding";

export type PublicWedding = {
  firstName: string; secondName: string; initials: string;
  isoDate: string; displayDate: string; city: string; timezone: string;
  heroMessage: string; heroImage: string;
  venue: { name: string; time: string; address: string; description: string };
};

function fallback(): PublicWedding {
  return {
    firstName: weddingConfig.couple.firstName, secondName: weddingConfig.couple.secondName,
    initials: weddingConfig.couple.initials,
    isoDate: weddingConfig.event.isoDate, displayDate: weddingConfig.event.displayDate,
    city: weddingConfig.event.city, timezone: weddingConfig.event.timezone,
    heroMessage: weddingConfig.hero.message, heroImage: weddingConfig.hero.image,
    venue: weddingConfig.venue,
  };
}

export async function getPublicWedding(): Promise<PublicWedding> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallback();
  const { data: wedding, error } = await supabase.from("weddings")
    .select("id,first_name,second_name,event_at,timezone,city,hero_subtitle,hero_image_path")
    .eq("is_published", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error || !wedding) return fallback();
  const { data: venue } = await supabase.from("venues")
    .select("name,starts_at,address,description")
    .eq("wedding_id", wedding.id).eq("is_published",true)
    .order("created_at",{ascending:true}).limit(1).maybeSingle();
  const date = new Date(wedding.event_at);
  const timezone = wedding.timezone || "America/Sao_Paulo";
  const time = (value: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: timezone, hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  const fmt = new Intl.DateTimeFormat("pt-BR", { timeZone: timezone, day:"2-digit",month:"2-digit",year:"numeric" }).format(date);
  const imagePath: string | null = wedding.hero_image_path;
  const heroImage = imagePath?.startsWith("/images/") ? imagePath : imagePath?.startsWith(`${wedding.id}/`) ? supabase.storage.from("wedding-media").getPublicUrl(imagePath).data.publicUrl : weddingConfig.hero.image;
  return {
    firstName: wedding.first_name, secondName: wedding.second_name,
    initials: `${wedding.first_name[0]} & ${wedding.second_name[0]}`,
    isoDate: wedding.event_at, displayDate: fmt.replaceAll("/", " . "), city: wedding.city,
    timezone, heroMessage: wedding.hero_subtitle || weddingConfig.hero.message, heroImage,
    venue: venue ? { name: venue.name, time: time(venue.starts_at || wedding.event_at), address: venue.address, description: venue.description || "" } : fallback().venue,
  };
}
