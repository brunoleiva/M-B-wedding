import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Gift, GiftCategory } from "./types";

export async function getPublicGiftCatalog(): Promise<{gifts: Gift[];categories: GiftCategory[];intro: string|null;enabled:boolean;weddingId:string|null}> {
  const db=await createSupabaseServerClient();
  if(!db) return {gifts:[],categories:[],intro:null,enabled:false,weddingId:null};
  const {data:wedding,error:we}=await db.from("weddings").select("id").eq("is_published",true).order("created_at").limit(1).maybeSingle();
  if(we||!wedding)return {gifts:[],categories:[],intro:null,enabled:false,weddingId:null};
  // The private settings must never be queried from a public component. Publication is
  // controlled via the existing public site_sections and active gift flags.
  const [items,categories,settings]=await Promise.all([
    db.from("gifts").select("id,wedding_id,category_id,slug,title,description,image_path,amount_cents,gift_kind,availability_kind,quantity_total,is_featured,is_active,sort_order").eq("wedding_id",wedding.id).eq("is_active",true).is("deleted_at",null).order("is_featured",{ascending:false}).order("sort_order").order("title"),
    db.from("gift_categories").select("id,wedding_id,name,slug,sort_order").eq("wedding_id",wedding.id).order("sort_order"),
    db.rpc("get_public_gift_settings",{target_wedding_id:wedding.id}),
  ]);
  if(items.error||categories.error||settings.error)throw new Error("Não foi possível carregar a lista de presentes.");
  const meta=(settings.data??[])[0];
  const enabled=meta?.enabled===true;
  return {gifts:enabled?(items.data??[]) as Gift[]:[],categories:enabled?(categories.data??[]) as GiftCategory[]:[],intro:meta?.introduction??null,enabled,weddingId:wedding.id};
}
