import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import Link from "next/link";
export const metadata={title:"Confirmar presença"};
export default async function RsvpPage(){
 if(!(await getAppearance()).visible.rsvp)notFound();
 return <section className="section-space public-inner-page"><div className="page-shell max-w-3xl"><SectionTitle eyebrow="RSVP" title="Confirme sua presença" description="Para preservar a privacidade dos convidados, cada família recebe um link exclusivo para confirmar suas presenças."/><div className="card-soft mt-8 p-6 sm:mt-10 sm:p-10"><h2 className="text-2xl font-semibold">Recebeu seu convite?</h2><p className="mt-4 text-base leading-8 text-muted">Abra o link exclusivo enviado pelos noivos ou pelo cerimonial. Lá você poderá responder por cada integrante do convite.</p><p className="mt-6 rounded-xl bg-surface-muted p-4 text-base leading-7 text-muted">Não recebeu seu link? Entre em contato com os noivos ou com a assessoria.</p><Link href="/" className="focus-ring mt-7 inline-flex min-h-12 items-center rounded-full border border-line px-6 py-3 text-base font-semibold transition hover:bg-surface-muted">Voltar para Home</Link></div></div></section>;
}
