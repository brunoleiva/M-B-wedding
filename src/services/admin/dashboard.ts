import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cache } from "react";

export type AdminContext = {
  email: string;
  weddingId: string;
};

export type DashboardStats = {
  guests: number;
  attending: number;
  pending: number;
  giftsReceived: number;
  pendingMessages: number;
  songSuggestions: number;
};

export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user?.email) return null;

  const { data: membership } = await supabase
    .from("admin_memberships")
    .select("wedding_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;
  return { email: user.email, weddingId: membership.wedding_id as string };
});

export async function getDashboardStats(weddingId: string): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      guests: 0,
      attending: 0,
      pending: 0,
      giftsReceived: 0,
      pendingMessages: 0,
      songSuggestions: 0,
    };
  }

  const [guestsResult, attendingResult, pendingResult, giftsResult, messagesResult, songsResult] =
    await Promise.all([
      supabase
        .from("guests")
        .select("id, guest_groups!inner(id)", { count: "exact", head: true })
        .is("guest_groups.deleted_at", null)
        .eq("wedding_id", weddingId)
        .is("deleted_at", null),
      supabase
        .from("guests")
        .select("id, guest_groups!inner(id)", { count: "exact", head: true })
        .is("guest_groups.deleted_at", null)
        .eq("wedding_id", weddingId)
        .eq("rsvp_status", "attending")
        .is("deleted_at", null),
      supabase
        .from("guests")
        .select("id, guest_groups!inner(id)", { count: "exact", head: true })
        .is("guest_groups.deleted_at", null)
        .eq("wedding_id", weddingId)
        .eq("rsvp_status", "pending")
        .is("deleted_at", null),
      supabase
        .from("gift_payments")
        .select("amount_cents")
        .eq("wedding_id", weddingId)
        .eq("status", "confirmed")
        .is("deleted_at", null),
      supabase
        .from("guest_messages")
        .select("id", { count: "exact", head: true })
        .eq("wedding_id", weddingId)
        .eq("status", "pending"),
      supabase
        .from("song_suggestions")
        .select("id", { count: "exact", head: true })
        .eq("wedding_id", weddingId),
    ]);

  const giftsReceived = (giftsResult.data ?? []).reduce(
    (sum, item) => sum + Number(item.amount_cents ?? 0),
    0,
  );

  return {
    guests: guestsResult.count ?? 0,
    attending: attendingResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    giftsReceived,
    pendingMessages: messagesResult.count ?? 0,
    songSuggestions: songsResult.count ?? 0,
  };
}
