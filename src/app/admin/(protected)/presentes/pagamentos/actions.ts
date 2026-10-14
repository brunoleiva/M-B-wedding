"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {getAdminContext} from "@/services/admin/dashboard";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function reviewPayment(fd:FormData){
  const ctx=await getAdminContext();if(!ctx)redirect("/admin/login?error=unauthorized");
  const db=await createSupabaseServerClient();if(!db)redirect("/admin/presentes/pagamentos?error=db");
  const id=String(fd.get("id")??"");
  const decision=String(fd.get("decision")??"");
  const note=String(fd.get("note")??"").trim();
  if(!/^[0-9a-f-]{36}$/i.test(id)||!["confirmed","rejected"].includes(decision)||note.length>1000)
    redirect("/admin/presentes/pagamentos?error=fields");
  const {error}=await db.rpc("review_gift_pix_payment",{p_payment_id:id,p_decision:decision,p_note:note});
  if(error)redirect(`/admin/presentes/pagamentos/${id}?error=review`);
  revalidatePath("/admin/presentes");revalidatePath("/admin/presentes/pagamentos");
  revalidatePath(`/admin/presentes/pagamentos/${id}`);revalidatePath("/presentes");
  redirect(`/admin/presentes/pagamentos/${id}?saved=payment`);
}
