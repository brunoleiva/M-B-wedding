"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitInvite } from "./actions";
import { SubmitButton } from "@/components/shared/submit-button";

type Guest = { id: string; name: string; status: "pending" | "attending" | "not_attending"; note: string | null };

export function InviteForm({ token, guests, saved, error }: { token: string; guests: Guest[]; saved: boolean; error: boolean }) {
  const alreadyAnswered = guests.some((guest) => guest.status !== "pending");
  const [editing, setEditing] = useState(!alreadyAnswered);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!saved) return;
    const redirectTimer = window.setTimeout(() => window.location.replace("/"), 4500);
    return () => window.clearTimeout(redirectTimer);
  }, [saved]);

  return (
    <>
      {saved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="rsvp-success-title" aria-describedby="rsvp-success-description" className="w-full max-w-md rounded-3xl bg-white p-8 text-center text-stone-900 shadow-2xl">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800" aria-hidden="true">✓</div>
            <h2 id="rsvp-success-title" className="font-editorial text-3xl">Formulário enviado!</h2>
            <p id="rsvp-success-description" className="mt-3 text-lg">Recebemos as respostas da sua família. Obrigado por confirmar! ❤️</p>
            <p className="mt-3 text-base text-stone-600">Você será levado à página inicial em alguns segundos.</p>
            <Link href="/" className="focus-ring mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-700">Voltar para a Home</Link>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-lg text-red-800">Não foi possível confirmar. Revise todas as respostas e tente novamente.</p>}

      {alreadyAnswered && (
        <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-950">
          <h2 className="text-2xl font-semibold">Este convite já foi respondido ✓</h2>
          <p className="mt-2 text-lg">As respostas abaixo já estão registradas. Caso precise fazer alguma mudança, selecione “Alterar resposta”.</p>
          {!editing && <button type="button" onClick={() => setEditing(true)} className="focus-ring mt-5 min-h-12 rounded-full bg-stone-900 px-6 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-stone-700 active:scale-[.98]">Alterar resposta</button>}
        </div>
      )}

      <form ref={formRef} action={submitInvite} className="card-soft mt-8 space-y-7 p-6 sm:p-9">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="intent" value={alreadyAnswered ? "edit" : "create"} />
        {guests.map((guest) => (
          <fieldset key={guest.id} disabled={!editing} className="space-y-4 border-b border-line pb-7 disabled:opacity-80">
            <legend className="text-xl font-semibold sm:text-2xl">{guest.name}</legend>
            <div className="flex flex-wrap gap-6 text-lg">
              <label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name={`status_${guest.id}`} value="attending" defaultChecked={guest.status === "attending"} required className="size-5 accent-current" /> Irei</label>
              <label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="radio" name={`status_${guest.id}`} value="not_attending" defaultChecked={guest.status === "not_attending"} required className="size-5 accent-current" /> Não irei</label>
            </div>
            <label className="block text-lg">Observação (opcional)
              <input name={`note_${guest.id}`} maxLength={1000} defaultValue={guest.note ?? ""} className="mt-2 w-full rounded-xl border border-line p-4 text-lg" />
            </label>
            {!editing && <p className="text-base font-medium text-green-900">Resposta registrada: {guest.status === "attending" ? "Irei" : guest.status === "not_attending" ? "Não irei" : "Aguardando confirmação"}</p>}
          </fieldset>
        ))}
        {guests.length === 0 ? <p className="text-lg">Este convite ainda não possui pessoas cadastradas.</p> : editing && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <SubmitButton pendingLabel="Enviando respostas..." className="focus-ring min-h-14 flex-1 rounded-full bg-brand px-6 py-4 text-lg font-bold text-white transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[.98]">{alreadyAnswered ? "Salvar novas respostas" : "Confirmar respostas"}</SubmitButton>
            {alreadyAnswered && <button type="button" onClick={() => { formRef.current?.reset(); setEditing(false); }} className="focus-ring min-h-14 rounded-full border border-line px-6 py-4 text-lg font-semibold transition hover:bg-stone-100">Cancelar</button>}
          </div>
        )}
      </form>
    </>
  );
}
