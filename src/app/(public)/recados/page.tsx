import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata = { title: "Recados" };

export default async function MessagesPage() {
  if (!(await getAppearance()).visible.recados) notFound();
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-4xl">
        <SectionTitle eyebrow="Recados" title="Deixe um carinho para nós" description="A moderação já está prevista no banco; o formulário público entra na fase de interações." />
        <div className="card-soft mt-10 p-8 text-center">
          <p className="font-editorial text-3xl">Nenhum recado ainda.</p>
          <p className="mt-3 text-muted">Seja o primeiro a deixar uma mensagem para os noivos.</p>
        </div>
      </div>
    </section>
  );
}
