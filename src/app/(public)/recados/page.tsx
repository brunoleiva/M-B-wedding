import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
  const published = messages ?? [];

  return (
    <section className="section-space public-inner-page">
      <div className="page-shell mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Palavras que ficam</p>
          <div aria-hidden="true" className="mx-auto mt-5 text-3xl text-[#a87655]">♡</div>
          <h1 className="font-editorial mt-4 text-5xl leading-tight sm:text-6xl">Todo carinho vira memória</h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
            O amor também mora nas palavras. Aqui guardamos os desejos, as lembranças
            e o carinho de quem faz parte da nossa história.
          </p>
          <a href="#escrever-recado" className="focus-ring mt-7 inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold transition hover:bg-[#f0e9de]">
            Deixar uma mensagem <span aria-hidden="true" className="ml-2">↗</span>
          </a>
        </header>

        {params.sent === "1" && <p role="status" className="mx-auto mt-8 max-w-2xl rounded-xl border border-green-300 bg-green-50 p-4 text-center text-green-900">Recebemos seu carinho! Seu recado aparecerá aqui depois da aprovação.</p>}
        {params.error && <p role="alert" className="mx-auto mt-8 max-w-2xl rounded-xl border border-red-300 bg-red-50 p-4 text-center text-red-900">Não foi possível enviar o recado. Confira os campos e tente novamente.</p>}

        <div className="mt-16 sm:mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
            <div>
              <p className="eyebrow">Com amor, para Maysa & Bruno</p>
              <h2 className="font-editorial mt-2 text-4xl sm:text-5xl">Mensagens de carinho</h2>
            </div>
            {published.length > 0 && <p className="text-sm text-muted">{published.length} {published.length === 1 ? "recado publicado" : "recados publicados"}</p>}
          </div>
          {published.length > 0 ? (
            <div className="grid items-start gap-5 md:grid-cols-2 xl:gap-7">
              {published.map((item, index) => (
                <article key={item.id} className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[#e7ddd0] p-7 shadow-[0_12px_35px_rgba(43,34,25,0.05)] sm:p-9 ${index % 3 === 1 ? "bg-[#f3ece2]" : "bg-[#fffdfa]"}`}>
                  <div aria-hidden="true" className="font-editorial text-7xl leading-none text-[#ad9177]/60">“</div>
                  <p className="mt-1 whitespace-pre-wrap break-words font-editorial text-[1.4rem] leading-[1.6] text-[#382e28] sm:text-[1.6rem]">{item.message}</p>
                  <div className="mt-8 flex items-end justify-between gap-4 border-t border-[#dfd3c5] pt-5">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold tracking-wide text-[#44372f]">Com carinho, {item.guest_name}</p>
                      <time className="mt-1 block text-xs text-muted" dateTime={item.created_at}>
                        {new Date(item.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" })}
                      </time>
                    </div>
                    <span aria-hidden="true" className="shrink-0 text-2xl text-[#a87655]">♡</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#e7ddd0] bg-[#fffdfa] px-6 py-14 text-center sm:py-20">
              <p aria-hidden="true" className="font-editorial text-6xl text-[#ad9177]">“</p>
              <h3 className="font-editorial mt-3 text-3xl">As primeiras palavras ainda estão por vir</h3>
              <p className="mx-auto mt-3 max-w-md leading-7 text-muted">Cada recado será uma lembrança especial. Que tal deixar o primeiro?</p>
              <a href="#escrever-recado" className="focus-ring mt-6 inline-block rounded-full border border-line px-6 py-3 text-sm font-semibold">Escrever o primeiro recado</a>
            </div>
          )}
        </div>

        <section id="escrever-recado" className="mt-20 scroll-mt-24 rounded-[2rem] border border-[#e5dacd] bg-[#efe7dc] px-5 py-10 sm:mt-24 sm:px-10 sm:py-14">
          <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <div className="self-center">
              <p className="eyebrow">Faça parte desta página</p>
              <h2 className="font-editorial mt-4 text-4xl leading-tight sm:text-5xl">Deixe suas palavras com a gente</h2>
              <p className="mt-5 max-w-sm leading-8 text-[#67584b]">
                Uma lembrança, um desejo, uma mensagem do coração. Vamos guardar cada palavra com muito carinho.
              </p>
              <p aria-hidden="true" className="mt-7 font-editorial text-4xl text-[#aa8a70]">Com amor, M & B ♡</p>
            </div>
            <form action={sendMessage} className="grid gap-5 rounded-3xl border border-[#e4d9cb] bg-[#fffdfa] p-5 shadow-sm sm:p-8">
              <label className="text-sm font-semibold text-[#44372f]">Seu nome *
                <input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" className="focus-ring mt-2 block w-full rounded-xl border border-[#d8c9b8] bg-white px-4 py-3 font-normal" />
              </label>
              <label className="text-sm font-semibold text-[#44372f]">Sua mensagem *
                <textarea name="message" required minLength={2} maxLength={1500} rows={6} placeholder="Escreva aqui seu recado para os noivos..." className="focus-ring mt-2 block w-full resize-y rounded-xl border border-[#d8c9b8] bg-white px-4 py-3 font-normal" />
              </label>
              <div className="hidden" aria-hidden="true"><label>Site<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <p className="text-xs leading-6 text-muted">Até 1.500 caracteres. Para preservar este espaço, as mensagens são publicadas após aprovação.</p>
              <SubmitButton pendingLabel="Enviando carinho..." className="admin-btn admin-btn--primary w-full justify-center sm:w-auto">Enviar com carinho ♡</SubmitButton>
            </form>
          </div>
        </section>
      </div>
    </section>
  );
}
