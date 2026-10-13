import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import Link from "next/link";
export const metadata={title:"Confirmar presença"};
export default async function RsvpPage(){
 if(!(await getAppearance()).visible.rsvp)notFound();
 return <section className="section-space public-inner-page"><div className="page-shell max-w-3xl"><SectionTitle eyebrow="RSVP" title="Confirme sua presença" description="Para preservar a privacidade dos convidados, cada família recebe um link exclusivo para confirmar suas presenças."/><div className="card-soft mt-10 p-7 sm:p-10"><h2 className="text-xl font-semibold">Recebeu seu convite?</h2><p className="mt-3 text-muted">Abra o link exclusivo enviado pelos noivos ou pelo cerimonial. Lá você poderá responder por cada integrante do convite.</p><p className="mt-5 text-sm text-muted">Não recebeu seu link? Entre em contato com os noivos ou com a assessoria.</p><Link href="/" className="mt-6 inline-flex rounded-full border px-5 py-3 font-semibold transition hover:bg-white">Voltar para Home</Link></div></div></section>;
}
