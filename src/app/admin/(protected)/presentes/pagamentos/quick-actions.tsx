import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { archivePayment, reviewPayment } from "./actions";

export function PaymentQuickActions({ id, status }: { id: string; status: string }) {
  return <div className="flex items-center gap-2">
    {status === "pending_confirmation" ? <ConfirmDeleteForm
      action={reviewPayment}
      question="Confirmar o recebimento deste Pix?"
      description="Confira antes no extrato bancário. Esta ação registra o pagamento como recebido."
      confirmLabel="Sim, confirmar pagamento"
    >
      <input type="hidden" name="id" value={id}/>
      <input type="hidden" name="decision" value="confirmed"/>
      <button type="submit" title="Confirmar pagamento" aria-label="Confirmar pagamento" className="rounded-lg border border-green-300 p-2 text-green-700 transition hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
      </button>
    </ConfirmDeleteForm> : <span title="Pagamento já revisado" className="p-2 text-muted" aria-label="Pagamento já revisado">—</span>}
    <ConfirmDeleteForm
      action={archivePayment}
      question="Apagar este pagamento da listagem?"
      description={status === "confirmed" ? "Este Pix já está confirmado. Ao arquivá-lo, ele deixará de contar nos totais recebidos e na disponibilidade do presente. O histórico será preservado." : "O pagamento será arquivado, deixará de aparecer na listagem e não será contado nos indicadores. O histórico será preservado."}
      confirmLabel="Sim, arquivar pagamento"
    >
      <input type="hidden" name="id" value={id}/>
      <button type="submit" title="Apagar pagamento da listagem" aria-label="Apagar pagamento da listagem" className="rounded-lg border border-red-300 p-2 text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 10v6M14 10v6"/></svg>
      </button>
    </ConfirmDeleteForm>
  </div>;
}
