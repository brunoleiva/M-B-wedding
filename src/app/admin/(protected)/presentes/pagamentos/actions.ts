"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {getAdminContext} from "@/services/admin/dashboard";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const base="/admin/presentes/pagamentos";
const validId=(value:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
function refresh(id:string){revalidatePath("/admin/presentes");revalidatePath(base);revalidatePath(`${base}/${id}`);revalidatePath("/presentes");}
export async function reviewPayment(fd:FormData){
  const ctx=await getAdminContext();if(!ctx)redirect("/admin/login?error=unauthorized");
  const db=await createSupabaseServerClient();if(!db)redirect(`${base}?error=db`);
  const id=String(fd.get("id")??"");
  const decision=String(fd.get("decision")??"");
  const note=String(fd.get("note")??"").trim();
  if(!validId(id)||!["confirmed","rejected"].includes(decision)||note.length>1000)
    redirect(`${base}?error=fields`);
  const {error}=await db.rpc("review_gift_pix_payment",{p_payment_id:id,p_decision:decision,p_note:note});
  if(error){console.error("Review Pix failed",{code:error.code,message:error.message});redirect(`${base}?error=review`);}
  refresh(id);
  redirect(`${base}?saved=payment`);
}
export async function archivePayment(fd:FormData){
  const ctx=await getAdminContext();if(!ctx)redirect("/admin/login?error=unauthorized");
  const db=await createSupabaseServerClient();if(!db)redirect(`${base}?error=db`);
  const id=String(fd.get("id")??"");
  if(!validId(id))redirect(`${base}?error=fields`);
  const {error}=await db.rpc("archive_gift_pix_payment",{p_payment_id:id});
  if(error){console.error("Archive Pix failed",{code:error.code,message:error.message});redirect(`${base}?error=archive`);}
  refresh(id);
  redirect(`${base}?removed=payment`);
}
