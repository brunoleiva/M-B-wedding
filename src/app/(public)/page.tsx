import Link from "next/link";
import { Countdown } from "@/components/public/countdown";
import { HeroSection } from "@/components/public/hero-section";
import { StoryTimeline } from "@/components/public/story-timeline";
import { SectionTitle } from "@/components/ui/section-title";
import { weddingConfig } from "@/config/wedding";
import { getPublicWedding } from "@/services/wedding/public";

export default async function HomePage() {
  const wedding = await getPublicWedding();
  return (
    <>
      <HeroSection wedding={wedding} />

      <section className="section-space bg-surface" aria-label="Contagem regressiva">
        <div className="page-shell max-w-3xl">
          <Countdown target={wedding.isoDate} />
        </div>
      </section>

      <section id="historia" className="section-space scroll-mt-20">
        <div className="page-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle
            align="left"
            eyebrow="Nossa história"
            title="Alguns capítulos antes do sim"
            description="Entre encontros, viagens, escolhas e planos, fomos construindo uma vida que agora queremos celebrar com vocês."
          />
          <StoryTimeline events={[...weddingConfig.story]} />
        </div>
      </section>

      <section id="casamento" className="section-space scroll-mt-20 bg-[#e9e1d6]">
        <div className="page-shell">
          <SectionTitle eyebrow="O casamento" title="Um dia para guardar para sempre" />
          <div className="card-soft mx-auto mt-12 grid max-w-4xl overflow-hidden md:grid-cols-[0.85fr_1.15fr]">
            <div className="min-h-72 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.9),transparent_24%),linear-gradient(135deg,#7f8967,#424b31)] p-8 text-white">
              <p className="text-xs tracking-[0.2em] uppercase opacity-80">Cerimônia & recepção</p>
              <p className="font-editorial mt-24 text-5xl">{wedding.venue.time}</p>
              <p className="mt-2 text-sm opacity-80">{wedding.displayDate}</p>
            </div>
            <div className="p-8 sm:p-10">
              <p className="eyebrow">{wedding.venue.name}</p>
              <h3 className="font-editorial mt-3 text-4xl">Os detalhes do nosso grande dia</h3>
              <p className="mt-5 leading-7 text-muted">{wedding.venue.description}</p>
              <p className="mt-5 text-sm font-semibold">{wedding.venue.address}</p>
              <Link href="/casamento" className="focus-ring mt-8 inline-flex rounded-full border border-foreground px-5 py-3 text-sm font-semibold transition hover:bg-foreground hover:text-white">
                Ver detalhes do casamento
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space bg-surface">
        <div className="page-shell">
          <SectionTitle eyebrow="O dia" title="Nosso cronograma" description="Uma visão simples para você saber o que esperar — sem correrias." />
          <div className="mx-auto mt-12 grid max-w-5xl gap-3 md:grid-cols-5">
            {weddingConfig.schedule.map((item) => (
              <div key={`${item.time}-${item.title}`} className="rounded-[1.35rem] border border-line bg-background p-5 text-center">
                <p className="font-editorial text-3xl text-brand-strong">{item.time}</p>
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                {item.description ? <p className="mt-2 text-xs leading-5 text-muted">{item.description}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-[#3e4731] text-white">
        <div className="page-shell grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-white/65 uppercase">Presença</p>
            <h2 className="font-editorial mt-3 max-w-3xl text-5xl leading-tight sm:text-6xl">Ter vocês conosco é o que torna esse dia completo.</h2>
          </div>
          <div className="rounded-[2rem] border border-white/20 bg-white/8 p-7 backdrop-blur-sm sm:p-9">
            <p className="leading-7 text-white/80">A confirmação será organizada por convite, para ficar fácil responder por toda a família em poucos passos.</p>
            <Link href="/rsvp" className="focus-ring mt-7 inline-flex min-h-12 items-center rounded-full bg-white px-6 text-sm font-bold text-foreground transition hover:bg-[#efe8dd]">Confirmar presença</Link>
          </div>
        </div>
      </section>
    </>
  );
}
