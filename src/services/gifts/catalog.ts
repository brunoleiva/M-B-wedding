import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Gift, GiftCategory } from "./types";

/** Consultas exclusivamente publicas; nao incluem Pix nem dados financeiros. */
export async function getPublicGiftCatalog(weddingId: string): Promise<{
  gifts: Gift[];
  categories: GiftCategory[];
}> {
  const db = await createSupabaseServerClient();
  if (!db) return { gifts: [], categories: [] };

  // RLS continua sendo a ultima linha de defesa.
  const [giftsResult, categoriesResult] = await Promise.all([
    db.from("gifts")
      .select("id,wedding_id,category_id,slug,title,description,image_path,amount_cents,gift_kind,availability_kind,quantity_total,is_featured,is_active,sort_order")
      .eq("wedding_id", weddingId).eq("is_active", true).is("deleted_at", null)
      .order("sort_order").order("title"),
    db.from("gift_categories")
      .select("id,wedding_id,name,slug,sort_order")
      .eq("wedding_id", weddingId).order("sort_order"),
  ]);
  if (giftsResult.error) throw new Error("Falha ao carregar os presentes");
  if (categoriesResult.error) throw new Error("Falha ao carregar as categorias");
  return {
    gifts: (giftsResult.data ?? []) as Gift[],
    categories: (categoriesResult.data ?? []) as GiftCategory[],
  };
}
