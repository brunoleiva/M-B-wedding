import Link from "next/link";
import Image from "next/image";
import {notFound} from "next/navigation";
import {getAppearance} from "@/services/wedding/appearance";
import {getPublicGiftCatalog} from "@/services/gifts/catalog";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {formatGiftAmount} from "@/services/gifts/types";
import {createPixCheckout} from "../checkout-action";
import {CheckoutButton} from "../checkout-button";

export default async function GiftDetail({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{erro?:string}>}) {
  if (!(await getAppearance()).visible.presentes) notFound();
  const {slug}=await params;
  const [catalog,db,query]=await Promise.all([getPublicGiftCatalog(),createSupabaseServerClient(),searchParams]);
  if (!catalog.enabled) notFound();
  const gift=catalog.gifts.find(g=>g.slug===slug);
  if (!gift) notFound();
  const errors:Record<string,string>={
    dados:"Confira seu nome e a mensagem e tente novamente.",
    configuracao:"O Pix ainda não foi configurado completamente pelos noivos. Tente novamente mais tarde.",
    indisponivel:"Este presente não está disponível para uma nova contribuição no momento.",
    migration:"O pagamento ainda não está habilitado. Avise os noivos para verificarem a configuração do sistema.",
    pedido:"Não foi possível gerar o Pix agora. Tente novamente ou entre em contato com os noivos.",
    limite:"Muitas solicitações recentes para este presente. Aguarde alguns minutos antes de tentar novamente.",
  };
  const error=query.erro?errors[query.erro]??errors.pedido:null;
  const image=gift.image_path&&db?db.storage.from("wedding-media").getPublicUrl(gift.image_path).data.publicUrl:null;

  return <section className="section-space public-inner-page">
    <div className="page-shell mx-auto max-w-5xl space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-brand-strong underline-offset-4 hover:underline" href="/presentes">← Voltar à lista de presentes</Link>
      <article className="card-soft overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative min-h-72 bg-surface-muted sm:min-h-96 lg:min-h-full">
          {image?<Image src={image} alt={gift.title} fill unoptimized sizes="(max-width:1024px) 100vw, 50vw" className="object-cover"/>:<div className="grid h-full min-h-72 place-items-center text-7xl" aria-hidden="true">🎁</div>}
        </div>
        <div className="space-y-6 p-5 sm:p-8 lg:p-10">
          <div className="space-y-3">
            <p className="eyebrow">Um presente com carinho</p>
            <h1 className="font-editorial break-words text-4xl leading-tight sm:text-5xl">{gift.title}</h1>
            <p className="whitespace-pre-wrap leading-relaxed text-muted">{gift.description||"Uma contribuição carinhosa para essa nova etapa."}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-muted px-5 py-4">
            <p className="text-sm text-muted">Valor do presente</p>
            <p className="mt-1 text-3xl font-bold text-brand-strong">{formatGiftAmount(gift.amount_cents)}</p>
          </div>
          {error&&<p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900">{error}</p>}
          <form action={createPixCheckout} className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
            <div className="space-y-1"><h2 className="font-editorial text-2xl">Presentear via Pix</h2><p className="text-sm text-muted">Preencha seus dados para gerar o código de pagamento.</p></div>
            <input name="gift_id" value={gift.id} type="hidden"/>
            <input name="request_key" value={crypto.randomUUID()} type="hidden"/>
            <label className="block space-y-2 text-sm font-semibold" htmlFor="gift-guest-name"><span>Seu nome <span aria-hidden="true">*</span></span><input id="gift-guest-name" name="guest_name" className="guest-input" autoComplete="name" minLength={2} maxLength={160} required placeholder="Como podemos chamar você?"/></label>
            <label className="block space-y-2 text-sm font-semibold" htmlFor="gift-message"><span>Mensagem para os noivos <span className="font-normal text-muted">(opcional)</span></span><textarea id="gift-message" name="message" className="guest-input min-h-24" maxLength={1000} placeholder="Deixe uma mensagem especial..."/></label>
            <CheckoutButton amount={formatGiftAmount(gift.amount_cents)}/>
            <p className="text-xs leading-relaxed text-muted">Gerar o Pix não realiza o pagamento. A confirmação será feita pelos noivos após conferirem o recebimento.</p>
          </form>
        </div>
      </article>
    </div>
  </section>;
}
