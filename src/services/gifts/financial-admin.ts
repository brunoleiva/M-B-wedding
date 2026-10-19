import {createSupabaseServerClient} from "@/lib/supabase/server";
import {getAdminContext} from "@/services/admin/dashboard";
import type {GiftPayment} from "./types";

/** Leitura administrativa completa; arquivar não equivale a estornar um pagamento. */
export async function getFinancialGiftPayments():Promise<(GiftPayment & {deleted_at:string|null})[]> {
 const admin=await getAdminContext();
 if(!admin)throw new Error("Acesso administrativo necessario");
 const db=await createSupabaseServerClient();
 if(!db)throw new Error("Supabase indisponivel");
 const {data,error}=await db.from("gift_payments")
  .select("id,gift_id,checkout_token,guest_name,message,amount_cents,quantity,expires_at,status,admin_note,confirmed_at,created_at,deleted_at")
  .eq("wedding_id",admin.weddingId).order("created_at",{ascending:false});
 if(error)throw new Error("Falha ao consultar historico financeiro");
 return (data??[]) as (GiftPayment & {deleted_at:string|null})[];
}
