import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {getAppearance} from "@/services/wedding/appearance";
import {getPublicGiftCatalog} from "@/services/gifts/catalog";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {formatGiftAmount} from "@/services/gifts/types";
export default async function GiftDetail({params}:{params:Promise<{slug:string}>}){
 if(!(await getAppearance()).visible.presentes)notFound();const {slug}=await params;
 const [catalog,db]=await Promise.all([getPublicGiftCatalog(),createSupabaseServerClient()]);
 if(!catalog.enabled)notFound();const gift=catalog.gifts.find(g=>g.slug===slug);if(!gift)notFound();
 const image=gift.image_path&&db?db.storage.from("wedding-media").getPublicUrl(gift.image_path).data.publicUrl:null;
 return <section className="section-space public-inner-page"><div className="page-shell mx-auto max-w-4xl space-y-6"><Link className="admin-btn admin-btn--secondary" href="/presentes">← Voltar aos presentes</Link><article className="card-soft overflow-hidden md:grid md:grid-cols-2">{image?<div className="relative min-h-72"><Image src={image} alt={gift.title} fill unoptimized sizes="(max-width:768px) 100vw, 50vw" className="object-cover"/></div>:<div className="grid min-h-72 place-items-center bg-surface-muted text-7xl" aria-hidden="true">🎁</div>}<div className="space-y-5 p-6 sm:p-10"><p className="eyebrow">Presente especial</p><h1 className="font-editorial text-4xl">{gift.title}</h1><p className="whitespace-pre-wrap leading-relaxed text-muted">{gift.description||"Uma contribuição carinhosa para essa nova etapa."}</p><p className="text-2xl font-bold text-brand-strong">{formatGiftAmount(gift.amount_cents)}</p><p className="rounded-xl border border-line bg-surface-muted p-4 text-sm">O pagamento por Pix estará disponível em breve. Por enquanto, você pode conhecer os presentes da nossa lista.</p><Link className="admin-btn admin-btn--secondary" href="/presentes">Explorar outros presentes</Link></div></article></div></section>;
}
