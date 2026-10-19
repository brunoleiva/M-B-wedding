"use client";
import {useState} from "react";
export function PixCopyButton({value}:{value:string}) {
  const [status,setStatus]=useState<"idle"|"copied"|"error">("idle");
  async function copy(){
    try { await navigator.clipboard.writeText(value); setStatus("copied"); }
    catch { setStatus("error"); }
  }
  return <div className="space-y-3">
    <button type="button" onClick={copy} className="admin-btn admin-btn--primary w-full min-h-12 text-base">{status==="copied"?"✓ Código Pix copiado!":"Copiar código Pix"}</button>
    <label className="block space-y-2 text-left text-sm font-semibold" htmlFor="pix-copy-code"><span>Pix copia e cola</span><textarea id="pix-copy-code" readOnly onFocus={event=>event.currentTarget.select()} className="guest-input h-24 w-full break-all font-mono text-xs" value={value}/></label>
    <p role="status" aria-live="polite" className="text-xs text-muted">{status==="error"?"Não foi possível copiar automaticamente. Selecione o código acima e copie manualmente.":status==="copied"?"Cole o código no aplicativo do banco para continuar.":"Você também pode selecionar e copiar o código acima."}</p>
  </div>;
}
