import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { moderateMessage } from "./actions";
import { SubmitButton } from "@/components/shared/submit-button";

export default async function AdminMessages({ searchParams }: { searchParams: Promise<{ status?: string; error?: string; saved?: string }> }) {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const params = await searchParams;
  const status = ["pending", "approved", "rejected"].includes(params.status ?? "") ? params.status! : "pending";
  const db = await createSupabaseServerClient();
  const { data: messages } = db ? await db.from("guest_messages")
    .select("id,guest_name,message,status,created_at").eq("wedding_id", ctx.weddingId)
    .eq("status", status).order("created_at", { ascending: false }).limit(150) : { data: [] };
  const filters = [["pending", "Pendentes"], ["approved", "Aprovados"], ["rejected", "Rejeitados"]] as const;
  return <div className="space-y-6">
    <div><p className="eyebrow">Moderação</p><h1 className="font-editorial text-5xl">Recados dos convidados</h1><p className="mt-3 text-muted">Somente os recados aprovados aparecem no site público.</p></div>
    {params.error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-900">Não foi possível atualizar o recado.</p>}
    {params.saved && <p role="status" className="rounded-lg bg-green-50 p-4 text-green-900">Recado atualizado.</p>}
    <nav aria-label="Filtrar recados" className="flex flex-wrap gap-2">{filters.map(([value, label]) => <a key={value} href={`/admin/recados?status=${value}`} aria-current={status === value ? "page" : undefined} className={`rounded-full border px-4 py-2 font-semibold ${status === value ? "bg-[#24261f] text-white" : "bg-white"}`}>{label}</a>)}</nav>
    <div className="space-y-3">{(messages ?? []).map(item => <article key={item.id} className="card-soft p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold break-words">{item.guest_name}</h2><time className="text-sm text-muted" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</time></div>
      <p className="mt-3 whitespace-pre-wrap break-words">{item.message}</p>
      <div className="mt-5 flex flex-wrap gap-3">{status !== "approved" && <form action={moderateMessage}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value="approved"/><SubmitButton pendingLabel="Salvando..." className="admin-btn admin-btn--primary">Aprovar</SubmitButton></form>}
      {status !== "rejected" && <form action={moderateMessage}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value="rejected"/><SubmitButton pendingLabel="Salvando..." className="admin-btn admin-btn--danger">Rejeitar</SubmitButton></form>}</div>
    </article>)}{!messages?.length && <p className="card-soft p-6 text-muted">Nenhum recado nesta categoria.</p>}</div>
    {(messages?.length ?? 0) === 150 && <p className="text-sm text-muted">Exibindo os 150 recados mais recentes deste filtro.</p>}
  </div>;
}
