import { createSupabaseServerClient } from "@/lib/supabase/server";

// Each page queries only its own section.
export async function getAdminInformationSection(weddingId: string, view: string) {
  const db = await createSupabaseServerClient();
  const empty = { people: [], faqs: [], hotels: [], info: null };
  if (!db) return empty;
  if (view === "pessoas") {
    const { data } = await db.from("special_people")
      .select("id,name,role_label,category,description,image_path,sort_order,is_published")
      .eq("wedding_id", weddingId).is("deleted_at", null).order("sort_order");
    return { ...empty, people: data ?? [] };
  }
  if (view === "faq") {
    const { data } = await db.from("faqs")
      .select("id,question,answer,sort_order,is_active")
      .eq("wedding_id", weddingId).is("deleted_at", null).order("sort_order");
    return { ...empty, faqs: data ?? [] };
  }
  if (view === "hospedagem") {
    const { data } = await db.from("recommended_hotels")
      .select("id,name,address,notes,website_url,sort_order,is_published")
      .eq("wedding_id", weddingId).is("deleted_at", null).order("sort_order");
    return { ...empty, hotels: data ?? [] };
  }
  if (view === "traje") {
    const { data } = await db.from("guest_information")
      .select("dress_title,dress_description,colors_to_avoid,transport_text,parking_text,is_published")
      .eq("wedding_id", weddingId).maybeSingle();
    return { ...empty, info: data };
  }
  return empty;
}
