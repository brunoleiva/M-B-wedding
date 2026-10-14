"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Success is signalled by the existing server-action redirects, never optimistically. */
export function SaveSuccessModal() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const success = params.get("saved") ?? params.get("removed");
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const noticeKey = `${pathname}:${params.toString()}`;
  const open = Boolean(success) && dismissedKey !== noticeKey;
  const closeButton = useRef<HTMLButtonElement>(null);
  const messages: Record<string, {title: string; description: string}> = {
    guest: {title: "Convidado salvo!", description: "As informações foram registradas com sucesso."},
    save_colors: {title: "Cores salvas", description: "As cores em uso foram atualizadas. A paleta padrão não foi alterada."},
    set_default: {title: "Cor padrão alterada", description: "A paleta foi definida como padrão sem mudar as cores atualmente aplicadas."},
    restore: {title: "Voltou ao padrão", description: "As cores padrão foram aplicadas ao site."},
    save_sections: {title: "Seções salvas", description: "A visibilidade das seções foi atualizada."},
    venue: {title: "Informações salvas", description: "Os dados da cerimônia e recepção foram atualizados."},
    schedule: {title: "Cronograma salvo", description: "Os horários do casamento foram atualizados."},
  };
  const message = params.has("removed")
    ? {title: "Exclusão concluída", description: "O registro foi removido com sucesso."}
    : messages[success ?? ""] ?? {title: "Informações salvas", description: "Suas alterações foram registradas com sucesso."};

  const close = useCallback(() => {
    setDismissedKey(noticeKey);
    // Na lista de convidados, remova o sinalizador para o aviso não voltar.
    if (pathname === "/admin/convidados" && success === "guest") {
      const query = new URLSearchParams(params.toString());
      query.delete("saved");
      router.replace(query.size ? `${pathname}?${query.toString()}` : pathname, { scroll: false });
    }
  }, [noticeKey, pathname, success, params, router]);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") { e.preventDefault(); closeButton.current?.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!success || !open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="save-success-title" aria-describedby="save-success-description" className="w-full max-w-sm rounded-3xl bg-white p-8 text-center text-[#261f1a] shadow-2xl">
        <div aria-hidden="true" className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-800">✓</div>
        <h2 id="save-success-title" className="font-editorial text-3xl">{message.title}</h2>
        <p id="save-success-description" className="mt-3 text-sm text-[#5f5d58]">{message.description}</p>
        <button ref={closeButton} type="button" onClick={close} className="focus-ring mt-7 min-h-12 w-full rounded-full bg-[#65704d] px-6 font-semibold text-white">Entendi</button>
      </div>
    </div>
  );
}
