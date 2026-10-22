import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SectionTitle } from "@/components/ui/section-title";
import { sendMessage } from "./actions";
import { SubmitButton } from "@/components/shared/submit-button";

export const metadata = { title: "Recados" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  if (!(await getAppearance()).visible.recados) notFound();
  const params = await searchParams;
  const db = await createSupabaseServerClient();
  const { data: wedding } = db ? await db.from("weddings").select("id").eq("is_published", true).order("created_at").limit(1).maybeSingle() : { data: null };
  const { data: messages } = wedding && db ? await db.from("guest_messages")
    .select("id,guest_name,message,created_at").eq("wedding_id", wedding.id).eq("status", "approved")
    .order("created_at", { ascending: false }).limit(100) : { data: [] };

  return (
    <section className="section-space public-inner-page">
      <div className="page-shell max-w-4xl">
        <SectionTitle eyebrow="Recados" title="Deixe um carinho para nós" description="Compartilhe uma mensagem especial com Maysa e Bruno. Os recados aparecem aqui depois da aprovação." />
        {params.sent === "1" && <p role="status" className="mt-8 rounded-xl border border-green-300 bg-green-50 p-4 text-green-900">Recado enviado! Ele aparecerá aqui depois da aprovação.</p>}
        {params.error && <p role="alert" className="mt-8 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">Não foi possível enviar o recado. Confira os campos e tente novamente.</p>}
        <form action={sendMessage} className="card-soft mt-8 grid gap-4 p-5 sm:p-8">
          <h2 className="font-editorial text-3xl">Escreva seu recado</h2>
          <label className="text-sm font-semibold">Seu nome *<input name="name" required minLength={2} maxLength={100} autoComplete="name" className="mt-2 block w-full rounded-xl border border-line bg-white p-3 font-normal" /></label>
          <label className="text-sm font-semibold">Sua mensagem *<textarea name="message" required minLength={2} maxLength={1500} rows={5} className="mt-2 block w-full rounded-xl border border-line bg-white p-3 font-normal" /></label>
          <div className="hidden" aria-hidden="true"><label>Site<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <p className="text-sm text-muted">Até 1.500 caracteres. Sua mensagem será avaliada antes da publicação.</p>
          <SubmitButton pendingLabel="Enviando..." className="admin-btn admin-btn--primary w-fit">Enviar recado</SubmitButton>
        </form>
        <div className="mt-12 space-y-4">
          <h2 className="font-editorial text-3xl">Mensagens de carinho</h2>
          {(messages ?? []).length ? (messages ?? []).map(item => <article key={item.id} className="card-soft p-5 sm:p-7">
            <p className="whitespace-pre-wrap break-words leading-7">{item.message}</p>
            <p className="mt-4 font-semibold">— {item.guest_name}</p>
            <time className="mt-1 block text-xs text-muted" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</time>
          </article>) : <p className="card-soft p-8 text-center text-muted">Nenhum recado publicado ainda. Seja o primeiro!</p>}
        </div>
      </div>
    </section>
  );
}
