import { SectionTitle } from "@/components/ui/section-title";
import { weddingConfig } from "@/config/wedding";

export const metadata = { title: "O casamento" };

export default function WeddingPage() {
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-5xl">
        <SectionTitle eyebrow="O casamento" title="Tudo o que você precisa saber" description="Cerimônia e recepção acontecerão no mesmo local." />
        <div className="card-soft mt-12 p-8 sm:p-12">
          <p className="eyebrow">{weddingConfig.venue.name}</p>
          <h2 className="font-editorial mt-3 text-4xl">{weddingConfig.event.displayDate} · {weddingConfig.venue.time}</h2>
          <p className="mt-5 max-w-2xl leading-7 text-muted">{weddingConfig.venue.description}</p>
          <p className="mt-6 font-semibold">{weddingConfig.venue.address}</p>
        </div>
      </div>
    </section>
  );
}
