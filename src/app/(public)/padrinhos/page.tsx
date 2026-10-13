import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import Image from "next/image";
import { SectionTitle } from "@/components/ui/section-title";
import { getPublicGuestInformation } from "@/services/wedding/guest-information";
export const metadata={title:"Padrinhos e pessoas especiais"};
export default async function PeoplePage(){
 if(!(await getAppearance()).visible.padrinhos) notFound();
 const {people}=await getPublicGuestInformation();
 return <section className="section-space public-inner-page"><div className="page-shell max-w-5xl"><SectionTitle eyebrow="Pessoas especiais" title="Quem caminha ao nosso lado" description="Pessoas queridas que fazem parte da nossa história."/>
 {people.length===0?<p className="mt-12 text-center text-muted">Em breve apresentaremos nossas pessoas especiais.</p>:<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{people.map(p=><article key={p.id} className="card-soft overflow-hidden">{p.image_url&&<div className="relative aspect-[4/5]"><Image src={p.image_url} alt={`Foto de ${p.name}`} fill unoptimized className="object-cover" sizes="(max-width: 640px) 100vw, 33vw"/></div>}<div className="p-6"><p className="text-xs uppercase tracking-widest text-muted">{p.category} · {p.role_label}</p><h2 className="font-editorial mt-2 text-3xl">{p.name}</h2>{p.description&&<p className="mt-3 whitespace-pre-line text-muted">{p.description}</p>}</div></article>)}</div>}
 </div></section>;
}
