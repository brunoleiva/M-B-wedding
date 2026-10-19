"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weddingSettingsSchema, weddingSettingsKeys } from "@/validation/wedding-settings";

export async function saveWeddingSettings(form: FormData) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login?error=unauthorized");
  const parsed = weddingSettingsSchema.safeParse(Object.fromEntries(
    weddingSettingsKeys.map(key => [key, form.get(key) ?? ""])
  ));
  if (!parsed.success) {
    // Expor apenas os nomes dos campos, nunca dados digitados pelo usuário.
    const fields = [...new Set(parsed.error.issues.map(issue => String(issue.path[0] ?? "form")))];
    const fieldNames = fields.join(",");
    redirect(`/admin/configuracoes?error=invalid_fields&fields=${encodeURIComponent(fieldNames)}`);
  }
  const values = parsed.data;
  // Construct the event instant from local wall time in the configured timezone.
  // Offset is computed using Intl, independent from the deployment server timezone.
  let eventAt: string;
  try {
    const naive = Date.parse(`${values.date}T${values.time}:00Z`);
    const offsetAt = (timestamp: number) => {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: values.timezone, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" }).formatToParts(new Date(timestamp));
      const get = (name: string) => Number(parts.find(p => p.type === name)?.value);
      const local = Date.UTC(get("year"),get("month")-1,get("day"),get("hour"),get("minute"));
      return local - timestamp;
    };
    const provisional = naive - offsetAt(naive);
    const timestamp = naive - offsetAt(provisional);
    const check = new Intl.DateTimeFormat("en-CA", { timeZone: values.timezone, year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23" }).formatToParts(new Date(timestamp));
    const field = (name: string) => check.find(p => p.type === name)?.value;
    if (`${field("year")}-${field("month")}-${field("day")}T${field("hour")}:${field("minute")}` !== `${values.date}T${values.time}`) throw Error("Invalid local datetime");
    eventAt = new Date(timestamp).toISOString();
  } catch { redirect("/admin/configuracoes?error=invalid_timezone_or_date"); }
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/configuracoes?error=database");
  const photo = form.get("heroImage");
  let heroImagePath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(photo.type) || photo.size > 5 * 1024 * 1024) redirect("/admin/configuracoes?error=invalid_image");
    const extension = photo.type === "image/jpeg" ? "jpg" : photo.type === "image/png" ? "png" : "webp";
    const path = `${context.weddingId}/hero/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("wedding-media").upload(path, photo, { contentType: photo.type, upsert: false });
    if (error) redirect("/admin/configuracoes?error=upload");
    heroImagePath = path;
  }
  const { error } = await supabase.from("weddings").update({
    first_name: values.firstName, second_name: values.secondName, city: values.city,
    event_at: eventAt, timezone: values.timezone, hero_subtitle: values.heroMessage || null,
    ...(heroImagePath ? { hero_image_path: heroImagePath } : {}),
  }).eq("id",context.weddingId);
  if (error) {
    if(heroImagePath)await supabase.storage.from("wedding-media").remove([heroImagePath]);
    redirect("/admin/configuracoes?error=database");
  }
  // Local ainda não definido: não criar registro fictício nem exigir preenchimento.
  // Se houver um local antigo, despublicá-lo para não mostrar dados desatualizados.
  const { data: venue, error: venueLookupError } = await supabase.from("venues")
    .select("id").eq("wedding_id", context.weddingId).order("created_at").limit(1).maybeSingle();
  if (venueLookupError) redirect("/admin/configuracoes?error=venue");
  const hasVenue = Boolean(values.venueName && values.venueAddress);
  if (!hasVenue && venue) {
    const { error: hideError } = await supabase.from("venues")
      .update({ is_published: false }).eq("id", venue.id).eq("wedding_id", context.weddingId);
    if (hideError) redirect("/admin/configuracoes?error=venue");
  } else if (hasVenue) {
    const venuePayload = {
      name: values.venueName, address: values.venueAddress,
      description: values.venueDescription, starts_at: eventAt, is_published: true,
    };
    const venueResult = venue
      ? await supabase.from("venues").update(venuePayload).eq("id", venue.id).eq("wedding_id", context.weddingId)
      : await supabase.from("venues").insert({ ...venuePayload, wedding_id: context.weddingId, kind: "both" });
    if (venueResult.error) redirect("/admin/configuracoes?error=venue");
  }
  revalidatePath("/", "layout");
  redirect("/admin/configuracoes?saved=1");
}
