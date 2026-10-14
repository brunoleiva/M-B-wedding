import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {getAppearance} from "@/services/wedding/appearance";
import {getPublicGiftCatalog} from "@/services/gifts/catalog";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {formatGiftAmount} from "@/services/gifts/types";
import {createPixCheckout} from "../checkout-action";
import {CheckoutButton} from "../checkout-button";
export default async function GiftDetail({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{erro?:string}>}){
 if(!(await getAppearance()).visible.presentes)notFound();const {slug}=await params;
 const [catalog,db,query]=await Promise.all([getPublicGiftCatalog(),createSupabaseServerClient(),searchParams]);
 if(!catalog.enabled)notFound();const gift=catalog.gifts.find(g=>g.slug===slug);if(!gift)notFound();
 const errors:Record<string,string>={
   dados:"Confira seu nome e a mensagem e tente novamente.",
   configuracao:"O Pix ainda não foi configurado completamente pelos noivos. Tente novamente mais tarde.",
   indisponivel:"Este presente não está disponível para uma nova contribuição no momento.",
   migration:"O pagamento ainda não está habilitado. Avise os noivos para verificarem a configuração do sistema.",
   pedido:"Não foi possível gerar o Pix agora. Tente novamente ou entre em contato com os noivos.",
 };
 const error=query.erro?errors[query.erro]??errors.pedido:null;
 const image=gift.image_path&&db?db.storage.from("wedding-media").getPublicUrl(gift.image_path).data.publicUrl:null;
 return <section className="section-space public-inner-page"><div className="page-shell mx-auto max-w-4xl space-y-6"><Link className="admin-btn admin-btn--secondary" href="/presentes">← Voltar aos presentes</Link><article className="card-soft overflow-hidden md:grid md:grid-cols-2">{image?<div className="relative min-h-72"><Image src={image} alt={gift.title} fill unoptimized sizes="(max-width:768px) 100vw, 50vw" className="object-cover"/></div>:<div className="grid min-h-72 place-items-center bg-surface-muted text-7xl" aria-hidden="true">🎁</div>}<div className="space-y-5 p-6 sm:p-10"><p className="eyebrow">Presente especial</p><h1 className="font-editorial text-4xl">{gift.title}</h1><p className="whitespace-pre-wrap leading-relaxed text-muted">{gift.description||"Uma contribuição carinhosa para essa nova etapa."}</p><p className="text-2xl font-bold text-brand-strong">{formatGiftAmount(gift.amount_cents)}</p>{error&&<p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900">{error}</p>}<form action={createPixCheckout} className="space-y-3 rounded-xl border border-line bg-surface-muted p-4">
  <h2 className="font-semibold">Presentear via Pix</h2>
  <input name="gift_id" value={gift.id} type="hidden"/>
  <input name="request_key" value={crypto.randomUUID()} type="hidden"/>
  <label className="block text-sm font-semibold">Seu nome *<input name="guest_name" className="guest-input" minLength={2} maxLength={160} required/></label>
  <label className="block text-sm font-semibold">Mensagem (opcional)<textarea name="message" className="guest-input min-h-20" maxLength={1000}/></label>
  <CheckoutButton amount={formatGiftAmount(gift.amount_cents)}/>
  <p className="text-xs text-muted">Gerar o Pix registra uma intenção pendente, não um pagamento confirmado.</p>
  </form><Link className="admin-btn admin-btn--secondary" href="/presentes">Explorar outros presentes</Link></div></article></div></section>;
}
