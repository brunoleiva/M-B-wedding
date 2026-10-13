import Link from "next/link";
import { Countdown } from "@/components/public/countdown";
import { HeroSection } from "@/components/public/hero-section";
import { StoryTimeline } from "@/components/public/story-timeline";
import { SectionTitle } from "@/components/ui/section-title";
import { WeddingDetails } from "@/components/public/wedding-details";
import { getPublishedEventDetails } from "@/services/wedding/event-details";
import { getPublicContent } from "@/services/wedding/content";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { getPublicWedding } from "@/services/wedding/public";
import { getAppearance } from "@/services/wedding/appearance";

export default async function HomePage() {
  const wedding = await getPublicWedding();
  const {visible} = await getAppearance();
  const {story,gallery} = await getPublicContent();
  const {venues, schedule, timezone} = await getPublishedEventDetails();
  return (
    <>
      <HeroSection wedding={wedding} />

      <section className="section-space bg-surface" aria-label="Contagem regressiva">
        <div className="page-shell max-w-3xl">
          <Countdown target={wedding.isoDate} />
        </div>
      </section>

      {visible.historia && <section id="historia" className="section-space scroll-mt-20">
        <div className="page-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionTitle
            align="left"
            eyebrow="Nossa história"
            title="Alguns capítulos antes do sim"
            description="Entre encontros, viagens, escolhas e planos, fomos construindo uma vida que agora queremos celebrar com vocês."
          />
          <StoryTimeline events={story} />
        </div>
      </section>}

      {visible.fotos && gallery.length>0 && <section id="fotos" className="section-space bg-surface"><div className="page-shell"><SectionTitle eyebrow="Nossos momentos" title="Galeria de fotos"/><div className="mt-10"><PhotoGallery photos={gallery.slice(0,8)}/></div><Link href="/fotos" className="mt-6 inline-block underline">Ver todas as fotos</Link></div></section>}

      {visible.casamento && (venues.length > 0 || schedule.length > 0) && <section id="casamento" className="section-space scroll-mt-20 bg-surface-muted">
        <div className="page-shell"><SectionTitle eyebrow="O casamento" title="Um dia para guardar para sempre" /><div className="mt-12"><WeddingDetails venues={venues} schedule={schedule} timezone={timezone} compact /></div><Link href="/casamento" className="mt-8 inline-block underline">Ver todos os detalhes</Link></div>
      </section>}

      {visible.rsvp && <section className="section-space bg-brand text-white">
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
      </section>}
    </>
  );
}
