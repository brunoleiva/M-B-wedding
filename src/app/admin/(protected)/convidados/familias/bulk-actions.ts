"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function addGuestsInBulk(form: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?error=unauthorized");
  const groupId = String(form.get("group_id") ?? "");
  if (!uuid.test(groupId)) redirect("/admin/convidados/familias?error=group");
  const back = `/admin/convidados/familias/${groupId}`;
  const raw = String(form.get("names") ?? "");
  const names = raw.split(/\r?\n/).map(name => name.trim()).filter(Boolean);
  const kind = String(form.get("kind") ?? "adult");
  if (!names.length || names.length > 50 || names.some(name => name.length > 180) || !["adult", "child"].includes(kind)) {
    redirect(`${back}?error=bulk_fields`);
  }
  const database = await createSupabaseServerClient();
  if (!database) redirect(`${back}?error=db`);
  const { data: group, error: groupError } = await database.from("guest_groups")
    .select("id").eq("id", groupId).eq("wedding_id", ctx.weddingId)
    .is("deleted_at", null).maybeSingle();
  if (groupError || !group) redirect(`${back}?error=group`);
  // One database request inserts the batch; the family is fixed by the server-side group ID.
  const rows = names.map(full_name => ({
    wedding_id: ctx.weddingId,
    guest_group_id: groupId,
    full_name,
    kind,
    rsvp_status: "pending",
  }));
  const { error } = await database.from("guests").insert(rows);
  if (error) redirect(`${back}?error=db`);
  revalidatePath(back);
  revalidatePath("/admin/convidados");
  revalidatePath("/admin/rsvp");
  revalidatePath("/admin");
  redirect(`${back}?added=${names.length}`);
}
