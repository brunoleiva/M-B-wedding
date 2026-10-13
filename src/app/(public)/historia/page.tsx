import { StoryTimeline } from "@/components/public/story-timeline";
import { SectionTitle } from "@/components/ui/section-title";
import { getPublicContent } from "@/services/wedding/content";
export const metadata={title:"Nossa história"};
export default async function StoryPage(){const {story}=await getPublicContent();return <section className="section-space pt-32"><div className="page-shell max-w-4xl"><SectionTitle eyebrow="Nossa história" title="Antes do grande dia" description="Os momentos que nos trouxeram até aqui."/><StoryTimeline events={story}/></div></section>}
