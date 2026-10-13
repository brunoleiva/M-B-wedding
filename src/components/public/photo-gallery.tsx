"use client";
import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/services/wedding/content";

export function PhotoGallery({photos}:{photos:GalleryItem[]}) {
  const [active,setActive]=useState<number|null>(null);
  return <><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{photos.map((photo,index)=><button type="button" key={photo.id} onClick={()=>setActive(index)} className="group relative aspect-[3/4] overflow-hidden rounded-2xl text-left focus-visible:outline-4 focus-visible:outline-brand" aria-label={`Ampliar foto: ${photo.alt}`}><Image unoptimized src={photo.url} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform group-hover:scale-105"/>{photo.caption&&<span className="absolute inset-x-0 bottom-0 bg-black/55 p-3 text-xs text-white">{photo.caption}</span>}</button>)}</div>
  {active!==null&&<div role="dialog" aria-modal="true" aria-label="Visualizar foto" className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 text-white"><div className="flex justify-end"><button autoFocus type="button" className="rounded-lg border px-4 py-2" onClick={()=>setActive(null)}>Fechar ×</button></div><div className="relative min-h-0 flex-1"><Image unoptimized src={photos[active].url} alt={photos[active].alt} fill sizes="100vw" className="object-contain"/></div><div className="flex items-center justify-between gap-4 py-3"><button type="button" className="rounded border px-4 py-2" onClick={()=>setActive((active+photos.length-1)%photos.length)}>Anterior</button><p className="text-center text-sm">{photos[active].caption||photos[active].alt} · {active+1}/{photos.length}</p><button type="button" className="rounded border px-4 py-2" onClick={()=>setActive((active+1)%photos.length)}>Próxima</button></div></div>}</>;
}
