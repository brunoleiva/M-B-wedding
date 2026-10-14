import Link from "next/link";
import {notFound} from "next/navigation";
import {getAdminGiftPayments,getAdminGifts} from "@/services/gifts/admin";
import {formatGiftAmount} from "@/services/gifts/types";
import {ConfirmDeleteForm} from "@/components/admin/confirm-delete-form";
import {reviewPayment} from "../actions";
export default async function PaymentDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string}>}){
 const {id}=await params;const [payments,listing,query]=await Promise.all([getAdminGiftPayments(),getAdminGifts(),searchParams]);
 const payment=payments.find(p=>p.id===id);if(!payment)notFound();
 const gift=listing.gifts.find(g=>g.id===payment.gift_id);
 return <div className="mx-auto max-w-3xl space-y-6"><Link className="admin-btn admin-btn--back" href="/admin/presentes/pagamentos">← Voltar aos pagamentos</Link>
  <h1 className="font-editorial text-4xl">Conferir contribuição</h1>
  {query.error&&<p role="alert" className="rounded-xl border border-red-300 p-4 text-red-700">Não foi possível revisar. Confira a disponibilidade e tente novamente.</p>}
  <div className="card-soft space-y-3 p-6"><p><strong>Convidado:</strong> {payment.guest_name}</p><p><strong>Presente:</strong> {gift?.title??"Presente arquivado"}</p>
   <p><strong>Valor:</strong> {formatGiftAmount(payment.amount_cents)}</p><p><strong>Situação:</strong> {payment.status==="confirmed"?"Confirmado":payment.status==="rejected"?"Rejeitado":"Pendente"}</p>
   <p><strong>Criado:</strong> {new Date(payment.created_at).toLocaleString("pt-BR")}</p><p><strong>Observação administrativa:</strong> {payment.admin_note??"—"}</p>
  </div>
  {payment.status==="pending_confirmation"&&<div className="card-soft space-y-4 p-6"><h2 className="text-xl font-semibold">Conferência manual</h2>
    <p className="text-sm text-muted">Confira no extrato da conta Pix se o valor realmente entrou antes de confirmar. Gerar QR Code não significa ter pago.</p>
    <ConfirmDeleteForm action={reviewPayment} question="Você confirmou o recebimento deste Pix no extrato bancário?" description="Esta ação registra o valor como recebido e atualiza os indicadores financeiros." confirmLabel="Sim, confirmar recebimento">
      <input type="hidden" name="id" value={payment.id}/><input type="hidden" name="decision" value="confirmed"/>
      <label className="block font-semibold">Observação (opcional)<textarea className="guest-input" maxLength={1000} name="note"/></label>
      <button type="submit" className="admin-btn admin-btn--primary mt-3">Confirmar pagamento</button>
    </ConfirmDeleteForm>
    <ConfirmDeleteForm action={reviewPayment} question="Você deseja rejeitar este pagamento?" description="A rejeição libera a reserva do presente e fica registrada no histórico." confirmLabel="Sim, rejeitar">
      <input type="hidden" name="id" value={payment.id}/><input type="hidden" name="decision" value="rejected"/>
      <label className="block font-semibold">Motivo (opcional)<textarea className="guest-input" maxLength={1000} name="note"/></label>
      <button type="submit" className="admin-btn admin-btn--danger mt-3">Rejeitar pagamento</button>
    </ConfirmDeleteForm>
  </div>}
 </div>;
}
