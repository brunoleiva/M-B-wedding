import {createSupabaseServerClient} from "@/lib/supabase/server";
import {getAdminContext} from "@/services/admin/dashboard";
import type {GiftPayment} from "./types";

/** Leitura administrativa completa; arquivar não equivale a estornar um pagamento. */
export async function getFinancialGiftPayments():Promise<(GiftPayment & {deleted_at:string|null})[]> {
 const admin=await getAdminContext();
 if(!admin)throw new Error("Acesso administrativo necessario");
 const db=await createSupabaseServerClient();
 if(!db)throw new Error("Supabase indisponivel");
 const payments:(GiftPayment & {deleted_at:string|null})[]=[];
 for(let offset=0;;offset+=500){
  const {data,error}=await db.from("gift_payments")
   .select("id,gift_id,checkout_token,guest_name,message,amount_cents,quantity,expires_at,status,admin_note,confirmed_at,created_at,deleted_at")
   .eq("wedding_id",admin.weddingId).order("created_at",{ascending:false}).order("id",{ascending:false}).range(offset,offset+499);
  if(error)throw new Error("Falha ao consultar historico financeiro");
  payments.push(...((data??[]) as (GiftPayment & {deleted_at:string|null})[]));
  if(!data||data.length<500)break;
 }
 return payments;
}
