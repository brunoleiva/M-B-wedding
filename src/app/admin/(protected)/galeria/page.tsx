import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { getAdminContext } from "@/services/admin/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { addPhoto, updatePhoto, deletePhoto } from "./actions";
import Image from "next/image";
import Link from "next/link";
import { GalleryUploadForm } from "./gallery-upload-form";
import { SubmitButton } from "@/components/shared/submit-button";

export default async function GalleryAdmin({searchParams}:{searchParams:Promise<{error?:string;saved?:string;removed?:string}>}) {
  const ctx=await getAdminContext(); const supabase=await createSupabaseServerClient();
  const {data:photos}=ctx&&supabase ? await supabase.from("gallery_images").select("id,storage_path,alt_text,caption,sort_order,is_cover,is_published").eq("wedding_id",ctx.weddingId).is("deleted_at",null).order("sort_order").order("created_at") : {data:[]};
  const params=await searchParams;
  return <div className="space-y-8"><div><p className="eyebrow">Galeria</p><h1 className="font-editorial text-5xl">Fotos de Maysa & Bruno</h1><p className="mt-3 text-muted">JPG, PNG ou WEBP até 5 MB. Fotos não publicadas ficam ocultas dos convidados.</p><Link href="/fotos" className="underline">Ver galeria pública</Link></div>
  {params.error && <p role="alert" className="text-red-700">Falha ao salvar ({params.error}). Confira o arquivo e os campos.</p>}{(params.saved||params.removed)&&<p role="status" className="text-green-700">Alterações salvas com sucesso.</p>}
  <GalleryUploadForm action={addPhoto} weddingId={ctx!.weddingId} />
  <section className="space-y-3" aria-label="Fotos cadastradas">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Fotos cadastradas</h2><span className="rounded-full border border-line px-3 py-1 text-sm font-semibold">{photos?.length ?? 0} foto(s)</span></div>
    <div className="space-y-3">{(photos??[]).map(photo=><article key={photo.id} className="card-soft overflow-hidden p-3 sm:p-4">
      <div className="grid gap-4 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-5">
        <div className="relative h-40 overflow-hidden rounded-xl bg-surface-muted sm:h-36"><Image unoptimized fill sizes="(max-width:640px) 100vw, 144px" className="object-cover" alt={photo.alt_text} src={supabase!.storage.from("wedding-media").getPublicUrl(photo.storage_path).data.publicUrl}/></div>
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className={`rounded-full px-3 py-1 ${photo.is_published ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-950"}`}>{photo.is_published ? "Publicada" : "Oculta"}</span>{photo.is_cover && <span className="rounded-full bg-brand/10 px-3 py-1 text-brand-strong">Foto de destaque</span>}<span className="text-muted">Ordem {photo.sort_order}</span></div>
          <form action={updatePhoto} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_88px]"><input type="hidden" name="id" value={photo.id}/>
            <label className="min-w-0 text-sm font-semibold">Descrição acessível<input className="mt-1 w-full min-w-0 rounded-lg border border-line p-2.5 font-normal" name="alt" maxLength={200} required defaultValue={photo.alt_text}/></label>
            <label className="min-w-0 text-sm font-semibold">Legenda<input className="mt-1 w-full min-w-0 rounded-lg border border-line p-2.5 font-normal" name="caption" maxLength={500} defaultValue={photo.caption??""}/></label>
            <label className="text-sm font-semibold">Ordem<input type="number" className="mt-1 w-full rounded-lg border border-line p-2.5 font-normal" name="sort" min={0} max={100000} defaultValue={photo.sort_order}/></label>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:col-span-3"><label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" name="published" defaultChecked={photo.is_published} className="size-4"/> Publicada</label><label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium"><input type="checkbox" name="cover" defaultChecked={photo.is_cover} className="size-4"/> Foto de destaque</label></div>
            <div className="flex flex-wrap items-center gap-2 md:col-span-3"><SubmitButton pendingLabel="Salvando..." className="admin-btn admin-btn--primary">Salvar alterações</SubmitButton></div>
          </form>
          <ConfirmDeleteForm action={deletePhoto} question="Você realmente deseja excluir esta foto?" className="flex"><input name="id" type="hidden" value={photo.id}/><button type="submit" className="admin-btn admin-btn--danger">Excluir foto</button></ConfirmDeleteForm>
        </div>
      </div>
    </article>)}{!photos?.length && <p className="card-soft p-6 text-muted">Nenhuma foto enviada ainda.</p>}</div>
  </section></div>;
}
