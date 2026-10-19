"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const val=(f:FormData,k:string,max=3000)=>String(f.get(k)??"").trim().slice(0,max);
const selected=(f:FormData,k:string)=>f.get(k)==="on";
const order=(f:FormData)=>Math.max(0,Math.min(99999,Number(f.get("sort_order"))||0));
async function context(){
 const admin=await getAdminContext(); if(!admin) redirect("/admin/login");
 const db=await createSupabaseServerClient();if(!db) redirect("/admin/informacoes?error=database");
 return {admin,db};
}
function go(error?:string){revalidatePath("/informacoes");revalidatePath("/padrinhos");redirect(`/admin/informacoes?${error?`error=${error}`:"saved=1"}`);}
function validUrl(url:string){if(!url)return true;try{const u=new URL(url);return u.protocol==="https:";}catch{return false;}}
export async function saveInformation(f:FormData){
 const {admin,db}=await context();
 const payload={wedding_id:admin.weddingId,dress_title:val(f,"dress_title",160)||null,dress_description:val(f,"dress_description")||null,colors_to_avoid:val(f,"colors_to_avoid",1000)||null,transport_text:val(f,"transport_text")||null,parking_text:val(f,"parking_text")||null,is_published:selected(f,"is_published")};
 const {error}=await db.from("guest_information").upsert(payload,{onConflict:"wedding_id"});go(error?"database":undefined);
}
export async function savePerson(f:FormData){
 const {admin,db}=await context();const id=val(f,"id");const name=val(f,"name",150);const role=val(f,"role_label",150);
 if(!name||!role)go("fields");
 // O caminho da imagem deve vir do banco, nunca de um campo editÃ¡vel do navegador.
 let image_path="";
 if(id){
  const {data:existing,error}=await db.from("special_people").select("image_path").eq("id",id).eq("wedding_id",admin.weddingId).maybeSingle();
  if(error||!existing)go("database");
  image_path=existing?.image_path??"";
 }
 const previousImagePath=image_path;
 const photo=f.get("photo");
 if(photo instanceof File && photo.size>0){
  const ext:{[k:string]:string}={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
  if(!ext[photo.type]||photo.size>5*1024*1024)go("image");
  const path=`${admin.weddingId}/people/${crypto.randomUUID()}.${ext[photo.type]}`;
  const {error}=await db.storage.from("wedding-media").upload(path,photo,{contentType:photo.type});if(error)go("image");image_path=path;
 }
 const payload={wedding_id:admin.weddingId,name,role_label:role,category:val(f,"category",100)||"Outros",description:val(f,"description")||null,image_path:image_path||null,sort_order:order(f),is_published:selected(f,"is_published")};
 const result=id?await db.from("special_people").update(payload).eq("id",id).eq("wedding_id",admin.weddingId):await db.from("special_people").insert(payload);
 if(result.error&&image_path&&image_path!==previousImagePath){
  await db.storage.from("wedding-media").remove([image_path]);
 }
 go(result.error?"database":undefined);
}
export async function saveFaq(f:FormData){
 const {admin,db}=await context();const id=val(f,"id");const question=val(f,"question",500);const answer=val(f,"answer",4000);
 if(!question||!answer)go("fields");const payload={wedding_id:admin.weddingId,question,answer,sort_order:order(f),is_active:selected(f,"is_active")};
 const result=id?await db.from("faqs").update(payload).eq("id",id).eq("wedding_id",admin.weddingId):await db.from("faqs").insert(payload);go(result.error?"database":undefined);
}
export async function saveHotel(f:FormData){
 const {admin,db}=await context();const id=val(f,"id");const name=val(f,"name",150),url=val(f,"website_url",1000);
 if(!name||!validUrl(url))go("fields");
 const payload={wedding_id:admin.weddingId,name,address:val(f,"address",500)||null,notes:val(f,"notes")||null,website_url:url||null,sort_order:order(f),is_published:selected(f,"is_published")};
 const result=id?await db.from("recommended_hotels").update(payload).eq("id",id).eq("wedding_id",admin.weddingId):await db.from("recommended_hotels").insert(payload);go(result.error?"database":undefined);
}
export async function deleteInfoItem(f:FormData){
 const {admin,db}=await context();const table=val(f,"table");const id=val(f,"id");
 if(!["special_people","faqs","recommended_hotels"].includes(table)||!/^[0-9a-f-]{36}$/i.test(id))go("fields");
 const {error}=await db.from(table).delete().eq("wedding_id",admin.weddingId).eq("id",id);go(error?"database":undefined);
}

