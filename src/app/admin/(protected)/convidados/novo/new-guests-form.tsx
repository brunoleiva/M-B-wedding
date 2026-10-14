"use client";
import Link from "next/link";
import { useState } from "react";
import { saveGuestsBatch } from "../actions";
import type { GroupRecord, GuestKind, GuestStatus } from "@/services/rsvp/types";
import { kindLabel, statusLabel } from "@/services/rsvp/types";

type Draft = { key: number; full_name: string; kind: GuestKind; rsvp_status: GuestStatus; guest_note: string };
const blank = (key: number): Draft => ({ key, full_name: "", kind: "adult", rsvp_status: "pending", guest_note: "" });

export function NewGuestsForm({ groups, initialGroupId, error }: { groups: GroupRecord[]; initialGroupId?: string; error?: string }) {
  const [guests, setGuests] = useState<Draft[]>([blank(0)]);
  const [nextKey, setNextKey] = useState(1);
  const [busy, setBusy] = useState(false);
  const [groupId, setGroupId] = useState(initialGroupId ?? "");
  const update = (key: number, field: keyof Omit<Draft, "key">, value: string) => {
    setGuests(current => current.map(guest => guest.key === key ? { ...guest, [field]: value } : guest));
  };
  const append = () => {
    if (guests.length >= 50 || busy) return;
    setGuests(current => [...current, blank(nextKey)]);
    setNextKey(value => value + 1);
  };
  return <div className="mx-auto max-w-3xl space-y-6">
    <Link className="admin-btn admin-btn--back w-fit" href="/admin/convidados">← Voltar aos convidados</Link>
    <header><p className="eyebrow">Cadastro de convidados</p><h1 className="font-editorial text-4xl">Novos convidados</h1><p className="mt-2 text-muted">Escolha a família e adicione uma ou mais pessoas antes de salvar.</p></header>
    {error && <p role="alert" className="rounded-xl border border-red-300 p-4 text-sm font-semibold text-red-800">Não foi possível cadastrar. Confira os campos e tente novamente.</p>}
    <section className="card-soft p-5 sm:p-8">
      <form action={saveGuestsBatch} onSubmit={event => {
        if (busy) { event.preventDefault(); return; }
        if (guests.some(g => !g.full_name.trim())) { event.preventDefault(); return; }
        setBusy(true);
      }} className="space-y-6">
        <label className="block font-semibold">Família ou convite
          <select className="guest-input" name="guest_group_id" value={groupId} onChange={e => setGroupId(e.target.value)} required>
            <option value="" disabled>Selecione uma família ou convite</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.display_name}</option>)}
          </select>
        </label>
        <input type="hidden" name="guests_json" value={JSON.stringify(guests.map(({full_name,kind,rsvp_status,guest_note}) => ({full_name,kind,rsvp_status,guest_note})))}/>
        {guests.map((guest, index) => <fieldset key={guest.key} disabled={busy} className="space-y-4 rounded-2xl border border-line p-4 sm:p-5">
          <legend className="font-semibold">Convidado {index + 1}</legend><div className="flex justify-end">{guests.length > 1 && <button type="button" className="admin-btn admin-btn--danger" onClick={() => setGuests(current => current.filter(g => g.key !== guest.key))}>Remover</button>}</div>
          <label className="block font-semibold">Nome completo<input className="guest-input" value={guest.full_name} onChange={e => update(guest.key,"full_name",e.target.value)} required maxLength={180}/></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="font-semibold">Tipo<select className="guest-input" value={guest.kind} onChange={e => update(guest.key,"kind",e.target.value)}>{(["adult","child","companion"] as GuestKind[]).map(kind => <option key={kind} value={kind}>{kindLabel(kind)}</option>)}</select></label>
          <label className="font-semibold">Presença<select className="guest-input" value={guest.rsvp_status} onChange={e => update(guest.key,"rsvp_status",e.target.value)}>{(["pending","attending","not_attending"] as GuestStatus[]).map(status => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label></div>
          <label className="block font-semibold">Observações (opcional)<textarea className="guest-input min-h-20" maxLength={1000} value={guest.guest_note} onChange={e => update(guest.key,"guest_note",e.target.value)}/></label>
        </fieldset>)}
        <button type="button" onClick={append} disabled={busy || guests.length >= 50} className="admin-btn admin-btn--secondary">+ Adicionar convidado</button>
        <p className="text-sm text-muted">{guests.length} convidado(s) neste cadastro. Máximo: 50 por envio.</p>
        <div className="flex flex-wrap gap-3"><button disabled={busy || !groupId} type="submit" className="admin-btn admin-btn--primary">{busy ? "Salvando..." : `Cadastrar ${guests.length} convidado(s)`}</button><Link href="/admin/convidados" className="admin-btn admin-btn--secondary">Cancelar</Link></div>
      </form>
    </section>
  </div>;
}
