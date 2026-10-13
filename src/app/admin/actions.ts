"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/validation/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) redirect("/admin/login?error=invalid_fields");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=supabase_not_configured");

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) redirect("/admin/login?error=invalid_credentials");

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
