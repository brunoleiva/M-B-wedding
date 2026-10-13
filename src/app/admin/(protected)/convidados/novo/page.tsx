import Link from "next/link";
import {getAdminContext} from "@/services/admin/dashboard";
import {loadGuests} from "@/services/rsvp/admin";
import {GuestEditor} from "../guest-form";
export default async function NewGuest({searchParams}:{searchParams:Promise<{error?:string;group?:string}>}){const ctx=await getAdminContext();if(!ctx)return null;const {groups}=await loadGuests(ctx.weddingId);if(!groups.length)return <p>Crie primeiro uma <Link className="underline" href="/admin/convidados/familias/nova">família ou convite</Link>.</p>;const query=await searchParams;const initialGroupId=groups.some(g=>g.id===query.group)?query.group:undefined;return <GuestEditor groups={groups} initialGroupId={initialGroupId} params={query}/>}
