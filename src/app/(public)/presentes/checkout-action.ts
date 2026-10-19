"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function createPixCheckout(form: FormData) {
  const giftId=String(form.get("gift_id")??"");
  const key=String(form.get("request_key")??"");
  const name=String(form.get("guest_name")??"").trim();
  const message=String(form.get("message")??"").trim();
  if(!uuid.test(giftId))redirect("/presentes");
  const db=await createSupabaseServerClient();
  if(!db)redirect("/presentes?erro=indisponivel");

  // Preserve the current gift page when the checkout cannot be created.
  const {data:gift,error:giftError}=await db.from("gifts")
    .select("slug").eq("id",giftId).eq("is_active",true).is("deleted_at",null).maybeSingle();
  if(giftError||!gift)redirect("/presentes?erro=indisponivel");
  const back=`/presentes/${encodeURIComponent(gift.slug)}`;
  if(!uuid.test(key)||name.length<2||name.length>160||message.length>1000)
    redirect(`${back}?erro=dados`);

  const {data,error}=await db.rpc("create_gift_pix_order",{
    p_gift_id:giftId,p_guest_name:name,p_message:message,p_request_key:key,
  });
  if(error){
    console.error("Pix checkout RPC failed",{code:error.code,message:error.message,hint:error.hint});
    const text=`${error.message} ${error.hint??""}`.toLowerCase();
    const reason=text.includes("pix ainda nao configurado")?"configuracao":
      text.includes("esgotado")||text.includes("indisponivel")?"indisponivel":
      text.includes("limite de pedidos")?"limite":
      error.code==="42883"?"migration":"pedido";
    redirect(`${back}?erro=${reason}`);
  }
  if(typeof data!=="string"||!uuid.test(data)){
    console.error("Pix checkout returned invalid order identifier");
    redirect(`${back}?erro=pedido`);
  }
  redirect(`/presentes/pedido/${data}`);
}
