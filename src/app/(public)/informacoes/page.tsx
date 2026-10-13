import { notFound } from "next/navigation";
import { getAppearance } from "@/services/wedding/appearance";
import { SectionTitle } from "@/components/ui/section-title";
import { getPublicGuestInformation } from "@/services/wedding/guest-information";
export const metadata={title:"Informações para convidados"};
export default async function InfoPage(){
 if(!(await getAppearance()).visible.informacoes) notFound();
 const {info,faqs,hotels}=await getPublicGuestInformation();
 const hasDress=Boolean(info?.dress_title||info?.dress_description||info?.colors_to_avoid);
 const hasTransport=Boolean(info?.transport_text||info?.parking_text);
 return <section className="section-space pt-32"><div className="page-shell max-w-5xl">
  <SectionTitle eyebrow="Informações" title="Tudo para aproveitar o nosso grande dia" description="Orientações para convidados, atualizadas pelos noivos."/>
  {!(hasDress||hasTransport||hotels.length||faqs.length)&&<p className="mt-10 text-center text-muted">Em breve compartilharemos mais informações sobre o casamento.</p>}
  {(hasDress||hasTransport)&&<div className="mt-12 grid gap-5 md:grid-cols-2">
   {hasDress&&<article className="card-soft p-7"><h2 className="font-editorial text-3xl">O que vestir</h2>{info?.dress_title&&<p className="mt-4 font-semibold">{info.dress_title}</p>}{info?.dress_description&&<p className="mt-3 whitespace-pre-line text-muted">{info.dress_description}</p>}{info?.colors_to_avoid&&<p className="mt-3 text-muted">Cores a evitar: {info.colors_to_avoid}</p>}</article>}
   {hasTransport&&<article className="card-soft p-7"><h2 className="font-editorial text-3xl">Como chegar</h2>{info?.transport_text&&<p className="mt-4 whitespace-pre-line text-muted">{info.transport_text}</p>}{info?.parking_text&&<p className="mt-3 whitespace-pre-line text-muted"><strong>Estacionamento:</strong> {info.parking_text}</p>}</article>}
  </div>}
  {hotels.length>0&&<section className="mt-16"><h2 className="font-editorial text-4xl">Hospedagem</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{hotels.map(h=><article className="card-soft p-6" key={h.id}><h3 className="text-xl font-semibold">{h.name}</h3>{h.address&&<p className="mt-2 text-muted">{h.address}</p>}{h.notes&&<p className="mt-2 whitespace-pre-line text-muted">{h.notes}</p>}{h.website_url&&<a href={h.website_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block underline">Visitar site do hotel</a>}</article>)}</div></section>}
  {faqs.length>0&&<section className="mt-16"><h2 className="font-editorial text-4xl">Perguntas frequentes</h2><div className="mt-6 space-y-3">{faqs.map(f=><details key={f.id} className="card-soft p-5"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-3 whitespace-pre-line text-muted">{f.answer}</p></details>)}</div></section>}
 </div></section>;
}
