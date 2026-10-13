"use client";
import { useState } from "react";
import { ConfirmDeleteForm } from "./confirm-delete-form";
import type { ReactNode } from "react";
export function StatusNotice({saved,removed,error}:{saved?:string;removed?:string;error?:string}) {
 const message=error === "members" ? "Antes de arquivar a família, mova ou arquive seus integrantes." : error ? "Não foi possível concluir a operação. Revise os dados e tente novamente." : removed ? "Registro arquivado com sucesso." : saved === "guest" ? "Informações do convidado salvas!" : saved === "group" ? "Informações da família salvas!" : saved ? "Alterações salvas!" : "";
 const [open,setOpen]=useState(Boolean(message&&!error));
 return <>{message&&<p role={error?"alert":"status"} className={`rounded-xl border p-4 text-sm font-semibold ${error?"border-red-300 text-red-800":"border-green-300 text-green-800"}`}>{message}</p>}{open&&<div role="presentation" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"><div role="dialog" aria-modal="true" aria-labelledby="guest-success-title" className="w-full max-w-sm rounded-2xl bg-white p-7 text-center text-neutral-900 shadow-2xl"><div className="mb-3 text-4xl text-green-700">✓</div><h2 id="guest-success-title" className="text-xl font-semibold">{message}</h2><button type="button" autoFocus className="mt-5 rounded-full bg-neutral-900 px-7 py-3 font-semibold text-white transition hover:bg-neutral-700" onClick={()=>setOpen(false)}>Entendi</button></div></div>}</>;
}
export function ConfirmSubmit({children,question,action}:{children:ReactNode;question:string;action:(form:FormData)=>void|Promise<void>}) {return <ConfirmDeleteForm action={action} question={question} confirmLabel="Sim, arquivar" description="O registro deixará de aparecer nas listas ativas. Esta ação exige confirmação.">{children}</ConfirmDeleteForm>}
