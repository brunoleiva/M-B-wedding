"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultColors, defaultColumn, getSavedDefaultColors, sections, type ColorKey } from "@/services/wedding/appearance";

export async function saveAppearance(form:FormData){
 const ctx=await getAdminContext();
 if(!ctx)redirect("/admin/login?error=unauthorized");
 const db=await createSupabaseServerClient();
 if(!db)redirect("/admin/aparencia?error=database");
 const intent = form.get("intent");
 if (!["save", "set_default", "restore"].includes(String(intent))) redirect("/admin/aparencia?error=action");
 const colors={...defaultColors};
 for(const key of Object.keys(colors) as ColorKey[]){
   const value=form.get(key);
   if(typeof value!=="string" || !/^#[0-9a-fA-F]{6}$/.test(value))redirect("/admin/aparencia?error=colors");
   colors[key]=value;
 }
 const enabled=form.getAll("visible").filter((x):x is string=>typeof x==="string");
 if(enabled.some(x=>!sections.some(s=>s.key===x)))redirect("/admin/aparencia?error=sections");
 const savedDefaults = intent === "restore" ? await getSavedDefaultColors(ctx.weddingId) : null;
 const payload: Record<string,string> = {};
 for (const key of Object.keys(colors) as ColorKey[]) {
   if (intent === "set_default") payload[defaultColumn(key)] = colors[key];
   else payload[key] = savedDefaults ? savedDefaults[key] : colors[key];
 }
 const {error:themeError}=await db.from("wedding_appearance").upsert({wedding_id:ctx.weddingId,...payload},{onConflict:"wedding_id"});
 if(themeError)redirect("/admin/aparencia?error=database");
 if (intent === "save") {
   const {error:sectionError}=await db.from("site_sections").upsert(
     sections.map((s,index)=>({wedding_id:ctx.weddingId,key:s.key,label:s.title,is_enabled:enabled.includes(s.key),sort_order:index})),
     {onConflict:"wedding_id,key"}
   );
   if(sectionError)redirect("/admin/aparencia?error=sections_database");
 }
 revalidatePath("/", "layout");
 redirect(`/admin/aparencia?saved=${intent}`);
}
