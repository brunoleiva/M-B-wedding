import {notFound} from "next/navigation";
import {getAdminContext} from "@/services/admin/dashboard";
import {loadGuests} from "@/services/rsvp/admin";
import {GuestEditor} from "../guest-form";
export default async function GuestDetails({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;removed?:string;error?:string}>}){const ctx=await getAdminContext();if(!ctx)return null;const {id}=await params;const {guests,groups}=await loadGuests(ctx.weddingId);const guest=guests.find(g=>g.id===id);if(!guest)notFound();return <GuestEditor guest={guest} groups={groups} params={await searchParams}/>}
