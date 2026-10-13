"use server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const validToken=/^[a-f0-9]{48}$/;
export async function submitInvite(form:FormData){
 const token=String(form.get("token")??"");
 if(!validToken.test(token))redirect("/rsvp?error=invite");
 const db=await createSupabaseServerClient();if(!db)redirect(`/convite/${token}?error=database`);
 const {data:raw,error}=await db.rpc("invitation_details",{invite_token:token});
 if(error||!raw||typeof raw!=="object"||!('guests' in raw)||!Array.isArray(raw.guests))redirect(`/convite/${token}?error=invalid`);
 const guests=raw.guests as Array<{id:string}>;
 if(!guests.length||guests.length>30)redirect(`/convite/${token}?error=invalid`);
 const responses=guests.map(guest=>({id:guest.id,status:String(form.get(`status_${guest.id}`)??""),dietary:String(form.get(`dietary_${guest.id}`)??"").trim(),note:String(form.get(`note_${guest.id}`)??"").trim()}));
 if(responses.some(r=>!["attending","not_attending"].includes(r.status)||r.dietary.length>500||r.note.length>1000))redirect(`/convite/${token}?error=fields`);
 const result=await db.rpc("respond_to_invitation",{invite_token:token,responses});
 if(result.error||result.data!==true)redirect(`/convite/${token}?error=database`);
 redirect(`/convite/${token}?saved=1`);
}
