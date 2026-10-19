import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/services/admin/dashboard";
import type { Gift, GiftPayment, GiftCategory } from "./types";

async function context() {
  const admin = await getAdminContext();
  if (!admin) throw new Error("Acesso administrativo necessario");
  const db = await createSupabaseServerClient();
  if (!db) throw new Error("Supabase indisponivel");
  return { db, weddingId: admin.weddingId };
}

export async function getAdminGifts(): Promise<{gifts: Gift[]; categories: GiftCategory[]}> {
  const {db,weddingId} = await context();
  const [a,b] = await Promise.all([
    db.from("gifts").select("id,wedding_id,category_id,slug,title,description,image_path,amount_cents,gift_kind,availability_kind,quantity_total,is_featured,is_active,sort_order")
      .eq("wedding_id", weddingId).is("deleted_at",null).order("sort_order"),
    db.from("gift_categories").select("id,wedding_id,name,slug,sort_order")
      .eq("wedding_id",weddingId).order("sort_order"),
  ]);
  if(a.error || b.error) throw new Error("Falha ao consultar catalogo administrativo");
  return { gifts: (a.data??[]) as Gift[], categories: (b.data??[]) as GiftCategory[] };
}

export async function getAdminGiftPayments(): Promise<GiftPayment[]> {
  const {db,weddingId} = await context();
  const {data,error} = await db.from("gift_payments")
    .select("id,gift_id,checkout_token,guest_name,message,amount_cents,quantity,status,admin_note,confirmed_at,created_at")
    .eq("wedding_id",weddingId).is("deleted_at",null).order("created_at",{ascending:false});
  if(error) throw new Error("Falha ao consultar pagamentos");
  return (data??[]) as GiftPayment[];
}

/** Exclusivamente dados privados para telas administrativas; nunca chame de Server Component publico. */
export async function getAdminPixSettings() {
  const {db,weddingId} = await context();
  const {data,error} = await db.from("wedding_private_settings")
    .select("pix_receiver_name,pix_key,pix_city,gift_min_amount_cents,gift_max_amount_cents,gifts_enabled,gift_intro,gift_thank_you,gift_reservation_minutes")
    .eq("wedding_id",weddingId).maybeSingle();
  if(error) throw new Error("Falha ao consultar configuracoes Pix");
  return data;
}
