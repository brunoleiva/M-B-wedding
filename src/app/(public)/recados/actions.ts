"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppearance } from "@/services/wedding/appearance";

export async function sendMessage(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (form.get("website")) redirect("/recados?sent=1");
  if (name.length < 2 || name.length > 100 || message.length < 2 || message.length > 1500 || /[<>]/.test(name)) {
    redirect("/recados?error=invalid");
  }
  if (!(await getAppearance()).visible.recados) redirect("/");
  const db = await createSupabaseServerClient();
  if (!db) redirect("/recados?error=database");
  const { data: wedding } = await db.from("weddings").select("id").eq("is_published", true).order("created_at").limit(1).maybeSingle();
  if (!wedding) redirect("/recados?error=database");
  const { error } = await db.from("guest_messages").insert({
    wedding_id: wedding.id, guest_name: name, message, status: "pending"
  });
  if (error) redirect("/recados?error=database");
  revalidatePath("/admin/recados");
  redirect("/recados?sent=1");
}
