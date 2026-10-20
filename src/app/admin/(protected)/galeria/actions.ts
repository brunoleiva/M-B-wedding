"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function addPhoto(form: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Sua sessão expirou. Faça login novamente." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Serviço indisponível." };
  const path = String(form.get("path") ?? "");
  const alt = String(form.get("alt") ?? "").trim();
  const caption = String(form.get("caption") ?? "").trim();
  // Somente caminhos de uploads nesta galeria do casamento autenticado.
  const prefix = `${ctx.weddingId}/gallery/`;
  const suffix = path.startsWith(prefix) ? path.slice(prefix.length) : "";
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(suffix) ||
      !alt || alt.length > 200 || caption.length > 500) {
    return { ok: false, error: "Dados da foto inválidos." };
  }
  const { error } = await supabase.from("gallery_images").insert({
    wedding_id: ctx.weddingId, storage_path: path,
    alt_text: alt, caption: caption || null, is_published: true
  });
  if (error) return { ok: false, error: "Falha ao registrar a foto." };
  revalidatePath("/"); revalidatePath("/fotos"); revalidatePath("/admin/galeria");
  return { ok: true };
}

export async function updatePhoto(form: FormData) {
  const ctx = await getAdminContext(); if (!ctx) redirect("/admin/login");
  const supabase = await createSupabaseServerClient(); if (!supabase) redirect("/admin/galeria?error=database");
  const id = String(form.get("id")??""); const alt=String(form.get("alt")??"").trim(); const caption=String(form.get("caption")??"").trim(); const sort=Number(form.get("sort")??0);
  if (!id || !alt || alt.length>200 || caption.length>500 || !Number.isSafeInteger(sort) || sort<0 || sort>100000) redirect("/admin/galeria?error=invalid_fields");
  const cover=form.get("cover")==="on";
  // A troca da capa e a edição são atômicas no banco.
  const {data:active,error:lookupError}=await supabase.from("gallery_images").select("id").eq("id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).maybeSingle();
  if(lookupError||!active)redirect("/admin/galeria?error=database");
  const {error}=await supabase.rpc("update_gallery_photo_atomic",{
    p_image_id:id,p_alt:alt,p_caption:caption||null,p_sort_order:sort,
    p_is_cover:cover,p_is_published:form.get("published")==="on"
  });
  if(error)redirect("/admin/galeria?error=database");
  revalidatePath("/"); revalidatePath("/fotos");redirect("/admin/galeria?saved=1");
}

export async function deletePhoto(form: FormData) {
  const ctx=await getAdminContext(); if(!ctx) redirect("/admin/login");
  const supabase=await createSupabaseServerClient(); if(!supabase) redirect("/admin/galeria?error=database");
  const id=String(form.get("id")??""); if(!id) redirect("/admin/galeria?error=invalid_fields");
  // Mantem os bytes no Storage para restauracao futura e auditoria.
  const {data,error}=await supabase.from("gallery_images").update({deleted_at:new Date().toISOString(),is_published:false,is_cover:false}).eq("id",id).eq("wedding_id",ctx.weddingId).is("deleted_at",null).select("id").maybeSingle();
  if(error||!data) redirect("/admin/galeria?error=database");
  revalidatePath("/");revalidatePath("/fotos");redirect("/admin/galeria?removed=1");
}
