import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppearance } from "@/services/wedding/appearance";
import { InviteForm } from "./invite-form";
import type { GuestStatus } from "@/services/rsvp/types";

export const metadata = { title: "Convite privado", robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
type InviteGuest = { id: string; name: string; status: GuestStatus; kind: string; note: string | null };

export default async function Invitation({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { token } = await params;
  const query = await searchParams;
  if (!/^[a-f0-9]{48}$/.test(token)) notFound();
  if (!(await getAppearance()).visible.rsvp) notFound();
  const db = await createSupabaseServerClient();
  if (!db) notFound();
  const { data, error } = await db.rpc("invitation_details", { invite_token: token });
  if (error || !data || typeof data !== "object" || !("guests" in data) || !Array.isArray(data.guests)) notFound();
  const family = String(data.family ?? "Seu convite");
  const guests = data.guests as InviteGuest[];
  return <section className="section-space public-inner-page"><div className="page-shell max-w-3xl">
    <p className="eyebrow">Convite exclusivo</p>
    <h1 className="font-editorial text-5xl">{family}</h1>
    <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">Estamos muito felizes em convidar vocês para celebrar com Maysa & Bruno. Confirme a presença de cada pessoa abaixo.</p>
    <InviteForm token={token} guests={guests} saved={query.saved === "1"} error={Boolean(query.error)} />
    <p className="mt-5 text-base text-muted">Este link é pessoal. Não o compartilhe publicamente.</p>
  </div></section>;
}
