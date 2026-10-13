import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import { WeddingDetails } from "@/components/public/wedding-details";
import { getPublishedEventDetails } from "@/services/wedding/event-details";

export const metadata = { title: "O casamento" };

export default async function WeddingPage() {
  if(!(await getAppearance()).visible.casamento) notFound();
  const {venues, schedule, timezone} = await getPublishedEventDetails();
  return <section className="section-space pt-32"><div className="page-shell max-w-5xl"><SectionTitle eyebrow="O casamento" title="Tudo o que você precisa saber" description="Os detalhes para celebrarmos juntos." />
    <div className="mt-12">{venues.length || schedule.length ? <WeddingDetails venues={venues} schedule={schedule} timezone={timezone}/> : <div className="card-soft p-10 text-center text-muted">Em breve compartilharemos os detalhes da cerimônia e da festa.</div>}</div>
  </div></section>;
}
