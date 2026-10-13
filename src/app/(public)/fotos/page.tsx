import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { getPublicContent } from "@/services/wedding/content";
export const metadata = {title:"Galeria de fotos"};
export default async function PhotosPage(){
 if(!(await getAppearance()).visible.fotos) notFound();const {gallery}=await getPublicContent();return <section className="section-space pt-32"><div className="page-shell"><SectionTitle eyebrow="Nossos momentos" title="Galeria de fotos" description="Um pouquinho da nossa história em imagens."/><div className="mt-12">{gallery.length?<PhotoGallery photos={gallery}/>:<p className="text-center text-muted">Em breve, nossas fotos estarão aqui.</p>}</div></div></section>}
