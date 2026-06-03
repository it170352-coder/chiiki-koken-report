export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  memo: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

export const PRODUCT_CATEGORIES = [
  "食事パン",
  "菓子パン",
  "惣菜パン",
  "デニッシュ・ペストリー",
  "サンドイッチ",
  "焼き菓子・その他",
] as const;

export type ReservationStatus = "pending" | "ready" | "completed" | "cancelled";

export type Reservation = {
  id: string;
  user_id: string;
  customer_id: string | null;
  pickup_at: string;
  status: ReservationStatus;
  memo: string | null;
  created_at: string;
};

export type ReservationItem = {
  id: string;
  reservation_id: string;
  product_id: string | null;
  quantity: number;
};

export type InventoryLog = {
  id: string;
  user_id: string;
  product_id: string;
  date: string;
  produced: number;
  sold: number;
  wasted: number;
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "予約受付",
  ready: "準備完了",
  completed: "受取済",
  cancelled: "キャンセル",
};

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  ready: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};
