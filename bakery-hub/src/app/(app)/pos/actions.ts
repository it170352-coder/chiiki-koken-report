"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/store";
import type { CartItem } from "@/lib/types";

export async function completeSale(
  cartItems: CartItem[],
  paymentMethod: "cash" | "card" | "other",
  cashReceived: number | null
): Promise<{ saleId: string | null; error: string | null }> {
  const { supabase, userId, storeId } = await getCurrentStore();

  if (!userId || !storeId) {
    return { saleId: null, error: "ログインが必要です" };
  }

  if (cartItems.length === 0) {
    return { saleId: null, error: "カートが空です" };
  }

  const items = cartItems.map((ci) => ({
    product_id: ci.product.id,
    product_name: ci.product.name,
    unit_price: ci.product.price,
    tax_rate: ci.product.tax_rate,
    quantity: ci.quantity,
  }));

  const { data, error } = await supabase.rpc("create_sale", {
    p_store_id: storeId,
    p_staff_id: userId,
    p_customer_id: null,
    p_items: items,
    p_payment_method: paymentMethod,
    p_cash_received: paymentMethod === "cash" ? cashReceived : null,
  });

  if (error) {
    console.error("create_sale error:", error);
    return { saleId: null, error: "会計処理に失敗しました: " + error.message };
  }

  return { saleId: data as string, error: null };
}

export async function getSaleWithItems(saleId: string) {
  const supabase = await createClient();

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .single();

  if (saleError || !sale) {
    return { sale: null, items: [], store: null };
  }

  const { data: items } = await supabase
    .from("sale_items")
    .select("*")
    .eq("sale_id", saleId)
    .order("id");

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", sale.store_id)
    .single();

  return { sale, items: items ?? [], store };
}
