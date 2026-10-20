"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { action: (form: FormData) => Promise<{ ok: boolean; error?: string }>; weddingId: string };

export function GalleryUploadForm({ action, weddingId }: Props) {
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const file = data.get("image");
    const alt = String(data.get("alt") ?? "").trim();
    const caption = String(data.get("caption") ?? "").trim();
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        !alt || alt.length > 200 || caption.length > 500) {
      setError("Selecione uma imagem JPG, PNG ou WEBP de até 5 MB e confira os campos.");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    const client = createSupabaseBrowserClient();
    if (!client) {
      setError("Não foi possível acessar o serviço de imagens.");
      submitting.current = false;
      setBusy(false);
      return;
    }
    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `${weddingId}/gallery/${crypto.randomUUID()}.${ext}`;
    try {
      // O arquivo vai do navegador ao Storage, sem atravessar a função da Vercel.
      const { error: uploadError } = await client.storage.from("wedding-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw new Error("Falha ao enviar a imagem ao Supabase Storage.");
      const metadata = new FormData();
      metadata.set("path", path);
      metadata.set("alt", alt);
      metadata.set("caption", caption);
      let result: { ok: boolean; error?: string };
      try {
        result = await action(metadata);
      } catch {
        await client.storage.from("wedding-media").remove([path]);
        throw new Error("Não foi possível registrar a imagem. Tente novamente.");
      }
      if (!result.ok) {
        await client.storage.from("wedding-media").remove([path]);
        throw new Error(result.error ?? "Não foi possível registrar a imagem.");
      }
      form.reset();
      router.replace("/admin/galeria?saved=1");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha no envio. Tente novamente.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return <form onSubmit={upload} className="card-soft grid gap-4 p-5 sm:p-6" aria-busy={busy}>
    <div><h2 className="text-xl font-semibold">Adicionar foto</h2><p className="mt-1 text-sm text-muted">Envie uma imagem por vez, até 5 MB.</p></div>
    {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    <label className="text-sm font-semibold">Imagem *<input type="file" name="image" accept="image/jpeg,image/png,image/webp" required disabled={busy} className="mt-1 block w-full rounded-lg border border-line p-3 font-normal"/></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Descrição acessível *<input name="alt" required maxLength={200} disabled={busy} className="mt-1 w-full rounded-lg border border-line p-3 font-normal"/></label><label className="text-sm font-semibold">Legenda<input name="caption" maxLength={500} disabled={busy} className="mt-1 w-full rounded-lg border border-line p-3 font-normal"/></label></div>
    <button type="submit" disabled={busy} aria-busy={busy} className="admin-btn admin-btn--primary w-fit">{busy ? "Enviando foto..." : "Enviar foto"}</button>
  </form>;
}
