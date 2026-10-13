import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";

const gifts = [
  ["Café da manhã dos recém-casados", "R$ 50,00"],
  ["Jantar romântico", "R$ 150,00"],
  ["Passeio especial", "R$ 250,00"],
  ["Uma diária da lua de mel", "R$ 700,00"],
];

export const metadata = { title: "Presentes" };

export default async function GiftsPage() {
  if (!(await getAppearance()).visible.presentes) notFound();
  return (
    <section className="section-space public-inner-page">
      <div className="page-shell">
        <SectionTitle eyebrow="Lista de presentes" title="Experiências para a nossa próxima aventura" description="Nesta fundação os cards já estão prontos; o catálogo será conectado ao Supabase na fase de presentes." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gifts.map(([title, price], index) => (
            <article key={title} className="card-soft overflow-hidden">
              <div className={`h-44 ${index % 2 === 0 ? "bg-[#84906d]" : "bg-[#b48363]"}`} />
              <div className="p-6">
                <h2 className="font-editorial text-2xl">{title}</h2>
                <p className="mt-4 text-sm font-bold text-brand-strong">{price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
