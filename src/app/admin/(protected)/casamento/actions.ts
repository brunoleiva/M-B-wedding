"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const route = "/admin/casamento";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optional = (value: string) => value || null;
const uuid = (value: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const link = (v: string) => !v || (() => { try { const u = new URL(v); return u.protocol === "https:"; } catch { return false; } })();
function instant(value: string, timezone: string) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return undefined;
  const assumed = Date.parse(value + ":00Z");
  if (!Number.isFinite(assumed)) return undefined;
  try {
    const partsAt = (ts: number) => {
      const parts = new Intl.DateTimeFormat("en-GB", {timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(ts));
      const get = (type: string) => Number(parts.find(x=>x.type===type)?.value);
      return Date.UTC(get("year"),get("month")-1,get("day"),get("hour"),get("minute"));
    };
    const first = assumed - (partsAt(assumed)-assumed);
    const result = assumed - (partsAt(first)-first);
    const date = new Date(result);
    if (partsAt(result) !== assumed || !Number.isFinite(date.valueOf())) return undefined;
    return date.toISOString();
  } catch { return undefined; }
}
async function eventTimezone(db: Awaited<ReturnType<typeof createSupabaseServerClient>>, weddingId: string) {
  if (!db) return "America/Sao_Paulo";
  const { data } = await db.from("weddings").select("timezone").eq("id", weddingId).maybeSingle();
  return data?.timezone || "America/Sao_Paulo";
}
function refreshed() { revalidatePath("/"); revalidatePath("/casamento"); revalidatePath(route); }
async function adminClient() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?error=unauthorized");
  const db = await createSupabaseServerClient();
  if (!db) redirect(route + "?error=database");
  return { ctx, db };
}

export async function saveVenue(form: FormData) {
  const { ctx, db } = await adminClient();
  const id = str(form, "id"), kind = str(form, "kind"), name = str(form, "name"), address = str(form, "address"), description = str(form,"description");
  const google = str(form,"google_maps_url"), waze = str(form,"waze_url");
  const timezone = await eventTimezone(db,ctx.weddingId);
  const startsAt = instant(str(form,"starts_at"),timezone);
  if ((id && !uuid(id)) || !["ceremony","reception","both"].includes(kind) || !name || !address || name.length>160 || address.length>500 || description.length>3000 || !link(google) || !link(waze) || startsAt === undefined) redirect(route + "?error=venue_fields");
  const payload = { kind, name, address, description: optional(description), starts_at: startsAt, google_maps_url: optional(google), waze_url: optional(waze), is_published: form.get("published") === "on" };
  const result = id ? await db.from("venues").update(payload).eq("id", id).eq("wedding_id", ctx.weddingId).select("id").maybeSingle() : await db.from("venues").insert({ ...payload, wedding_id: ctx.weddingId }).select("id").maybeSingle();
  if (result.error || !result.data) redirect(route + "?error=database");
  refreshed(); redirect(route + "?saved=venue");
}
export async function removeVenue(form: FormData) {
  const { ctx, db } = await adminClient();
  const id = str(form,"id");
  if (!uuid(id)) redirect(route + "?error=venue_fields");
  const { data, error } = await db.from("venues").delete().eq("id", id).eq("wedding_id",ctx.weddingId).select("id").maybeSingle();
  if (error || !data) redirect(route + "?error=database");
  refreshed(); redirect(route + "?removed=venue");
}
export async function saveSchedule(form: FormData) {
  const { ctx, db } = await adminClient();
  const id = str(form,"id"), title = str(form,"title"), description = str(form,"description");
  const timezone = await eventTimezone(db,ctx.weddingId);
  const at = instant(str(form,"starts_at"),timezone), order = Number(str(form,"sort_order") || "0");
  if ((id && !uuid(id)) || !title || title.length>150 || description.length>2000 || !at || !Number.isSafeInteger(order) || order < 0 || order>100000) redirect(route + "?error=schedule_fields");
  const payload = { title, description: optional(description), starts_at: at, sort_order: order, is_public: form.get("published") === "on" };
  const result = id ? await db.from("schedule_events").update(payload).eq("id", id).eq("wedding_id",ctx.weddingId).select("id").maybeSingle() : await db.from("schedule_events").insert({...payload, wedding_id:ctx.weddingId}).select("id").maybeSingle();
  if (result.error || !result.data) redirect(route + "?error=database");
  refreshed(); redirect(route + "?saved=schedule");
}
export async function removeSchedule(form: FormData) {
  const { ctx, db } = await adminClient();
  const id = str(form,"id"); if (!uuid(id)) redirect(route + "?error=schedule_fields");
  const { data, error } = await db.from("schedule_events").delete().eq("id",id).eq("wedding_id",ctx.weddingId).select("id").maybeSingle();
  if (error || !data) redirect(route + "?error=database");
  refreshed(); redirect(route + "?removed=schedule");
}
