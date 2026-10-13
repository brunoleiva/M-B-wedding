"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function saveStory(form: FormData) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const year = String(form.get("year") ?? "").trim();
  const id = String(form.get("id") ?? "");
  const sort = Number(form.get("sort") ?? 0);
  if (!title || title.length > 150 || description.length > 3000 || year.length > 24 || !Number.isSafeInteger(sort) || sort < 0 || sort > 100000) redirect("/admin/conteudo?error=invalid_fields");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/conteudo?error=database");
  const values = { title, description, year_label: year || null, sort_order: sort, is_published: form.get("published") === "on" };
  const result = id ? await supabase.from("story_events").update(values).eq("id", id).eq("wedding_id", context.weddingId) : await supabase.from("story_events").insert({ ...values, wedding_id: context.weddingId });
  if (result.error) redirect("/admin/conteudo?error=database");
  revalidatePath("/"); revalidatePath("/historia");
  redirect("/admin/conteudo?saved=1");
}

export async function removeStory(form: FormData) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login");
  const id = String(form.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !id) redirect("/admin/conteudo?error=database");
  const { error } = await supabase.from("story_events").delete().eq("id",id).eq("wedding_id",context.weddingId);
  if (error) redirect("/admin/conteudo?error=database");
  revalidatePath("/"); revalidatePath("/historia"); redirect("/admin/conteudo?removed=1");
}
