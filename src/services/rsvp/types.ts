export type GuestStatus = "pending" | "attending" | "not_attending";
export type GuestKind = "adult" | "child" | "companion";
export type GuestRecord = { id: string; guest_group_id: string; full_name: string; kind: GuestKind; rsvp_status: GuestStatus; dietary_restrictions: string | null; guest_note: string | null; responded_at: string | null };
export type GroupRecord = {id:string;display_name:string;invitation_token:string;max_extra_guests:number;phone:string|null};
export const statusLabel = (status: GuestStatus) => status === "attending" ? "Confirmado" : status === "not_attending" ? "Não irá" : "Aguardando";
export const kindLabel = (kind: GuestKind) => kind === "child" ? "Criança" : kind === "companion" ? "Acompanhante" : "Adulto";
