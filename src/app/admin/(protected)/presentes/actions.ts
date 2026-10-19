"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const base="/admin/presentes";
const read=(fd:FormData,key:string)=>String(fd.get(key)??"").trim();
const uuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const slugify=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90);
function refresh(){revalidatePath(base);revalidatePath("/presentes");}
async function context(){const ctx=await getAdminContext();if(!ctx)redirect("/admin/login?error=unauthorized");const db=await createSupabaseServerClient();if(!db)redirect(`${base}?error=db`);return {ctx,db};}

export async function saveGift(fd:FormData){
 const {ctx,db}=await context();
 const id=read(fd,"id"),title=read(fd,"title"),slug=slugify(read(fd,"slug")||title),description=read(fd,"description"),category=read(fd,"category_id");
 const price=read(fd,"amount");const parsed=/^\d{1,7}(?:[.,]\d{1,2})?$/.test(price)?Number(price.replace(",",".")):NaN;
 const amount=Math.round(parsed*100);
 const kind=read(fd,"gift_kind"),availability="unlimited",quantity=null;
 const order=Number(read(fd,"sort_order")||0);
 const target=id?`${base}/${id}`:`${base}/novo`;
 if((id&&!uuid(id))||!title||title.length>160||!slug||description.length>3000||!Number.isSafeInteger(amount)||amount<100||amount>999999999||!["symbolic","physical","contribution"].includes(kind)||!Number.isSafeInteger(order)||order<0||order>100000||(category&&!uuid(category)))redirect(`${target}?error=fields`);
 if(category){const {data}=await db.from("gift_categories").select("id").eq("wedding_id",ctx.weddingId).eq("id",category).maybeSingle();if(!data)redirect(`${target}?error=category`);}
 let previous:string|null=null;
 if(id){const {data}=await db.from("gifts").select("image_path").eq("wedding_id",ctx.weddingId).eq("id",id).is("deleted_at",null).maybeSingle();if(!data)redirect(`${base}?error=missing`);previous=data.image_path;}
 const upload=fd.get("image");let imagePath=previous;let newImage:string|null=null;
 if(upload instanceof File&&upload.size>0){
  if(upload.size>5*1024*1024||!["image/jpeg","image/png","image/webp"].includes(upload.type))redirect(`${target}?error=image`);
  const ext=upload.type==="image/jpeg"?"jpg":upload.type==="image/png"?"png":"webp";
  newImage=`${ctx.weddingId}/gifts/${crypto.randomUUID()}.${ext}`;
  const {error}=await db.storage.from("wedding-media").upload(newImage,upload,{contentType:upload.type,upsert:false});
  if(error)redirect(`${target}?error=upload`);
  imagePath=newImage;
 }
 const payload={title,slug,description:description||null,category_id:category||null,image_path:imagePath,amount_cents:amount,gift_kind:kind,availability_kind:availability,quantity_total:quantity,sort_order:order,is_featured:fd.get("is_featured")==="on",is_active:fd.get("is_active")==="on"};
 const result=id?await db.from("gifts").update(payload).eq("id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).select("id").maybeSingle():await db.from("gifts").insert({...payload,wedding_id:ctx.weddingId}).select("id").maybeSingle();
 if(result.error||!result.data){if(newImage)await db.storage.from("wedding-media").remove([newImage]);redirect(`${target}?error=save`);}
 refresh();redirect(`${base}?saved=gift`);
}

export async function archiveGift(fd:FormData){const {ctx,db}=await context();const id=read(fd,"id");if(!uuid(id))redirect(`${base}?error=fields`);const {data,error}=await db.from("gifts").update({deleted_at:new Date().toISOString(),is_active:false}).eq("wedding_id",ctx.weddingId).eq("id",id).is("deleted_at",null).select("id").maybeSingle();if(error||!data)redirect(`${base}?error=save`);refresh();redirect(`${base}?removed=gift`);}

export async function saveGiftCategory(fd:FormData){
 const {ctx,db}=await context();const id=read(fd,"id"),name=read(fd,"name"),slug=slugify(read(fd,"slug")||name),sort=Number(read(fd,"sort_order")||0);
 if((id&&!uuid(id))||!name||name.length>100||!slug||!Number.isSafeInteger(sort)||sort<0||sort>100000)redirect(`${base}/categorias?error=fields`);
 const payload={name,slug,sort_order:sort};
 const result=id?await db.from("gift_categories").update(payload).eq("wedding_id",ctx.weddingId).eq("id",id).select("id").maybeSingle():await db.from("gift_categories").insert({...payload,wedding_id:ctx.weddingId}).select("id").maybeSingle();
 if(result.error||!result.data)redirect(`${base}/categorias?error=save`);
 refresh();revalidatePath(`${base}/categorias`);redirect(`${base}/categorias?saved=category`);
}

export async function deleteGiftCategory(fd:FormData){const {ctx,db}=await context();const id=read(fd,"id");if(!uuid(id))redirect(`${base}/categorias?error=fields`);const {count,error:ce}=await db.from("gifts").select("id",{count:"exact",head:true}).eq("wedding_id",ctx.weddingId).eq("category_id",id).is("deleted_at",null);if(ce||count===null)redirect(`${base}/categorias?error=db`);if(count>0)redirect(`${base}/categorias?error=used`);const {error}=await db.from("gift_categories").delete().eq("wedding_id",ctx.weddingId).eq("id",id);if(error)redirect(`${base}/categorias?error=save`);refresh();revalidatePath(`${base}/categorias`);redirect(`${base}/categorias?removed=category`);}

export async function savePixSettings(fd:FormData){
 const {ctx,db}=await context();const name=read(fd,"pix_receiver_name"),key=read(fd,"pix_key"),city=read(fd,"pix_city"),intro=read(fd,"gift_intro"),thanks=read(fd,"gift_thank_you");const minutes=Number(read(fd,"gift_reservation_minutes")||30);
 if(name.length>150||key.length>160||city.length>80||intro.length>2000||thanks.length>2000||!Number.isSafeInteger(minutes)||minutes<5||minutes>1440)redirect(`${base}/configuracoes?error=fields`);
 const {error}=await db.from("wedding_private_settings").upsert({wedding_id:ctx.weddingId,pix_receiver_name:name||null,pix_key:key||null,pix_city:city||null,gift_intro:intro||null,gift_thank_you:thanks||null,gift_reservation_minutes:minutes,gifts_enabled:fd.get("gifts_enabled")==="on"},{onConflict:"wedding_id"});
 if(error)redirect(`${base}/configuracoes?error=save`);
 refresh();redirect(`${base}/configuracoes?saved=settings`);
}
