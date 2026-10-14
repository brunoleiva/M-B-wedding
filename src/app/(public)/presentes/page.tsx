import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {getAppearance} from "@/services/wedding/appearance";
import {getPublicGiftCatalog} from "@/services/gifts/catalog";
import {formatGiftAmount} from "@/services/gifts/types";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {SectionTitle} from "@/components/ui/section-title";
export const metadata={title:"Presentes"};
export default async function GiftsPage({searchParams}:{searchParams:Promise<{categoria?:string;ordem?:string}>}){
 if(!(await getAppearance()).visible.presentes)notFound();
 const [catalog,params,db]=await Promise.all([getPublicGiftCatalog(),searchParams,createSupabaseServerClient()]);
 if(!catalog.enabled)return <section className="section-space public-inner-page"><div className="page-shell text-center"><h1 className="font-editorial text-4xl">Lista de presentes</h1><p className="mt-5 text-muted">Nossa lista será disponibilizada em breve. ❤️</p></div></section>;
 const filtered=catalog.gifts.filter(g=>!params.categoria||catalog.categories.find(c=>c.id===g.category_id)?.slug===params.categoria);
 if(params.ordem==="menor")filtered.sort((a,b)=>a.amount_cents-b.amount_cents);
 if(params.ordem==="maior")filtered.sort((a,b)=>b.amount_cents-a.amount_cents);
 return <section className="section-space public-inner-page"><div className="page-shell space-y-9"><SectionTitle eyebrow="Maysa & Bruno" title="Nossa lista de presentes" description={catalog.intro||"Sua presença é o nosso maior presente. Se desejar nos presentear, preparamos algumas sugestões com carinho."}/>
 <nav className="flex flex-wrap gap-2" aria-label="Categorias"><Link className="admin-btn admin-btn--secondary" href="/presentes">Todos</Link>{catalog.categories.map(c=><Link key={c.id} className="admin-btn admin-btn--secondary" href={`/presentes?categoria=${encodeURIComponent(c.slug)}`}>{c.name}</Link>)}</nav>
 <div className="flex flex-wrap justify-between gap-3"><p className="text-sm text-muted">{filtered.length} presentes disponíveis no catálogo</p><div className="flex gap-2"><Link className="text-sm font-semibold underline" href="/presentes?ordem=menor">Menor preço</Link><Link className="text-sm font-semibold underline" href="/presentes?ordem=maior">Maior preço</Link></div></div>
 {!filtered.length?<p className="card-soft p-8 text-center text-muted">Ainda não há presentes nessa categoria.</p>:<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(g=>{const image=g.image_path&&db?db.storage.from("wedding-media").getPublicUrl(g.image_path).data.publicUrl:null;return <article key={g.id} className="card-soft overflow-hidden">{image?<div className="relative h-52"><Image src={image} alt={g.title} fill unoptimized sizes="(max-width:640px) 100vw, 33vw" className="object-cover"/></div>:<div className="grid h-52 place-items-center bg-surface-muted text-5xl" aria-hidden="true">🎁</div>}<div className="space-y-3 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted">{catalog.categories.find(c=>c.id===g.category_id)?.name??"Presente especial"}</p><h2 className="font-editorial text-2xl">{g.title}</h2><p className="font-bold text-brand-strong">{formatGiftAmount(g.amount_cents)}</p><Link className="admin-btn admin-btn--primary w-full" href={`/presentes/${encodeURIComponent(g.slug)}`}>Ver presente</Link></div></article>})}</div>}
 </div></section>;
}
