"use client";
import {useState} from "react";
export function PixCopyButton({value}:{value:string}) {
  const [copied,setCopied]=useState(false);
  async function copy(){try{await navigator.clipboard.writeText(value);setCopied(true);}catch{setCopied(false);}}
  return <div className="space-y-3"><textarea aria-label="Pix copia e cola" readOnly className="guest-input h-24 break-all text-xs" value={value}/>
    <button type="button" onClick={copy} className="admin-btn admin-btn--primary w-full">{copied?"Código copiado!":"Copiar código Pix"}</button></div>;
}
