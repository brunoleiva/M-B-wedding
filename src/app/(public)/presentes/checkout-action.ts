"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPixCheckout(form: FormData) {
  const giftId=String(form.get("gift_id")??"");
  const key=String(form.get("request_key")??"");
  const name=String(form.get("guest_name")??"").trim();
  const message=String(form.get("message")??"").trim();
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if(!uuid.test(giftId)||!uuid.test(key)||name.length<2||name.length>160||message.length>1000)
    redirect("/presentes?erro=dados");
  const db=await createSupabaseServerClient();
  if(!db)redirect("/presentes?erro=indisponivel");
  const {data,error}=await db.rpc("create_gift_pix_order",{
    p_gift_id:giftId,p_guest_name:name,p_message:message,p_request_key:key,
  });
  if(error||typeof data!=="string"||!uuid.test(data))redirect("/presentes?erro=pedido");
  redirect(`/presentes/pedido/${data}`);
}
