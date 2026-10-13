import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata = { title: "Confirmar presença" };

export default async function RsvpPage() {
  if (!(await getAppearance()).visible.rsvp) notFound();
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-3xl">
        <SectionTitle eyebrow="RSVP" title="Confirme sua presença" description="O fluxo definitivo será por convite/grupo familiar. A estrutura de banco já está preparada sem expor a lista de convidados." />
        <div className="card-soft mt-10 p-7 sm:p-10">
          <label htmlFor="guest-search" className="text-sm font-semibold">Encontre seu convite</label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input id="guest-search" disabled placeholder="Busca será ativada na Fase 3" className="min-h-12 flex-1 rounded-full border border-line bg-background px-5 text-sm text-muted" />
            <button disabled className="min-h-12 rounded-full bg-brand px-6 text-sm font-semibold text-white opacity-60">Buscar convite</button>
          </div>
        </div>
      </div>
    </section>
  );
}
