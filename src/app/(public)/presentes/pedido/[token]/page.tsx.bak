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
  const expired=payment.expires_at&&new Date(payment.expires_at).getTime()<=Date.now();
  const code=payment.payment_status==="pending_confirmation"&&!expired
    ? createPixCode(payment.pix_key,payment.receiver_name,payment.receiver_city,payment.amount_cents):null;
  return <section className="public-inner-page section-space"><div className="page-shell mx-auto max-w-2xl space-y-6">
    <Link className="admin-btn admin-btn--secondary" href="/presentes">← Voltar à lista</Link>
    <div className="card-soft space-y-5 p-6 text-center sm:p-9">
      <p className="eyebrow">Pagamento via Pix</p><h1 className="font-editorial text-4xl">{payment.gift_title}</h1>
      <p className="text-muted">Presente registrado para {payment.guest_name}</p>
      <p className="text-3xl font-bold text-brand-strong">{formatGiftAmount(payment.amount_cents)}</p>
      {payment.payment_status==="confirmed"?<p className="rounded-xl bg-green-50 p-4 font-semibold text-green-900">Pagamento confirmado pelos noivos. Obrigado! ❤️</p>:
       payment.payment_status==="rejected"?<p className="rounded-xl bg-red-50 p-4 text-red-800">Esta contribuição foi recusada. Entre em contato com os noivos.</p>:
       expired?<p className="rounded-xl bg-amber-50 p-4 text-amber-900">O prazo desta reserva expirou. Volte à lista e gere um novo Pix. Se já pagou, contate os noivos para conferência.</p>:
       <><p className="text-sm text-muted">Escaneie o código no aplicativo do banco ou copie o Pix abaixo.</p>
       <Image alt="QR Code Pix para pagamento" src={await qrDataUrl(code!)} width={232} height={232} unoptimized className="mx-auto rounded-xl border border-line bg-white p-3"/>
       <PixCopyButton value={code!}/>
       <p className="text-sm text-muted">Válido para reserva até {new Date(payment.expires_at).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}.</p>
       <p className="rounded-xl border border-line p-4 text-sm">O Pix não é confirmado automaticamente. Os noivos verificarão o recebimento pelo extrato bancário. Guarde o link desta página.</p></>}
    </div></div></section>;
}

async function qrDataUrl(content:string) {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(content,{errorCorrectionLevel:"M",margin:2,width:260});
}
