import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { getPublicContent } from "@/services/wedding/content";
export const metadata = {title:"Galeria de fotos"};
export default async function PhotosPage(){
 if(!(await getAppearance()).visible.fotos) notFound();const {gallery}=await getPublicContent();return <section className="section-space public-inner-page"><div className="page-shell"><SectionTitle eyebrow="Nossos momentos" title="Galeria de fotos" description="Um pouquinho da nossa história em imagens."/><div className="mt-8 sm:mt-12">{gallery.length?<PhotoGallery photos={gallery}/>:<p className="rounded-2xl border border-line bg-surface p-8 text-center text-base leading-7 text-muted sm:p-12">Em breve, nossas fotos estarão aqui.</p>}</div></div></section>}
