import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/services/admin/dashboard";

// All routes in this protected area require request-scoped authentication.
// Never prerender them without the visitor's session during next build.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login?error=unauthorized");

  const supabase = await createSupabaseServerClient();
  const { data: wedding } = supabase
    ? await supabase.from("weddings").select("first_name,second_name").eq("id",context.weddingId).maybeSingle()
    : { data: null };
  const initials = wedding?.first_name && wedding?.second_name
    ? `${wedding.first_name.trim().charAt(0).toLocaleUpperCase("pt-BR")} & ${wedding.second_name.trim().charAt(0).toLocaleUpperCase("pt-BR")}`
    : "M & B";
  return <AdminShell email={context.email} initials={initials}>{children}</AdminShell>;
}
