import type {GiftPayment} from "./types";

/** Visual only: keep the financial status pending until an admin reviews it. */
export function isGiftReservationExpired(payment: Pick<GiftPayment,"status"|"expires_at">): boolean {
  return payment.status === "pending_confirmation" &&
    Boolean(payment.expires_at && new Date(payment.expires_at).getTime() <= Date.now());
}
