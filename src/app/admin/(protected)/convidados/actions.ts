"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const route="/admin/convidados";
const get=(fd:FormData,k:string)=>String(fd.get(k)??"").trim();
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
async function access(){const ctx=await getAdminContext();if(!ctx)redirect("/admin/login?error=unauthorized");const db=await createSupabaseServerClient();if(!db)redirect(route+"?error=db");return {ctx,db};}
function done(){revalidatePath(route);revalidatePath(route+"/familias");revalidatePath("/admin/rsvp");}
export async function saveGroup(fd:FormData){
 const {ctx,db}=await access();const id=get(fd,"id"),display_name=get(fd,"display_name"),phone=get(fd,"phone"),max=Number(get(fd,"max_extra_guests")||0);
 if((id&&!uuid(id))||!display_name||display_name.length>160||phone.length>40||!Number.isSafeInteger(max)||max<0||max>10)redirect(route+"?error=fields");
 const payload={display_name,phone:phone||null,max_extra_guests:max};
 const result=id?await db.from("guest_groups").update(payload).eq("id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).select("id").maybeSingle():await db.from("guest_groups").insert({...payload,wedding_id:ctx.weddingId}).select("id").maybeSingle();
 if(result.error||!result.data)redirect(route+"?error=db");done();redirect(`${route}/familias/${result.data.id}?saved=group`);
}
export async function saveGuest(fd:FormData){
 const {ctx,db}=await access();const id=get(fd,"id"),guest_group_id=get(fd,"guest_group_id"),full_name=get(fd,"full_name"),kind=get(fd,"kind"),status=get(fd,"rsvp_status"),dietary=get(fd,"dietary_restrictions"),note=get(fd,"guest_note");
 if((id&&!uuid(id))||!uuid(guest_group_id)||!full_name||full_name.length>180||!["adult","child","companion"].includes(kind)||!["pending","attending","not_attending"].includes(status)||dietary.length>500||note.length>1000)redirect(route+"?error=fields");
 const {data:group}=await db.from("guest_groups").select("id").eq("id",guest_group_id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).maybeSingle();if(!group)redirect(route+"?error=group");
 const payload={guest_group_id,full_name,kind,rsvp_status:status,dietary_restrictions:dietary||null,guest_note:note||null,responded_at:status==="pending"?null:new Date().toISOString()};
 const result=id?await db.from("guests").update(payload).eq("id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).select("id").maybeSingle():await db.from("guests").insert({...payload,wedding_id:ctx.weddingId}).select("id").maybeSingle();
 if(result.error||!result.data)redirect(route+"?error=db");done();redirect(`${route}?saved=guest`);
}
export async function removeGuest(fd:FormData){const {ctx,db}=await access();const id=get(fd,"id");if(!uuid(id))redirect(route+"?error=fields");const {data,error}=await db.from("guests").update({deleted_at:new Date().toISOString()}).eq("id",id).eq("wedding_id",ctx.weddingId).select("id").maybeSingle();if(error||!data)redirect(route+"?error=db");done();redirect(route+"?removed=guest");}
export async function removeGroup(fd:FormData){const {ctx,db}=await access();const id=get(fd,"id");if(!uuid(id))redirect(route+"?error=fields");const {count:activeCount,error:countError}=await db.from("guests").select("id",{count:"exact",head:true}).eq("guest_group_id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null);if(countError||activeCount===null)redirect(route+"/familias?error=db");if(activeCount>0)redirect(route+"/familias?error=members");const {data,error}=await db.from("guest_groups").update({deleted_at:new Date().toISOString()}).eq("id",id).eq("wedding_id",ctx.weddingId).select("id").maybeSingle();if(error||!data)redirect(route+"?error=db");done();redirect(route+"/familias?removed=group");}
