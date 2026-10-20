import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getGuestInformation(weddingId: string, admin = false) {
 const db = await createSupabaseServerClient();
 if (!db) return { people: [], faqs: [], hotels: [], info: null };
 const [people, faqs, hotels, info] = await Promise.all([
  db.from("special_people").select("id,name,role_label,category,description,image_path,sort_order,is_published").eq("wedding_id",weddingId).is("deleted_at",null).order("sort_order"),
  db.from("faqs").select("id,question,answer,sort_order,is_active").eq("wedding_id",weddingId).is("deleted_at",null).order("sort_order"),
  db.from("recommended_hotels").select("id,name,address,notes,website_url,sort_order,is_published").eq("wedding_id",weddingId).is("deleted_at",null).order("sort_order"),
  db.from("guest_information").select("dress_title,dress_description,colors_to_avoid,transport_text,parking_text,is_published").eq("wedding_id",weddingId).maybeSingle(),
 ]);
 return {
  people: (people.data ?? []).filter(x=>admin || x.is_published).map(x=>({...x,image_url:x.image_path ? db.storage.from("wedding-media").getPublicUrl(x.image_path).data.publicUrl : null})),
  faqs: (faqs.data ?? []).filter(x=>admin || x.is_active),
  hotels: (hotels.data ?? []).filter(x=>admin || x.is_published),
  info: (admin || info.data?.is_published) ? info.data : null,
 };
}

export async function getPublicGuestInformation() {
 const db = await createSupabaseServerClient();
 if(!db) return {people:[],faqs:[],hotels:[],info:null};
 const { data: wedding } = await db.from("weddings").select("id").eq("is_published",true).order("created_at").limit(1).maybeSingle();
 if(!wedding) return {people:[],faqs:[],hotels:[],info:null};
 return getGuestInformation(wedding.id);
}
