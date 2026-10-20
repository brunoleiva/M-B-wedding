"use client";

import { useRef, type FormEvent } from "react";
import { SubmitButton } from "@/components/shared/submit-button";

type Props = { action: (form: FormData) => void | Promise<void> };

export function GalleryUploadForm({ action }: Props) {
  const submitting = useRef(false);
  function preventDuplicate(event: FormEvent<HTMLFormElement>) {
    if (submitting.current) {
      event.preventDefault();
      return;
    }
    submitting.current = true;
  }
  return <form action={action} onSubmit={preventDuplicate} className="card-soft grid gap-4 p-5 sm:p-6">
    <div><h2 className="text-xl font-semibold">Adicionar foto</h2><p className="mt-1 text-sm text-muted">Envie uma imagem por vez. Aguarde a confirmação antes de enviar outra.</p></div>
    <label className="text-sm font-semibold">Imagem *<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required className="mt-1 block w-full rounded-lg border border-line p-3 font-normal"/></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Descrição acessível *<input name="alt" required maxLength={200} className="mt-1 w-full rounded-lg border border-line p-3 font-normal"/></label><label className="text-sm font-semibold">Legenda<input name="caption" maxLength={500} className="mt-1 w-full rounded-lg border border-line p-3 font-normal"/></label></div>
    <SubmitButton pendingLabel="Enviando foto..." className="admin-btn admin-btn--primary w-fit">Enviar foto</SubmitButton>
  </form>;
}
