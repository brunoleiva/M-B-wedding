import { StoryTimeline } from "@/components/public/story-timeline";
import { SectionTitle } from "@/components/ui/section-title";
import { weddingConfig } from "@/config/wedding";

export const metadata = { title: "Nossa história" };

export default function StoryPage() {
  return (
    <section className="section-space pt-32">
      <div className="page-shell max-w-4xl">
        <SectionTitle eyebrow="Nossa história" title="Antes do grande dia" description="Os momentos que nos trouxeram até aqui." />
        <StoryTimeline events={[...weddingConfig.story]} />
      </div>
    </section>
  );
}
