import {notFound} from "next/navigation";
import {getAdminContext} from "@/services/admin/dashboard";
import {loadGuests} from "@/services/rsvp/admin";
import {FamilyEditor} from "../family-form";
import { BulkGuestEntry } from "@/components/admin/bulk-guest-entry";
export default async function FamilyDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;error?:string;added?:string}>}){const ctx=await getAdminContext();if(!ctx)return null;const {id}=await params;const {groups,guests}=await loadGuests(ctx.weddingId);const group=groups.find(g=>g.id===id);if(!group)notFound();const query=await searchParams;return <><FamilyEditor group={group} members={guests.filter(g=>g.guest_group_id===id)} params={query}/><div className="mx-auto mt-6 max-w-4xl space-y-4">{query.added&&<p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 font-semibold text-green-900">{query.added} convidado(s) cadastrado(s) nesta família!</p>}<BulkGuestEntry groupId={group.id}/></div></>;}
