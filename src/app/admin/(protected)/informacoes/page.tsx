import { getAdminContext } from "@/services/admin/dashboard";
import { getGuestInformation } from "@/services/wedding/guest-information";
import { saveInformation,savePerson,saveFaq,saveHotel,deleteInfoItem } from "./actions";
const input="mt-1 w-full rounded-xl border border-line bg-white p-3 text-foreground";
const label="block text-sm font-semibold";
const button="rounded-full bg-brand px-6 py-3 font-semibold text-white";
const categories=["Padrinhos","Madrinhas","Pais","Damas e pajens","Outros"];
export default async function InfoAdmin({searchParams}:{searchParams:Promise<{error?:string;saved?:string}>}){
 const admin=await getAdminContext();const data=admin?await getGuestInformation(admin.weddingId,true):{people:[],faqs:[],hotels:[],info:null};
 const params=await searchParams;
 return <div className="max-w-5xl space-y-12">
  <header><p className="eyebrow">Administração</p><h1 className="font-editorial mt-2 text-5xl">Padrinhos e informações</h1><p className="mt-3 text-muted">Edite apenas o que já está definido. Conteúdos ocultos não aparecem para convidados.</p></header>
  {params.error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">Não foi possível salvar. {params.error==="fields"?"Confira os campos obrigatórios e os links HTTPS.":params.error==="image"?"Imagem inválida: envie JPG, PNG ou WEBP até 5 MB.":"Confira se a migration 004 foi aplicada e se você tem permissão no Supabase."}</p>}
  {params.saved&&<p role="status" className="rounded-xl bg-green-50 p-4 text-green-900">Alterações salvas.</p>}
  <section className="card-soft p-6"><h2 className="font-editorial text-3xl">Traje e transporte</h2><form action={saveInformation} className="mt-5 grid gap-4 sm:grid-cols-2">
   <label className={label}>Tipo de traje<input name="dress_title" className={input} defaultValue={data.info?.dress_title??""}/></label>
   <label className={label}>Cores a evitar<input name="colors_to_avoid" className={input} defaultValue={data.info?.colors_to_avoid??""}/></label>
   <label className={label+" sm:col-span-2"}>Orientações de traje<textarea name="dress_description" rows={3} className={input} defaultValue={data.info?.dress_description??""}/></label>
   <label className={label+" sm:col-span-2"}>Transporte<textarea name="transport_text" rows={3} className={input} defaultValue={data.info?.transport_text??""}/></label>
   <label className={label+" sm:col-span-2"}>Estacionamento<textarea name="parking_text" rows={3} className={input} defaultValue={data.info?.parking_text??""}/></label>
   <label className="flex items-center gap-2"><input type="checkbox" name="is_published" defaultChecked={data.info?.is_published??false}/> Publicar informações</label>
   <button className={button}>Salvar informações</button>
  </form></section>
  <section className="space-y-4"><h2 className="font-editorial text-3xl">Padrinhos e pessoas especiais</h2><p className="text-sm text-muted">Fotos opcionais; uploads JPG, PNG ou WEBP até 5 MB.</p>
  {[...data.people,null].map(person=><article key={person?.id??"new"} className="card-soft p-6"><h3 className="mb-4 font-semibold">{person?`Editar ${person.name}`:"Adicionar pessoa"}</h3>
   <form action={savePerson} className="grid gap-4 sm:grid-cols-2">
    {person&&<><input name="id" type="hidden" value={person.id}/><input name="existing_image_path" type="hidden" value={person.image_path??""}/></>}
    <label className={label}>Nome *<input name="name" required className={input} defaultValue={person?.name??""}/></label>
    <label className={label}>Papel *<input name="role_label" required className={input} placeholder="Ex.: Madrinha" defaultValue={person?.role_label??""}/></label>
    <label className={label}>Grupo<select name="category" className={input} defaultValue={person?.category??"Outros"}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label className={label}>Ordem<input type="number" min="0" name="sort_order" className={input} defaultValue={person?.sort_order??0}/></label>
    <label className={label+" sm:col-span-2"}>Descrição<textarea name="description" rows={2} className={input} defaultValue={person?.description??""}/></label>
    <label className={label}>Foto<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={input}/></label>
    <label className="flex items-center gap-2"><input name="is_published" type="checkbox" defaultChecked={person?.is_published??false}/> Publicar</label>
    <button className={button}>{person?"Salvar pessoa":"Adicionar pessoa"}</button>
   </form>{person&&<form action={deleteInfoItem} className="mt-3"><input name="table" value="special_people" type="hidden"/><input name="id" value={person.id} type="hidden"/><button className="text-sm text-red-700 underline">Excluir pessoa</button></form>}
  </article>)}</section>
  <section className="space-y-4"><h2 className="font-editorial text-3xl">Perguntas frequentes</h2>
  {[...data.faqs,null].map(faq=><article className="card-soft p-6" key={faq?.id??"new"}><form action={saveFaq} className="grid gap-4">
   {faq&&<input type="hidden" name="id" value={faq.id}/>}
   <label className={label}>Pergunta *<input name="question" required className={input} defaultValue={faq?.question??""}/></label>
   <label className={label}>Resposta *<textarea name="answer" required rows={3} className={input} defaultValue={faq?.answer??""}/></label>
   <div className="flex flex-wrap items-center gap-5"><label className={label}>Ordem<input type="number" min="0" name="sort_order" className={input} defaultValue={faq?.sort_order??0}/></label><label className="flex items-center gap-2"><input name="is_active" type="checkbox" defaultChecked={faq?.is_active??false}/> Publicar</label></div>
   <button className={button}>{faq?"Salvar pergunta":"Adicionar pergunta"}</button>
  </form>{faq&&<form action={deleteInfoItem} className="mt-3"><input type="hidden" name="table" value="faqs"/><input type="hidden" name="id" value={faq.id}/><button className="text-sm text-red-700 underline">Excluir pergunta</button></form>}</article>)}</section>
  <section className="space-y-4"><h2 className="font-editorial text-3xl">Hospedagem</h2>
  {[...data.hotels,null].map(hotel=><article className="card-soft p-6" key={hotel?.id??"new"}><form action={saveHotel} className="grid gap-4 sm:grid-cols-2">
   {hotel&&<input type="hidden" name="id" value={hotel.id}/>}
   <label className={label}>Hotel *<input name="name" required className={input} defaultValue={hotel?.name??""}/></label>
   <label className={label}>Endereço<input name="address" className={input} defaultValue={hotel?.address??""}/></label>
   <label className={label+" sm:col-span-2"}>Link oficial (HTTPS)<input type="url" name="website_url" className={input} defaultValue={hotel?.website_url??""}/></label>
   <label className={label+" sm:col-span-2"}>Observações<textarea name="notes" rows={2} className={input} defaultValue={hotel?.notes??""}/></label>
   <label className={label}>Ordem<input type="number" min="0" name="sort_order" className={input} defaultValue={hotel?.sort_order??0}/></label>
   <label className="flex items-center gap-2"><input type="checkbox" name="is_published" defaultChecked={hotel?.is_published??false}/> Publicar</label>
   <button className={button}>{hotel?"Salvar hotel":"Adicionar hotel"}</button>
  </form>{hotel&&<form action={deleteInfoItem} className="mt-3"><input type="hidden" name="table" value="recommended_hotels"/><input type="hidden" name="id" value={hotel.id}/><button className="text-sm text-red-700 underline">Excluir hotel</button></form>}</article>)}</section>
 </div>;
}
