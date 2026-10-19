import Link from "next/link";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { removeGuest } from "./actions";

export function GuestQuickActions({ id, name }: { id: string; name: string }) {
  return <div className="flex shrink-0 items-center gap-2">
    <Link href={`/admin/convidados/${id}`} title={`Editar ${name}`} aria-label={`Editar ${name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-brand-strong transition hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
    </Link>
    <ConfirmDeleteForm action={removeGuest} question={`Excluir o convidado ${name}?`} description="O convidado será removido das listas e contagens. O histórico será preservado no banco." confirmLabel="Sim, excluir convidado">
      <input type="hidden" name="id" value={id} />
      <button type="submit" title={`Excluir ${name}`} aria-label={`Excluir ${name}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-300 text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6 4 6M10 10v6M14 10v6"/></svg>
      </button>
    </ConfirmDeleteForm>
  </div>;
}
