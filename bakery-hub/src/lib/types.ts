export type StoreRole = "owner" | "manager" | "employee" | "parttime";

export const STORE_ROLE_LABELS: Record<StoreRole, string> = {
  owner: "オーナー",
  manager: "店長",
  employee: "社員",
  parttime: "アルバイト",
};

export type CustomerMode = "individual" | "corporate";

export type Store = {
  id: string;
  name: string;
  pickup_start: string | null;
  pickup_end: string | null;
  closed_days: string;
  closed_dates: string;
  customer_mode: CustomerMode;
  created_at: string;
};

export type StoreMember = {
  store_id: string;
  user_id: string;
  role: StoreRole;
  created_at: string;
};

export type CustomerType = "individual" | "corporate";

export type Customer = {
  id: string;
  store_id: string;
  user_id: string;
  name: string;
  customer_type: CustomerType;
  contact_person: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  memo: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  user_id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
  // POSフェーズ1で追加
  tax_rate: number;
  stock_quantity: number;
  stock_managed: boolean;
  display_order: number;
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
  store_id: string;
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
  store_id: string;
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

export const STATUS_LABELS_CORPORATE: Record<ReservationStatus, string> = {
  pending: "注文受付",
  ready: "準備完了",
  completed: "納品済",
  cancelled: "キャンセル",
};

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  ready: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

// POSレジ関連型
export type Sale = {
  id: string;
  store_id: string;
  staff_id: string | null;
  customer_id: string | null;
  receipt_number: string;
  subtotal: number;
  tax_8_amount: number;
  tax_10_amount: number;
  total_amount: number;
  payment_method: "cash" | "card" | "other";
  cash_received: number | null;
  change_amount: number | null;
  status: "completed" | "voided";
  sold_at: string;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  tax_rate: number;
  quantity: number;
  subtotal: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Ingredient = {
  id: string;
  store_id: string;
  category: string;
  name: string;
  unit: string;
  stock_quantity: number;
  minimum_stock: number;
  purchase_price: number;
  supplier: string | null;
  expiration_date: string | null;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeItem = {
  id: string;
  store_id: string;
  product_id: string;
  ingredient_id: string;
  usage_quantity: number;
  unit: string;
};

export type IngredientStatus = 'normal' | 'caution' | 'order';

export function getIngredientStatus(ingredient: Ingredient): IngredientStatus {
  if (ingredient.stock_quantity <= 0) return 'order';
  if (ingredient.stock_quantity <= ingredient.minimum_stock) return 'order';
  if (ingredient.stock_quantity <= ingredient.minimum_stock * 1.5) return 'caution';
  return 'normal';
}

export const INGREDIENT_CATEGORIES = [
  "粉類",
  "乳製品・卵",
  "砂糖・甘味料",
  "油脂類",
  "酵母・膨張剤",
  "塩・スパイス",
  "フルーツ・野菜",
  "チョコ・ナッツ",
  "包装資材",
  "その他",
] as const;
