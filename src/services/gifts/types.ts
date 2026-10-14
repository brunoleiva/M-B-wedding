export type GiftKind = "symbolic" | "physical" | "contribution";
export type GiftAvailability = "unlimited" | "limited";
export type PaymentStatus = "pending_confirmation" | "confirmed" | "rejected";

export type Gift = {
  id: string;
  wedding_id: string;
  category_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  image_path: string | null;
  amount_cents: number;
  gift_kind: GiftKind;
  availability_kind: GiftAvailability;
  quantity_total: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type GiftCategory = {
  id: string;
  wedding_id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type GiftPayment = {
  id: string;
  gift_id: string | null;
  guest_name: string;
  message: string | null;
  amount_cents: number;
  quantity: number;
  status: PaymentStatus;
  admin_note: string | null;
  confirmed_at: string | null;
  created_at: string;
};

export const formatGiftAmount = (cents: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
