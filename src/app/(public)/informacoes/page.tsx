import { SectionTitle } from "@/components/ui/section-title";

export const metadata = { title: "Informações" };

export default function InfoPage() {
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-5xl">
        <SectionTitle eyebrow="Informações" title="Para chegar, vestir e aproveitar sem dúvida" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["Traje", "Social. Prefira tons elegantes e evite branco e off-white."],
            ["Chegada", "Sugerimos chegar com 30 minutos de antecedência."],
            ["Transporte", "Estacionamento e orientações detalhadas serão publicados aqui."],
          ].map(([title, text]) => (
            <article key={title} className="card-soft p-7">
              <h2 className="font-editorial text-3xl">{title}</h2>
              <p className="mt-4 leading-7 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
