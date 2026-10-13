import {notFound} from "next/navigation";
import {getAdminContext} from "@/services/admin/dashboard";
import {loadGuests} from "@/services/rsvp/admin";
import {FamilyEditor} from "../family-form";
export default async function FamilyDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;error?:string}>}){const ctx=await getAdminContext();if(!ctx)return null;const {id}=await params;const {groups,guests}=await loadGuests(ctx.weddingId);const group=groups.find(g=>g.id===id);if(!group)notFound();return <FamilyEditor group={group} members={guests.filter(g=>g.guest_group_id===id)} params={await searchParams}/>}
