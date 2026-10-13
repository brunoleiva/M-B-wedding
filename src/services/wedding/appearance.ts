import type { CSSProperties } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const sections = [
  { key: "historia", title: "Nossa história", href: "/historia" },
  { key: "fotos", title: "Galeria de fotos", href: "/fotos" },
  { key: "casamento", title: "O casamento", href: "/casamento" },
  { key: "informacoes", title: "Informações", href: "/informacoes" },
  { key: "padrinhos", title: "Padrinhos", href: "/padrinhos" },
  { key: "presentes", title: "Presentes", href: "/presentes" },
  { key: "rsvp", title: "Confirmar presença", href: "/rsvp" },
  { key: "recados", title: "Recados", href: "/recados" },
] as const;
export type SectionKey = typeof sections[number]["key"];
export const defaultColors = {
  background_color: "#f8f4ed", surface_color: "#fffdf9", foreground_color: "#261f1a",
  brand_color: "#65704d", accent_color: "#a87655",
};
export type ColorKey = keyof typeof defaultColors;
export type Appearance = { colors: typeof defaultColors; visible: Record<SectionKey, boolean> };
export const defaultVisibility = (): Record<SectionKey, boolean> =>
  Object.fromEntries(sections.map(s=>[s.key,true])) as Record<SectionKey,boolean>;

export async function getAppearance(weddingId?: string): Promise<Appearance> {
  const result: Appearance = {colors:{...defaultColors},visible:defaultVisibility()};
  const db=await createSupabaseServerClient();
  if(!db)return result;
  let id=weddingId;
  if(!id){
    const {data}=await db.from("weddings").select("id").eq("is_published",true)
      .order("created_at").limit(1).maybeSingle();
    id=data?.id;
  }
  if(!id)return result;
  const [theme,flags]=await Promise.all([
    db.from("wedding_appearance").select("background_color,surface_color,foreground_color,brand_color,accent_color").eq("wedding_id",id).maybeSingle(),
    db.from("site_sections").select("key,is_enabled").eq("wedding_id",id),
  ]);
  if(theme.data){
    for(const key of Object.keys(defaultColors) as ColorKey[]){
      const value=theme.data[key];
      if(typeof value==="string" && /^#[0-9a-fA-F]{6}$/.test(value))result.colors[key]=value;
    }
  }
  for(const row of flags.data??[]){
    if(row.key in result.visible) result.visible[row.key as SectionKey]=row.is_enabled;
  }
  return result;
}

export function appearanceStyle(colors: Appearance["colors"]): CSSProperties {
  return {
    "--background":colors.background_color,
    "--surface":colors.surface_color,
    "--foreground":colors.foreground_color,
    "--brand":colors.brand_color,
    "--brand-strong":colors.brand_color,
    "--accent":colors.accent_color,
  } as CSSProperties;
}
