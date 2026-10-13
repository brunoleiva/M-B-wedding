import { SectionTitle } from "@/components/ui/section-title";
import { getPublicWedding } from "@/services/wedding/public";

export const metadata = { title: "O casamento" };

export default async function WeddingPage() {
  const wedding = await getPublicWedding();
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-5xl">
        <SectionTitle eyebrow="O casamento" title="Tudo o que você precisa saber" description="Confira as informações que já estão disponíveis sobre o nosso grande dia." />
        <div className="card-soft mt-12 p-8 sm:p-12">
          <p className="eyebrow">{wedding.venue.name}</p>
          <h2 className="font-editorial mt-3 text-4xl">{wedding.displayDate} · {wedding.venue.time}</h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted">{wedding.venue.description}</p>
          <p className="mt-6 font-semibold">{wedding.venue.address}</p>
        </div>
      </div>
    </section>
  );
}
