import { getAdminContext } from "@/services/admin/dashboard";
import { getAppearance, sections } from "@/services/wedding/appearance";
import { saveAppearance } from "./actions";

const labels = {background_color:"Fundo",surface_color:"Cards e superfícies",foreground_color:"Texto principal",brand_color:"Cor principal",accent_color:"Detalhes e destaques"};
export default async function AppearancePage({searchParams}:{searchParams:Promise<{saved?:string;error?:string}>}){
 const ctx=await getAdminContext();
 const appearance=await getAppearance(ctx?.weddingId);
 const params=await searchParams;
 return <div className="mx-auto max-w-4xl space-y-8">
   <header><p className="eyebrow">Personalização</p><h1 className="font-editorial mt-3 text-4xl">Aparência e seções</h1><p className="mt-2 text-muted">Personalize as cores e escolha o que os convidados podem acessar.</p></header>
   {params.saved&&<p role="status" className="rounded-xl border border-brand p-4">Alterações salvas. O site público já utiliza essas configurações.</p>}
   {params.error&&<p role="alert" className="rounded-xl border border-danger p-4 text-danger">Não foi possível salvar ({params.error}). Verifique os campos e tente novamente.</p>}
   <form action={saveAppearance} className="space-y-8">
     <section className="card-soft space-y-6 p-6"><h2 className="font-editorial text-3xl">Cores do site</h2><p className="text-sm text-muted">O painel administrativo mantém sua aparência para facilitar a leitura.</p>
       <div className="grid gap-4 sm:grid-cols-2">{(Object.entries(labels) as [keyof typeof labels,string][]).map(([key,label])=><label key={key} className="flex items-center gap-4 rounded-xl border border-line p-3"><input aria-label={label} name={key} type="color" defaultValue={appearance.colors[key]} className="h-12 w-16 cursor-pointer rounded border border-line"/><span className="font-medium">{label}</span></label>)}</div>
     </section>
     <section className="card-soft space-y-5 p-6"><h2 className="font-editorial text-3xl">Seções visíveis</h2><p className="text-sm text-muted">Se uma seção for desativada, ela desaparece do menu, da Home e de sua página pública. Os dados cadastrados são preservados.</p>
       <div className="grid gap-3 sm:grid-cols-2">{sections.map(s=><label key={s.key} className="flex items-center gap-3 rounded-xl border border-line p-4"><input type="checkbox" name="visible" value={s.key} defaultChecked={appearance.visible[s.key]} className="size-5 accent-brand"/><span>{s.title}</span></label>)}</div>
     </section>
     <button type="submit" className="focus-ring min-h-12 rounded-full bg-brand px-8 font-semibold text-white">Salvar personalização</button>
   </form>
 </div>;
}
