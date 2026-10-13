"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Success is signalled by the existing server-action redirects, never optimistically. */
export function SaveSuccessModal() {
  const pathname = usePathname();
  const params = useSearchParams();
  const success = params.get("saved") ?? params.get("removed");
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const title = params.has("removed") ? "Exclusão concluída" : "Alterações salvas!";

  useEffect(() => {
    setOpen(Boolean(success));
  }, [pathname, success]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") { e.preventDefault(); closeButton.current?.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!success || !open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="save-success-title" aria-describedby="save-success-description" className="w-full max-w-sm rounded-3xl bg-white p-8 text-center text-[#261f1a] shadow-2xl">
        <div aria-hidden="true" className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-800">✓</div>
        <h2 id="save-success-title" className="font-editorial text-3xl">{title}</h2>
        <p id="save-success-description" className="mt-3 text-sm text-[#5f5d58]">{params.has("removed") ? "O registro foi removido com sucesso." : "Suas alterações foram confirmadas e estão registradas."}</p>
        <button ref={closeButton} type="button" onClick={() => setOpen(false)} className="focus-ring mt-7 min-h-12 w-full rounded-full bg-[#65704d] px-6 font-semibold text-white">Entendi</button>
      </div>
    </div>
  );
}
