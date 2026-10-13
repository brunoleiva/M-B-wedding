import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminContext } from "@/services/admin/dashboard";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getAdminContext();
  if (!context) redirect("/admin/login?error=unauthorized");

  return <AdminShell email={context.email}>{children}</AdminShell>;
}
