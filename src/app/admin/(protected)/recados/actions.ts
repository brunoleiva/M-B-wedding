"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function moderateMessage(form: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !["approved", "rejected"].includes(status)) redirect("/admin/recados?error=invalid");
  const db = await createSupabaseServerClient();
  if (!db) redirect("/admin/recados?error=database");
  const { data, error } = await db.from("guest_messages").update({ status })
    .eq("id", id).eq("wedding_id", ctx.weddingId).select("id").maybeSingle();
  if (error || !data) redirect("/admin/recados?error=database");
  revalidatePath("/recados");
  revalidatePath("/admin");
  revalidatePath("/admin/recados");
  redirect(`/admin/recados?saved=1`);
}
