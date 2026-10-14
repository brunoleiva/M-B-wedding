"use client";

import { useRef, useState, useTransition, type ReactNode, type FormEvent } from "react";

type Props = {
  children: ReactNode;
  question: string;
  description?: string;
  confirmLabel?: string;
  action: (form: FormData) => void | Promise<void>;
  className?: string;
};

export function ConfirmDeleteForm({ children, question, description, confirmLabel = "Sim, excluir", action, className }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) setOpen(true);
  }

  function proceed() {
    if (pending || !formRef.current) return;
    const data = new FormData(formRef.current);
    setOpen(false);
    // Call the Server Action once, directly. A second requestSubmit() could be
    // intercepted by the global duplicate-submit guard.
    startTransition(() => action(data));
  }

  return <>
    <form ref={formRef} onSubmit={submit} className={className}>{children}</form>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6" onMouseDown={event => { if (!pending && event.target === event.currentTarget) setOpen(false); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title" aria-describedby="confirm-delete-description" className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl sm:p-8" onKeyDown={event => { if (!pending && event.key === "Escape") setOpen(false); }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl text-red-700" aria-hidden="true">!</div>
        <h2 id="confirm-delete-title" className="text-xl font-bold">{question}</h2>
        <p id="confirm-delete-description" className="mt-3 text-base text-slate-600">{description ?? "Esta ação não poderá ser desfeita. Confirme para continuar."}</p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" autoFocus className="admin-btn admin-btn--secondary" onClick={() => setOpen(false)} disabled={pending}>Cancelar</button>
          <button type="button" className="admin-btn admin-btn--danger" onClick={proceed} disabled={pending}>{pending ? "Processando..." : confirmLabel}</button>
        </div>
      </div>
    </div>}
  </>;
}
