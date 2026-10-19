import Link from "next/link";
import Image from "next/image";
import type { Gift,GiftCategory } from "@/services/gifts/types";
import { saveGift,archiveGift } from "./actions";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GiftEditor({gift,categories,error}:{gift?:Gift;categories:GiftCategory[];error?:string}){
 const db=await createSupabaseServerClient();
 const image=gift?.image_path&&db?db.storage.from("wedding-media").getPublicUrl(gift.image_path).data.publicUrl:null;
 return <div className="mx-auto max-w-3xl space-y-6">
  <Link href="/admin/presentes" className="admin-btn admin-btn--back">← Voltar aos presentes</Link>
  <header><p className="eyebrow">Catálogo de presentes</p><h1 className="font-editorial text-4xl">{gift?"Editar presente":"Novo presente"}</h1><p className="mt-2 text-muted">Defina o preço e o que aparece na página pública. Os presentes não possuem limite de quantidade.</p></header>
  {error&&<p role="alert" className="rounded-xl border border-red-300 p-4 text-red-800">Não foi possível salvar ({error}). Revise os campos, o nome único e a imagem.</p>}
  <form action={saveGift} className="card-soft grid gap-4 p-5 sm:grid-cols-2 sm:p-8" encType="multipart/form-data">
   {gift&&<input name="id" type="hidden" value={gift.id}/>}
   <label className="sm:col-span-2 font-semibold">Nome do presente *<input className="guest-input" name="title" required maxLength={160} defaultValue={gift?.title??""}/></label>
   <label className="font-semibold">Identificador na URL (opcional)<input className="guest-input" name="slug" maxLength={100} defaultValue={gift?.slug??""} placeholder="Gerado pelo nome"/></label>
   <label className="font-semibold">Categoria<select className="guest-input" name="category_id" defaultValue={gift?.category_id??""}><option value="">Sem categoria</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   <label className="sm:col-span-2 font-semibold">Descrição<textarea className="guest-input min-h-28" maxLength={3000} name="description" defaultValue={gift?.description??""}/></label>
   <label className="font-semibold">Preço em reais *<input className="guest-input" name="amount" required inputMode="decimal" placeholder="150,00" defaultValue={gift?(gift.amount_cents/100).toFixed(2).replace(".",","):""}/></label>
   <label className="font-semibold">Tipo<select className="guest-input" name="gift_kind" defaultValue={gift?.gift_kind??"symbolic"}><option value="symbolic">Simbólico</option><option value="physical">Físico</option><option value="contribution">Contribuição</option></select></label>
   <label className="font-semibold">Ordem de exibição<input className="guest-input" name="sort_order" type="number" min={0} max={100000} defaultValue={gift?.sort_order??0}/></label>
   <div className="sm:col-span-2 space-y-2"><label className="block font-semibold">Foto (JPG, PNG, WEBP; até 5 MB)<input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="guest-input"/></label>{image&&<div className="relative h-48 w-48 overflow-hidden rounded-xl"><Image src={image} alt={gift?.title??"Presente"} fill unoptimized className="object-cover" sizes="192px"/></div>}</div>
   <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name="is_active" defaultChecked={gift?.is_active??false}/> Publicar presente</label>
   <label className="flex items-center gap-2 font-semibold"><input type="checkbox" name="is_featured" defaultChecked={gift?.is_featured??false}/> Destacar no catálogo</label>
   <div className="sm:col-span-2 flex flex-wrap gap-3"><button className="admin-btn admin-btn--primary" type="submit">{gift?"Salvar alterações":"Cadastrar presente"}</button><Link className="admin-btn admin-btn--secondary" href="/admin/presentes">Cancelar</Link></div>
  </form>
  {gift&&<div className="card-soft p-5"><ConfirmDeleteForm action={archiveGift} question={`Você realmente deseja excluir o presente ${gift.title}?`} description="O presente será removido das listas e contagens. Seu registro continuará guardado para auditoria." confirmLabel="Sim, excluir"><input type="hidden" name="id" value={gift.id}/><button className="admin-btn admin-btn--danger" type="submit">Excluir presente</button></ConfirmDeleteForm></div>}
 </div>;
}
