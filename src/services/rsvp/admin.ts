import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { GuestRecord, GroupRecord } from "./types";

export async function loadGuests(weddingId:string) {
 const db=await createSupabaseServerClient();
 if(!db) throw new Error("Database unavailable");
 const groups: GroupRecord[]=[]; const guests: GuestRecord[]=[];
 // Supabase returns up to 1,000 rows per request: page explicitly.
 for(let offset=0;;offset+=500){
  const {data,error}=await db.from("guest_groups").select("id,display_name,invitation_token,max_extra_guests,phone").eq("wedding_id",weddingId).is("deleted_at",null).order("created_at").range(offset,offset+499);
  if(error)throw error;
  groups.push(...(data??[]) as GroupRecord[]);
  if(!data||data.length<500) break;
 }
 for(let offset=0;;offset+=500){
  const {data,error}=await db.from("guests").select("id,guest_group_id,full_name,kind,rsvp_status,dietary_restrictions,guest_note,responded_at").eq("wedding_id",weddingId).is("deleted_at",null).order("created_at").range(offset,offset+499);
  if(error)throw error;
  guests.push(...(data??[]) as GuestRecord[]);
  if(!data||data.length<500) break;
 }
 return {groups,guests};
}
