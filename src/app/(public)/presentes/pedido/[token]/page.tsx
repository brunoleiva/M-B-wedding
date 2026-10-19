import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPixCode } from "@/services/gifts/pix";
import { formatGiftAmount } from "@/services/gifts/types";
import { PixCopyButton } from "./pix-copy-button";

export default async function GiftOrderPage({params}:{params:Promise<{token:string}>}) {
  const {token}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(token))notFound();
  const db=await createSupabaseServerClient();
  if(!db)notFound();
  const {data,error}=await db.rpc("read_gift_pix_order",{p_checkout_token:token});
  const payment=data?.[0];
  if(error||!payment)notFound();
  const expired = isPixReservationExpired(payment.expires_at);
  const confirmed=payment.payment_status==="confirmed";
  const pending=payment.payment_status==="pending_confirmation"&&!expired;
  const code=pending?createPixCode(payment.pix_key,payment.receiver_name,payment.receiver_city,payment.amount_cents):null;
  // A configuração privada nunca é consultada diretamente no componente público.
  // A função SQL retorna apenas a mensagem de agradecimento para pedidos confirmados.
  const thanks=confirmed?await db.rpc("read_confirmed_gift_thank_you",{p_checkout_token:token}):null;
  const thankYou=typeof thanks?.data==="string"?thanks.data.trim():"";
  return <section className="public-inner-page section-space"><div className="page-shell mx-auto max-w-2xl space-y-6">
    <Link className="inline-flex text-sm font-semibold text-brand-strong underline-offset-4 hover:underline" href="/presentes">← Voltar à lista de presentes</Link>
    <article className="card-soft space-y-6 p-5 text-center sm:p-9">
      <div className="space-y-2"><p className="eyebrow">Seu presente para Maysa & Bruno</p><h1 className="font-editorial break-words text-4xl">{payment.gift_title}</h1><p className="text-sm text-muted">Pedido de {payment.guest_name}</p></div>
      <div className="rounded-2xl border border-line bg-surface-muted p-4"><p className="text-sm text-muted">Valor do presente</p><p className="mt-1 text-3xl font-bold text-brand-strong">{formatGiftAmount(payment.amount_cents)}</p></div>
      {confirmed?<div role="status" className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900"><p className="text-3xl" aria-hidden="true">❤️</p><h2 className="font-editorial text-2xl">Pagamento confirmado!</h2><p className="whitespace-pre-wrap leading-relaxed">{thankYou||"Recebemos seu presente com muito carinho. Obrigado por fazer parte da nossa história!"}</p></div>:
       payment.payment_status==="rejected"?<div role="status" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"><h2 className="font-bold">Pagamento não confirmado</h2><p className="mt-2 text-sm">Esta contribuição foi recusada. Entre em contato com os noivos se você já realizou o Pix.</p></div>:
       expired?<div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><h2 className="font-bold">Prazo da reserva encerrado</h2><p className="mt-2 text-sm">Volte à lista e gere um novo pedido. Se já fez o pagamento, entre em contato com os noivos antes de pagar novamente.</p><Link className="admin-btn admin-btn--secondary mt-4 inline-flex" href="/presentes">Escolher um presente</Link></div>:
       <div className="space-y-5"><div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>Aguardando pagamento.</strong> Assim que fizer o Pix, nos sinalize pelo WhatsApp ou avise nossa assessoria para confirmarmos!</div>
         <ol className="grid gap-2 text-left text-sm sm:grid-cols-3"><li className="rounded-xl bg-surface-muted p-3"><strong>1.</strong> Abra o aplicativo do banco</li><li className="rounded-xl bg-surface-muted p-3"><strong>2.</strong> Escaneie ou copie o Pix</li><li className="rounded-xl bg-surface-muted p-3"><strong>3.</strong> Confira e confirme no banco</li></ol>
         <Image alt="QR Code Pix para pagamento" src={await qrDataUrl(code!)} width={280} height={280} unoptimized className="mx-auto h-auto max-w-full rounded-2xl border border-line bg-white p-3"/>
         <PixCopyButton value={code!}/>
         <div className="space-y-2 rounded-xl border border-line p-4 text-sm text-muted"><p>Recebedor: <strong>{payment.receiver_name}</strong></p><p>Valor: <strong>{formatGiftAmount(payment.amount_cents)}</strong></p><p>Reserva até: <strong>{new Date(payment.expires_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</strong></p></div>
         <p className="text-sm leading-relaxed text-muted">Confira o destinatário e o valor no aplicativo do seu banco antes de concluir. Guarde este link para acompanhar a confirmação feita pelos noivos.</p>
       </div>}
    </article></div></section>;
}

async function qrDataUrl(content:string) {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(content,{errorCorrectionLevel:"M",margin:2,width:300});
}

function isPixReservationExpired(expiresAt: string | null): boolean {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
}